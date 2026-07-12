// Admin customer service — business logic only, mirrors the layering
// already established elsewhere. Purchase history reuses
// orderRepository.findAllByUser, the exact same query the customer-facing
// order-history endpoint already uses — no second copy of that logic.

import { userRepository } from "../repositories/user.repository.js";
import { orderRepository } from "../repositories/order.repository.js";
import { ApiError } from "../utils/ApiError.js";

export const adminCustomerService = {
  async list({ page = 1, pageSize = 10, search } = {}) {
    const { items, total } = await userRepository.findAllForAdmin({ page, pageSize, search });
    return { items, total, page, pageSize };
  },

  async getById(id) {
    const customer = await userRepository.findByIdForAdmin(id);
    if (!customer) {
      throw new ApiError(404, "Customer not found");
    }
    const orders = await orderRepository.findAllByUser(id);
    return { customer, orders };
  },
};
