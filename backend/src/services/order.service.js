// Order service — business logic only, mirrors the layering already
// established by auth/admin/product services. This is the one service so
// far that needs a real database transaction: placing an order touches
// Address, Order, OrderItem, Payment, and Product.stockQuantity together,
// and a failure partway through (a stock shortfall, an order-number
// collision) must roll back everything rather than leave a half-written
// order behind.
//
// `buildOrderInTransaction` is exported so payment.service.js (Razorpay
// UPI flow) can build an order from an already-verified payment using the
// exact same stock/pricing/order-number logic as the COD path below,
// rather than a second copy that could drift out of sync with this one.

import prisma from "../config/prisma.js";
import { orderRepository } from "../repositories/order.repository.js";
import { addressRepository } from "../repositories/address.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { couponRepository } from "../repositories/coupon.repository.js";
import { computeCouponDiscount, assertEligible } from "./coupon.service.js";
import { emailService } from "./email.service.js";
import { smsService } from "./sms.service.js";
import { ApiError } from "../utils/ApiError.js";

// Kept in sync with src/lib/pricing.js on the frontend — that copy is only
// a pre-submit preview; this is the authoritative calculation.
const FREE_SHIPPING_THRESHOLD = 1999;
const FLAT_SHIPPING_FEE = 99;

const MAX_ORDER_NUMBER_ATTEMPTS = 3;

function generateOrderNumber(sequence) {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  return `XV-${y}${m}${d}-${String(sequence).padStart(4, "0")}`;
}

// Resolves a `coupon` param (see buildOrderInTransaction) into what actually
// gets stored on the Order — `{ couponId, couponCode, discountAmount }`. Two
// modes, matching the two callers below:
//
// - "validate" (COD, via orderService.createOrder): nothing has been
//   charged yet, so this re-fetches the coupon fresh and re-runs every
//   eligibility check against the just-computed server-side subtotal —
//   never trusts a client-sent discount amount. If the coupon's usage limit
//   gets claimed by someone else in the same instant (claimUsage's count
//   is 0), this throws and the whole transaction rolls back cleanly, since
//   no money has moved for COD.
//
// - "trust" (UPI, via payment.service.js's finalizePaidIntent): the
//   customer has already paid the discounted amount Razorpay collected at
//   initiateCheckout time, so the discount is used as-is rather than
//   recomputed, and a lost usage-limit race is logged rather than thrown —
//   rejecting an already-paid order would leave the customer charged with
//   nothing to show for it, a worse outcome than a coupon narrowly
//   exceeding its usageLimit in a rare race window.
async function resolveCoupon(tx, subtotal, coupon) {
  if (!coupon) {
    return { couponId: null, couponCode: null, discountAmount: 0 };
  }

  const freshCoupon = await couponRepository.findByCode(coupon.code.toUpperCase(), tx);

  if (coupon.mode === "trust") {
    if (!freshCoupon) {
      // The coupon vanished entirely between checkout initiation and
      // payment confirmation — extremely unlikely, but the customer still
      // paid, so still honor the locked-in discount rather than fail the
      // order over it.
      return { couponId: null, couponCode: coupon.code, discountAmount: coupon.lockedDiscountAmount };
    }
    const { count } = await couponRepository.claimUsage(freshCoupon.id, freshCoupon.usageLimit, tx);
    if (count === 0) {
      console.warn(`Coupon ${freshCoupon.code} usage limit exceeded by an already-paid UPI order — honoring it anyway.`);
    }
    return { couponId: freshCoupon.id, couponCode: freshCoupon.code, discountAmount: coupon.lockedDiscountAmount };
  }

  assertEligible(freshCoupon);
  const discountAmount = computeCouponDiscount(freshCoupon, subtotal);
  if (discountAmount == null) {
    throw new ApiError(400, `Minimum order amount is ₹${freshCoupon.minOrderAmount}`);
  }

  const { count } = await couponRepository.claimUsage(freshCoupon.id, freshCoupon.usageLimit, tx);
  if (count === 0) {
    throw new ApiError(409, "This coupon just became unavailable. Please remove it and try again.");
  }

  return { couponId: freshCoupon.id, couponCode: freshCoupon.code, discountAmount };
}

// Builds one Order (+ OrderItems + Payment, and decrements stock) inside an
// already-open transaction. Caller owns the transaction and any
// retry-on-P2002 loop (see `createOrder` below and payment.service.js's
// finalize logic) — this function just does the work once per call.
//
// `paymentStatus`/`transactionId`/`paidAt` let a caller record a payment
// that's already been verified (UPI, via Razorpay) instead of the COD
// default of "collected on delivery, still PENDING".
export async function buildOrderInTransaction(
  tx,
  userId,
  { items, shipping, paymentMethod, paymentStatus = "PENDING", transactionId = null, paidAt = null, coupon = null }
) {
  // Re-fetch every line server-side — price and availability are never
  // trusted from the client cart.
  //
  // Note: this is a plain read-then-update, not a `SELECT ... FOR UPDATE`
  // row lock, so there's a narrow race window under high concurrent load
  // on the same SKU where two simultaneous orders could both pass this
  // check. Acceptable for this catalog's scale today; revisit with row
  // locking if order volume grows.
  const lines = [];
  for (const { productId, quantity } of items) {
    const product = await productRepository.findBySlug(productId, tx);
    if (!product) {
      throw new ApiError(404, `Product no longer available: ${productId}`);
    }
    if (product.stockQuantity < quantity) {
      throw new ApiError(
        409,
        `${product.name} doesn't have enough stock (only ${product.stockQuantity} left)`
      );
    }
    lines.push({ product, quantity });
  }

  const subtotal = lines.reduce(
    (sum, { product, quantity }) => sum + Number(product.price) * quantity,
    0
  );
  // Free-shipping threshold is deliberately checked against the pre-discount
  // subtotal — a coupon discounts the merchandise total, not the shipping
  // calculation itself.
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;

  const { couponId, couponCode, discountAmount } = await resolveCoupon(tx, subtotal, coupon);
  const total = subtotal + shippingFee - discountAmount;

  const address = await addressRepository.create({ userId, ...shipping }, tx);

  const sequence = (await orderRepository.countCreatedToday(tx)) + 1;
  const orderNumber = generateOrderNumber(sequence);

  const order = await orderRepository.create(
    {
      orderNumber,
      userId,
      addressId: address.id,
      subtotal,
      shippingFee,
      couponId,
      couponCode,
      discountAmount,
      total,
      paymentMethod,
      items: {
        create: lines.map(({ product, quantity }) => ({
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          quantity,
          lineTotal: Number(product.price) * quantity,
        })),
      },
      payment: {
        create: { method: paymentMethod, amount: total, status: paymentStatus, transactionId, paidAt },
      },
    },
    tx
  );

  for (const { product, quantity } of lines) {
    await productRepository.decrementStock(product.id, quantity, tx);
  }

  return order;
}

export const orderService = {
  async createOrder(userId, { items, shipping, paymentMethod, couponCode }) {
    const coupon = couponCode ? { code: couponCode, mode: "validate" } : null;

    for (let attempt = 1; attempt <= MAX_ORDER_NUMBER_ATTEMPTS; attempt++) {
      try {
        const order = await prisma.$transaction((tx) =>
          buildOrderInTransaction(tx, userId, { items, shipping, paymentMethod, coupon })
        );

        // Fire-and-forget — email.service.js/sms.service.js never block or
        // throw back into this flow, so a slow/failing SMTP server or SMS
        // gateway can never delay or fail order placement. Only reached
        // once the transaction has actually committed, never from inside it.
        const user = await userRepository.findById(userId);
        if (user) {
          emailService.sendOrderConfirmationEmail(order, user);
        }
        smsService.sendOrderPlacedSms(order);

        return order;
      } catch (err) {
        // Same-day orderNumber collision — recompute the sequence and
        // retry, same race-handling posture as auth.service.js's P2002
        // handling for duplicate emails.
        if (err.code === "P2002" && attempt < MAX_ORDER_NUMBER_ATTEMPTS) {
          continue;
        }
        throw err;
      }
    }
  },

  listOrders(userId) {
    return orderRepository.findAllByUser(userId);
  },
};
