// PaymentIntent repository — every Prisma query involving the
// PaymentIntent model lives here. `claimForFinalization` is what makes
// verify-vs-webhook races safe (see payment.service.js's finalizePaidIntent):
// it's an `updateMany` guarded by `status: "CREATED"`, so only the first
// caller to reach it for a given intent actually flips it to PAID — the
// loser sees 0 rows affected and knows someone else already built the order.

import prisma from "../config/prisma.js";

export const paymentIntentRepository = {
  create(data) {
    return prisma.paymentIntent.create({ data });
  },

  findByGatewayOrderId(gatewayOrderId) {
    return prisma.paymentIntent.findUnique({ where: { gatewayOrderId } });
  },

  findById(id, client = prisma) {
    return client.paymentIntent.findUnique({ where: { id } });
  },

  claimForFinalization(id, transactionId, client = prisma) {
    return client.paymentIntent.updateMany({
      where: { id, status: "CREATED" },
      data: { status: "PAID", transactionId },
    });
  },

  attachOrder(id, orderId, client = prisma) {
    return client.paymentIntent.update({ where: { id }, data: { orderId } });
  },

  markFailed(id, failureReason, client = prisma) {
    return client.paymentIntent.updateMany({
      where: { id, status: "CREATED" },
      data: { status: "FAILED", failureReason },
    });
  },
};
