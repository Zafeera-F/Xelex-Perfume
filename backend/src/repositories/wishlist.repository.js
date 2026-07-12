// Wishlist repository — every Prisma query involving the Wishlist model
// lives here. Wishlist IS the join table (see schema.prisma's own note) —
// no separate id needed for removal, the userId+productId composite unique
// is the natural key.

import prisma from "../config/prisma.js";

const PRODUCT_INCLUDE = {
  category: true,
  collection: true,
  images: { orderBy: { sortOrder: "asc" } },
};

export const wishlistRepository = {
  async findByUserWithProducts(userId) {
    const rows = await prisma.wishlist.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { product: { include: PRODUCT_INCLUDE } },
    });
    return rows.map((row) => row.product);
  },

  async add(userId, productId) {
    try {
      await prisma.wishlist.create({ data: { userId, productId } });
    } catch (err) {
      // Already wishlisted — toggling twice should be a no-op, not an error.
      if (err.code !== "P2002") throw err;
    }
  },

  remove(userId, productId) {
    return prisma.wishlist.deleteMany({ where: { userId, productId } });
  },
};
