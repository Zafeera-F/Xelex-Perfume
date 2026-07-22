// Coupon repository — every Prisma query involving the Coupon model lives
// here. `claimUsage` is what makes concurrent checkouts race-safe (see
// order.service.js/payment.service.js) — same updateMany-guarded-by-condition
// pattern already proven by paymentIntentRepository.claimForFinalization:
// only the first caller whose WHERE still matches when Postgres locks the
// row actually increments usedCount, so a coupon can never be used more
// times than usageLimit allows under concurrent load.

import prisma from "../config/prisma.js";

export const couponRepository = {
  findByCode(code, client = prisma) {
    return client.coupon.findUnique({ where: { code } });
  },

  findById(id, client = prisma) {
    return client.coupon.findUnique({ where: { id } });
  },

  claimUsage(couponId, usageLimit, client = prisma) {
    return client.coupon.updateMany({
      where: {
        id: couponId,
        isActive: true,
        ...(usageLimit != null && { usedCount: { lt: usageLimit } }),
      },
      data: { usedCount: { increment: 1 } },
    });
  },

  async findAllForAdmin({ page = 1, pageSize = 10, search, status } = {}) {
    const where = {
      ...(search && { code: { contains: search, mode: "insensitive" } }),
      ...(status === "active" && { isActive: true }),
      ...(status === "inactive" && { isActive: false }),
    };

    const [items, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.coupon.count({ where }),
    ]);

    return { items, total };
  },

  create(data) {
    return prisma.coupon.create({ data });
  },

  update(id, data) {
    return prisma.coupon.update({ where: { id }, data });
  },

  delete(id) {
    return prisma.coupon.delete({ where: { id } });
  },
};
