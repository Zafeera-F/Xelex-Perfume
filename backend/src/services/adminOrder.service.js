// Admin order service — business logic only, mirrors the layering already
// established elsewhere. No order-status state-machine validation here by
// design: any OrderStatus/PaymentStatus enum value is accepted at any time
// (the validator only checks it's a real enum member) — this is admin
// discretion, not a workflow engine.

import prisma from "../config/prisma.js";
import { orderRepository } from "../repositories/order.repository.js";
import { paymentRepository } from "../repositories/payment.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import { emailService } from "./email.service.js";
import { smsService } from "./sms.service.js";
import { ApiError } from "../utils/ApiError.js";

// Maps an OrderStatus to the email.service.js sender that announces it —
// only statuses with a customer-facing email need an entry here.
const STATUS_EMAIL_SENDERS = {
  SHIPPED: "sendOrderShippedEmail",
  DELIVERED: "sendOrderDeliveredEmail",
  CANCELLED: "sendOrderCancelledEmail",
};

// Same idea for sms.service.js — a narrower set than email (no SMS for
// cancellation), per the SMS notification requirements.
const STATUS_SMS_SENDERS = {
  SHIPPED: "sendOrderShippedSms",
  OUT_FOR_DELIVERY: "sendOutForDeliverySms",
  DELIVERED: "sendOrderDeliveredSms",
};

// An order's stock is "freed" — eligible to go back into sellable
// inventory — once it's cancelled/returned, or its payment is refunded.
// Because status/payment updates have no state-machine guard (see above),
// this is evaluated as a combined before/after check in updateStatus and
// updatePayment rather than a per-field transition, so restoring stock via
// one endpoint can never be double-triggered by the other.
function stockIsFreed({ status, paymentStatus }) {
  return status === "CANCELLED" || status === "RETURNED" || paymentStatus === "REFUNDED";
}

// Puts back the stock an order reserved at placement time. Called once,
// the first time an order crosses into a stock-is-freed state — must run
// inside the same transaction as the status/payment write so a crash
// between the two can never leave stock out of sync with the order record.
async function restoreStockForOrder(order, tx) {
  for (const item of order.items) {
    await productRepository.incrementStock(item.productId, item.quantity, tx);
  }
}

function toAdminDetail(order) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    subtotal: Number(order.subtotal),
    shippingFee: Number(order.shippingFee),
    coupon: order.couponCode ? { code: order.couponCode, discountAmount: Number(order.discountAmount) } : null,
    total: Number(order.total),
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    customer: {
      fullName: order.user.fullName,
      email: order.user.email,
      phone: order.user.phone,
    },
    address: {
      fullName: order.address.fullName,
      phone: order.address.phone,
      addressLine1: order.address.addressLine1,
      addressLine2: order.address.addressLine2,
      city: order.address.city,
      state: order.address.state,
      pincode: order.address.pincode,
      country: order.address.country,
    },
    items: order.items.map((item) => ({
      productName: item.productName,
      unitPrice: Number(item.unitPrice),
      quantity: item.quantity,
      lineTotal: Number(item.lineTotal),
    })),
    payment: order.payment
      ? {
          status: order.payment.status,
          method: order.payment.method,
          transactionId: order.payment.transactionId,
          amount: Number(order.payment.amount),
          paidAt: order.payment.paidAt,
        }
      : null,
  };
}

export const adminOrderService = {
  async list({ page = 1, pageSize = 10, status, search } = {}) {
    const { items, total } = await orderRepository.findAllForAdmin({ page, pageSize, status, search });
    return {
      items: items.map((order) => ({ ...order, total: Number(order.total) })),
      total,
      page,
      pageSize,
    };
  },

  async getById(id) {
    const order = await orderRepository.findByIdForAdmin(id);
    if (!order) {
      throw new ApiError(404, "Order not found");
    }
    return toAdminDetail(order);
  },

  async updateStatus(id, status) {
    const existing = await orderRepository.findByIdForAdmin(id);
    if (!existing) {
      throw new ApiError(404, "Order not found");
    }

    const wasFreed = stockIsFreed({ status: existing.status, paymentStatus: existing.payment?.status });
    const willBeFreed = stockIsFreed({ status, paymentStatus: existing.payment?.status });

    await prisma.$transaction(async (tx) => {
      await orderRepository.updateStatus(id, status, tx);
      if (!wasFreed && willBeFreed) {
        await restoreStockForOrder(existing, tx);
      }
    });

    // Fire-and-forget, and only on a real transition (existing.status
    // reflects the pre-update state) — re-setting the same status twice
    // must never re-send the email, same idempotency posture as the stock
    // restoration above.
    const isRealTransition = existing.status !== status;
    const emailSenderName = STATUS_EMAIL_SENDERS[status];
    if (emailSenderName && isRealTransition) {
      emailService[emailSenderName](existing, existing.user);
    }
    const smsSenderName = STATUS_SMS_SENDERS[status];
    if (smsSenderName && isRealTransition) {
      smsService[smsSenderName](existing);
    }

    return this.getById(id);
  },

  async updatePayment(id, { status, transactionId }) {
    const existing = await orderRepository.findByIdForAdmin(id);
    if (!existing) {
      throw new ApiError(404, "Order not found");
    }
    if (!existing.payment) {
      throw new ApiError(404, "This order has no payment record");
    }

    const wasFreed = stockIsFreed({ status: existing.status, paymentStatus: existing.payment.status });
    const willBeFreed = stockIsFreed({ status: existing.status, paymentStatus: status });

    await prisma.$transaction(async (tx) => {
      await paymentRepository.updateByOrderId(
        id,
        {
          status,
          ...(transactionId && { transactionId }),
          ...(status === "SUCCESS" && { paidAt: new Date() }),
        },
        tx
      );
      if (!wasFreed && willBeFreed) {
        await restoreStockForOrder(existing, tx);
      }
    });

    // Fire-and-forget, and only on a real transition into SUCCESS — covers
    // an admin manually reconciling a COD payment (UPI's own SUCCESS
    // transition already sends this from payment.service.js's
    // finalizePaidIntent, so this endpoint only fires it here).
    if (existing.payment.status !== "SUCCESS" && status === "SUCCESS") {
      // existing.payment reflects the pre-update row — merge in the
      // just-set status/transactionId so the email shows the real
      // reference the admin recorded, not the stale pre-update value.
      const orderForEmail = {
        ...existing,
        payment: { ...existing.payment, status, ...(transactionId && { transactionId }) },
      };
      emailService.sendPaymentSuccessEmail(orderForEmail, existing.user);
    }

    return this.getById(id);
  },
};
