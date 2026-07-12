// Review repository — every Prisma query involving the Review model lives
// here. Write methods take an optional Prisma client so review.service.js
// can run a write and the Product.ratingAverage/ratingCount recompute it
// triggers inside the same transaction — one always implies the other, so
// they must succeed or fail together.

import prisma from "../config/prisma.js";

const VISIBLE = { isApproved: true, deletedAt: null };

export const reviewRepository = {
  findApprovedByProduct(productId) {
    return prisma.review.findMany({
      where: { productId, ...VISIBLE },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { fullName: true } } },
    });
  },

  findByUserAndProduct(userId, productId) {
    return prisma.review.findFirst({ where: { userId, productId, deletedAt: null } });
  },

  findById(id) {
    return prisma.review.findFirst({ where: { id, deletedAt: null } });
  },

  create(data, client = prisma) {
    return client.review.create({ data });
  },

  update(id, data, client = prisma) {
    return client.review.update({ where: { id }, data });
  },

  softDelete(id, client = prisma) {
    return client.review.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  // Recomputes and persists the denormalized rating fields on Product —
  // always call this inside the same transaction as the write that
  // triggered it (create/update/soft-delete).
  async recomputeProductRating(productId, client = prisma) {
    const { _avg, _count } = await client.review.aggregate({
      where: { productId, ...VISIBLE },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await client.product.update({
      where: { id: productId },
      data: {
        ratingAverage: _avg.rating ? Math.round(_avg.rating * 10) / 10 : 0,
        ratingCount: _count.rating,
      },
    });
  },

  // --- Admin-facing methods (see hidden reviews too, in order to un-hide
  // them; soft-deleted reviews stay excluded even here — once deleted,
  // gone, no "trash" view this phase) ------------------------------------

  async findAllForAdmin({ page = 1, pageSize = 10, search, status } = {}) {
    const where = {
      deletedAt: null,
      ...(status === "approved" && { isApproved: true }),
      ...(status === "hidden" && { isApproved: false }),
      ...(search && {
        OR: [
          { user: { fullName: { contains: search, mode: "insensitive" } } },
          { product: { name: { contains: search, mode: "insensitive" } } },
        ],
      }),
    };

    const include = {
      user: { select: { fullName: true, email: true } },
      product: { select: { name: true, slug: true } },
    };

    const [items, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.review.count({ where }),
    ]);

    return { items, total };
  },

  findByIdForAdmin(id) {
    return prisma.review.findFirst({
      where: { id, deletedAt: null },
      include: { product: { select: { id: true, slug: true } } },
    });
  },

  setApproved(id, isApproved, client = prisma) {
    return client.review.update({ where: { id }, data: { isApproved } });
  },
};
