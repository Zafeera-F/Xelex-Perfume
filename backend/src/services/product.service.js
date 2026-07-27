// Product service — business logic only, mirrors the layering already
// established by auth.service.js/admin.service.js. Shapes raw Prisma rows
// into the flat response shape the frontend already expects (it was built
// against a static PRODUCTS array whose `id` field was really a slug — see
// the products-backend plan for why `id` below is `product.slug`, not the
// real database id).

import { productRepository } from "../repositories/product.repository.js";
import { categoryRepository } from "../repositories/category.repository.js";
import { collectionRepository } from "../repositories/collection.repository.js";
import { ApiError } from "../utils/ApiError.js";

// Every product XeleX sells today is a fixed 50ml — this is a business
// constant, not per-product data, so it's composed here rather than stored.
const SIZE_SUBTITLE = "Eau de Parfum · 50ml";

export function toListItem(product) {
  return {
    id: product.slug,
    name: product.name,
    category: product.category?.name ?? null,
    collection: product.collection?.name ?? null,
    line: product.brandLine,
    price: Number(product.price),
    rating: Number(product.ratingAverage),
    reviews: product.ratingCount,
    inStock: product.stockQuantity > 0,
    notes: SIZE_SUBTITLE,
    image: product.images[0]?.url ?? null,
    badge: product.badge,
    inspiredBy: product.inspiredBy,
  };
}

function toDetail(product) {
  return {
    ...toListItem(product),
    description: product.description,
    images: product.images.map((img) => img.url),
  };
}

export const productService = {
  async list({ featured, bestSeller } = {}) {
    const products = await productRepository.findManyActive({ featured, bestSeller });
    return products.map(toListItem);
  },

  async getBySlug(slug) {
    const product = await productRepository.findBySlug(slug);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    return toDetail(product);
  },

  async getFacets() {
    const [categories, collections, lines, priceBounds] = await Promise.all([
      categoryRepository.findAllActive(),
      collectionRepository.findAllActive(),
      productRepository.getDistinctLines(),
      productRepository.getPriceBounds(),
    ]);

    return {
      categories: categories.map((c) => c.name),
      collections: collections.map((c) => c.name),
      lines,
      priceBounds,
    };
  },
};
