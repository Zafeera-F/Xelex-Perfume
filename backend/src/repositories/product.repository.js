// Product repository — every Prisma query involving the Product model
// lives here. The customer-facing methods below are always scoped to
// `CUSTOMER_VISIBLE` rows; the "ForAdmin" methods deliberately are not —
// admin product management needs to see and manage inactive/deleted rows
// too.

import prisma from "../config/prisma.js";

const CUSTOMER_VISIBLE = { isActive: true, deletedAt: null };

const PRODUCT_INCLUDE = {
  category: true,
  collection: true,
  images: { orderBy: { sortOrder: "asc" } },
};

export const productRepository = {
  findManyActive({ featured, bestSeller } = {}) {
    return prisma.product.findMany({
      where: {
        ...CUSTOMER_VISIBLE,
        ...(featured && { isFeatured: true }),
        ...(bestSeller && { isBestSeller: true }),
      },
      include: PRODUCT_INCLUDE,
      orderBy: { createdAt: "asc" },
    });
  },

  // Optional `client` param lets order creation call this from inside a
  // transaction (see order.service.js) — defaults to the singleton so
  // every existing call site is unaffected.
  findBySlug(slug, client = prisma) {
    return client.product.findFirst({
      where: { slug, ...CUSTOMER_VISIBLE },
      include: PRODUCT_INCLUDE,
    });
  },

  decrementStock(id, quantity, client = prisma) {
    return client.product.update({
      where: { id },
      data: { stockQuantity: { decrement: quantity } },
    });
  },

  // Used by adminOrder.service.js when an order's stock is freed back up
  // (cancelled/returned/refunded) — see restoreStockForOrder there.
  incrementStock(id, quantity, client = prisma) {
    return client.product.update({
      where: { id },
      data: { stockQuantity: { increment: quantity } },
    });
  },

  async getDistinctLines() {
    const rows = await prisma.product.findMany({
      where: { ...CUSTOMER_VISIBLE, brandLine: { not: null } },
      distinct: ["brandLine"],
      select: { brandLine: true },
      orderBy: { brandLine: "asc" },
    });
    return rows.map((r) => r.brandLine);
  },

  async getPriceBounds() {
    const { _min, _max } = await prisma.product.aggregate({
      where: CUSTOMER_VISIBLE,
      _min: { price: true },
      _max: { price: true },
    });
    return {
      min: _min.price ? Number(_min.price) : 0,
      max: _max.price ? Number(_max.price) : 0,
    };
  },

  // --- Admin-facing methods (no visibility filtering) -------------------

  async findAllForAdmin({ page = 1, pageSize = 10, search, status } = {}) {
    const where = {
      ...adminStatusFilter(status),
      ...(search && { name: { contains: search, mode: "insensitive" } }),
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: PRODUCT_INCLUDE,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total };
  },

  findByIdForAdmin(id) {
    return prisma.product.findUnique({ where: { id }, include: PRODUCT_INCLUDE });
  },

  // Used by the admin dashboard's "Total Products" stat.
  count() {
    return prisma.product.count({ where: { deletedAt: null } });
  },

  // Used by the admin dashboard's "Low Stock Products" stat. Excludes 0
  // (out-of-stock is already surfaced separately via inStock/isActive) —
  // this is specifically the "still sellable but running low" signal.
  countLowStock() {
    return prisma.product.count({
      where: { deletedAt: null, stockQuantity: { gt: 0, lt: 10 } },
    });
  },

  create(data) {
    return prisma.product.create({ data, include: PRODUCT_INCLUDE });
  },

  update(id, data) {
    return prisma.product.update({ where: { id }, data, include: PRODUCT_INCLUDE });
  },

  softDelete(id) {
    return prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  // Wholesale replace rather than diff — simplest correct approach for a
  // handful of image rows with no independent identity worth preserving
  // across an edit (same pattern already used by prisma/seed.js).
  async replaceImages(id, images) {
    await prisma.productImage.deleteMany({ where: { productId: id } });
    if (images.length > 0) {
      await prisma.productImage.createMany({
        data: images.map((img, index) => ({
          productId: id,
          url: img.url,
          altText: img.altText || null,
          sortOrder: index,
        })),
      });
    }
  },
};

function adminStatusFilter(status) {
  switch (status) {
    case "active":
      return { isActive: true, deletedAt: null };
    case "inactive":
      return { isActive: false, deletedAt: null };
    case "deleted":
      return { deletedAt: { not: null } };
    default:
      return {};
  }
}
