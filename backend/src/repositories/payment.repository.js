// Payment repository — every Prisma query involving the Payment model
// lives here. Payment rows are created inside order.service.js's
// transaction, updated here for admin-side payment status management, and
// aggregated here for the admin dashboard's revenue/failed-payments stats.

import prisma from "../config/prisma.js";

export const paymentRepository = {
  updateByOrderId(orderId, data, client = prisma) {
    return client.payment.update({ where: { orderId }, data });
  },

  // Used by the admin dashboard — "Failed Payments" count and "Total
  // Revenue" (sum of SUCCESS payments).
  count({ status }) {
    return prisma.payment.count({ where: { status } });
  },

  async sumAmount({ status }) {
    const { _sum } = await prisma.payment.aggregate({ where: { status }, _sum: { amount: true } });
    return Number(_sum.amount ?? 0);
  },
};
