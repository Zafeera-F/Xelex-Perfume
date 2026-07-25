// Admin product service — business logic only, mirrors the layering
// already established elsewhere. Unlike the public product.service.js,
// this operates on every product regardless of isActive/deletedAt, and
// shapes rows into a richer, editable shape (raw categoryId/collectionId,
// stockQuantity, deletedAt, etc.) rather than the customer-facing flat
// shape.

import { productRepository } from "../repositories/product.repository.js";
import { categoryRepository } from "../repositories/category.repository.js";
import { collectionRepository } from "../repositories/collection.repository.js";
import { ApiError } from "../utils/ApiError.js";

function toAdminListItem(product) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: Number(product.price),
    stockQuantity: product.stockQuantity,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    isBestSeller: product.isBestSeller,
    category: product.category?.name ?? null,
    collection: product.collection?.name ?? null,
    image: product.images[0]?.url ?? null,
    deletedAt: product.deletedAt,
    createdAt: product.createdAt,
  };
}

function toAdminDetail(product) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    sku: product.sku,
    stockQuantity: product.stockQuantity,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    isBestSeller: product.isBestSeller,
    badge: product.badge,
    brandLine: product.brandLine,
    categoryId: product.categoryId,
    collectionId: product.collectionId,
    ratingAverage: Number(product.ratingAverage),
    ratingCount: product.ratingCount,
    images: product.images.map((img) => ({ url: img.url, altText: img.altText })),
    deletedAt: product.deletedAt,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export const adminProductService = {
  async list({ page = 1, pageSize = 10, search, status, lowStock } = {}) {
    const { items, total } = await productRepository.findAllForAdmin({ page, pageSize, search, status, lowStock });
    return { items: items.map(toAdminListItem), total, page, pageSize };
  },

  async getById(id) {
    const product = await productRepository.findByIdForAdmin(id);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    return toAdminDetail(product);
  },

  async create({ images, ...fields }) {
    let product;
    try {
      product = await productRepository.create(fields);
    } catch (err) {
      if (err.code === "P2002") {
        throw new ApiError(409, "A product with this slug already exists");
      }
      throw err;
    }

    if (images?.length) {
      await productRepository.replaceImages(product.id, images);
    }

    return this.getById(product.id);
  },

  async update(id, { images, ...fields }) {
    const existing = await productRepository.findByIdForAdmin(id);
    if (!existing) {
      throw new ApiError(404, "Product not found");
    }

    try {
      if (Object.keys(fields).length > 0) {
        await productRepository.update(id, fields);
      }
    } catch (err) {
      if (err.code === "P2002") {
        throw new ApiError(409, "A product with this slug already exists");
      }
      throw err;
    }

    if (images) {
      await productRepository.replaceImages(id, images);
    }

    return this.getById(id);
  },

  async softDelete(id) {
    const existing = await productRepository.findByIdForAdmin(id);
    if (!existing) {
      throw new ApiError(404, "Product not found");
    }
    await productRepository.softDelete(id);
  },

  async getFormMeta() {
    const [categories, collections] = await Promise.all([
      categoryRepository.findAllActive(),
      collectionRepository.findAllActive(),
    ]);

    return {
      categories: categories.map((c) => ({ id: c.id, name: c.name })),
      collections: collections.map((c) => ({ id: c.id, name: c.name })),
    };
  },
};
