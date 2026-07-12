// Payment repository — every Prisma query involving the Payment model
// lives here. Until now Payment rows were only ever created (inside
// order.service.js's transaction); this is the first place one gets
// updated, for admin-side payment status management.

import prisma from "../config/prisma.js";

export const paymentRepository = {
  updateByOrderId(orderId, data, client = prisma) {
    return client.payment.update({ where: { orderId }, data });
  },
};
