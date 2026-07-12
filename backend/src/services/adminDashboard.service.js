// Admin dashboard service — business logic only, mirrors the layering
// already established elsewhere. Pulls every stat from the repositories
// that already own each model (no direct Prisma access here), running them
// concurrently since none of the counts/sums depend on one another.

import { orderRepository } from "../repositories/order.repository.js";
import { paymentRepository } from "../repositories/payment.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { productRepository } from "../repositories/product.repository.js";

export const adminDashboardService = {
  async getStats() {
    const [
      totalOrders,
      totalRevenue,
      totalCustomers,
      totalProducts,
      pendingOrders,
      deliveredOrders,
      failedPayments,
      lowStockProducts,
    ] = await Promise.all([
      orderRepository.count(),
      paymentRepository.sumAmount({ status: "SUCCESS" }),
      userRepository.count(),
      productRepository.count(),
      orderRepository.count({ status: "PENDING" }),
      orderRepository.count({ status: "DELIVERED" }),
      paymentRepository.count({ status: "FAILED" }),
      productRepository.countLowStock(),
    ]);

    return {
      totalOrders,
      totalRevenue,
      totalCustomers,
      totalProducts,
      pendingOrders,
      deliveredOrders,
      failedPayments,
      lowStockProducts,
    };
  },
};
