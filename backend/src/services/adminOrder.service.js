// Admin order service — business logic only, mirrors the layering already
// established elsewhere. No order-status state-machine validation here by
// design: any OrderStatus/PaymentStatus enum value is accepted at any time
// (the validator only checks it's a real enum member) — this is admin
// discretion, not a workflow engine.

import { orderRepository } from "../repositories/order.repository.js";
import { paymentRepository } from "../repositories/payment.repository.js";
import { ApiError } from "../utils/ApiError.js";

function toAdminDetail(order) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    subtotal: Number(order.subtotal),
    shippingFee: Number(order.shippingFee),
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
  async list({ page = 1, pageSize = 10, status } = {}) {
    const { items, total } = await orderRepository.findAllForAdmin({ page, pageSize, status });
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
    await orderRepository.updateStatus(id, status);
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

    await paymentRepository.updateByOrderId(id, {
      status,
      ...(transactionId && { transactionId }),
      ...(status === "SUCCESS" && { paidAt: new Date() }),
    });

    return this.getById(id);
  },
};
