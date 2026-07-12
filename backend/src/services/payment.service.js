// Payment service — business logic for the Razorpay UPI flow. Never
// creates an Order directly; that's always done by reusing
// order.service.js's buildOrderInTransaction, once a payment is verified.

import crypto from "crypto";
import prisma from "../config/prisma.js";
import {
  razorpay,
  isRazorpayConfigured,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET,
} from "../config/razorpay.js";
import { paymentIntentRepository } from "../repositories/paymentIntent.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { buildOrderInTransaction } from "./order.service.js";
import { emailService } from "./email.service.js";
import { smsService } from "./sms.service.js";
import { ApiError } from "../utils/ApiError.js";

// Kept in sync with order.service.js / src/lib/pricing.js — the preview
// shown before payment and the amount actually charged must agree.
const FREE_SHIPPING_THRESHOLD = 1999;
const FLAT_SHIPPING_FEE = 99;

function requireConfigured() {
  if (!isRazorpayConfigured) {
    throw new ApiError(
      503,
      "UPI payments aren't available right now. Please choose Cash on Delivery, or try again shortly."
    );
  }
}

// Shared by verifyPayment and the webhook — idempotent. If the intent was
// already finalized by the other path (the customer's browser called
// /verify AND the webhook fired for the same payment, which is expected,
// not a bug), this returns the existing order instead of building a
// second one. See paymentIntentRepository.claimForFinalization for how the
// race is actually decided.
async function finalizePaidIntent(intent, transactionId) {
  const { order, isNewlyFinalized } = await prisma.$transaction(async (tx) => {
    const { count } = await paymentIntentRepository.claimForFinalization(intent.id, transactionId, tx);

    if (count === 0) {
      // Lost the race — the winner's whole transaction (including
      // attaching orderId) has already committed by the time our blocked
      // UPDATE unblocks and sees 0 rows, so this read is safe.
      const current = await paymentIntentRepository.findById(intent.id, tx);
      if (current.orderId) {
        const existingOrder = await tx.order.findUnique({
          where: { id: current.orderId },
          include: { items: true, address: true, payment: true },
        });
        return { order: existingOrder, isNewlyFinalized: false };
      }
      throw new ApiError(409, "This payment is still being processed. Check your order history shortly.");
    }

    const { items, shipping } = intent.cartSnapshot;
    const newOrder = await buildOrderInTransaction(tx, intent.userId, {
      items,
      shipping,
      paymentMethod: "UPI",
      paymentStatus: "SUCCESS",
      transactionId,
      paidAt: new Date(),
    });

    await paymentIntentRepository.attachOrder(intent.id, newOrder.id, tx);

    return { order: newOrder, isNewlyFinalized: true };
  });

  // Fire-and-forget, and only on the winning branch — a browser /verify
  // call racing the webhook for the same payment must never send this
  // pair of emails twice (see the module comment above on why this
  // function is idempotent in the first place).
  if (isNewlyFinalized) {
    const user = await userRepository.findById(intent.userId);
    if (user) {
      emailService.sendOrderConfirmationEmail(order, user);
      emailService.sendPaymentSuccessEmail(order, user);
    }
    smsService.sendOrderPlacedSms(order);
  }

  return order;
}

export const paymentService = {
  async initiateCheckout(userId, { items, shipping }) {
    requireConfigured();

    // Validate stock/price up front — never trust client-submitted prices,
    // and no reason to send the customer to pay for something that's
    // already out of stock. Stock is re-checked again at finalize time
    // regardless, since real time passes while they're paying.
    let subtotal = 0;
    for (const { productId, quantity } of items) {
      const product = await productRepository.findBySlug(productId);
      if (!product) {
        throw new ApiError(404, `Product no longer available: ${productId}`);
      }
      if (product.stockQuantity < quantity) {
        throw new ApiError(
          409,
          `${product.name} doesn't have enough stock (only ${product.stockQuantity} left)`
        );
      }
      subtotal += Number(product.price) * quantity;
    }

    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
    const total = subtotal + shippingFee;

    const gatewayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100), // Razorpay wants the amount in paise
      currency: "INR",
      receipt: `xv_${Date.now()}`,
    });

    await paymentIntentRepository.create({
      userId,
      gatewayOrderId: gatewayOrder.id,
      amount: total,
      cartSnapshot: { items, shipping },
    });

    return {
      razorpayOrderId: gatewayOrder.id,
      amount: gatewayOrder.amount,
      currency: gatewayOrder.currency,
      keyId: RAZORPAY_KEY_ID,
    };
  },

  async verifyPayment(userId, { razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    requireConfigured();

    const intent = await paymentIntentRepository.findByGatewayOrderId(razorpay_order_id);
    if (!intent || intent.userId !== userId) {
      throw new ApiError(404, "Payment not found");
    }

    // Razorpay's documented verification formula: HMAC-SHA256 of
    // "{order_id}|{payment_id}" using the (server-only) key secret.
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await paymentIntentRepository.markFailed(intent.id, "Signature verification failed");
      throw new ApiError(400, "Payment verification failed");
    }

    if (intent.status === "FAILED") {
      throw new ApiError(400, "This payment was already marked as failed");
    }

    return finalizePaidIntent(intent, razorpay_payment_id);
  },

  // Called by payment.controller.js with the raw request bytes (needed for
  // signature verification) and the X-Razorpay-Signature header.
  async handleWebhookEvent(rawBody, signatureHeader) {
    if (!isRazorpayConfigured || !RAZORPAY_WEBHOOK_SECRET) {
      throw new ApiError(503, "Webhook is not configured");
    }

    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signatureHeader) {
      throw new ApiError(400, "Invalid webhook signature");
    }

    const event = JSON.parse(rawBody.toString("utf8"));

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const intent = await paymentIntentRepository.findByGatewayOrderId(payment.order_id);
      // Unknown order_id or already finalized (via /verify) — idempotent
      // no-op either way, not an error worth surfacing to Razorpay.
      if (intent && intent.status === "CREATED") {
        await finalizePaidIntent(intent, payment.id);
      }
    } else if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;
      const intent = await paymentIntentRepository.findByGatewayOrderId(payment.order_id);
      if (intent) {
        await paymentIntentRepository.markFailed(intent.id, payment.error_description || "Payment failed");
      }
    }

    return { received: true };
  },
};
