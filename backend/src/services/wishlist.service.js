// Wishlist service — business logic only, mirrors the layering already
// established elsewhere. Reuses product.service.js's toListItem so
// wishlist items render through the exact same ProductCard shape as
// everywhere else in the app.

import { wishlistRepository } from "../repositories/wishlist.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import { toListItem } from "./product.service.js";
import { ApiError } from "../utils/ApiError.js";

export const wishlistService = {
  async list(userId) {
    const products = await wishlistRepository.findByUserWithProducts(userId);
    // A wishlisted product that's since gone inactive/deleted is silently
    // dropped rather than shown broken — same graceful-degradation already
    // used by CartContext's hydration on the frontend.
    return products.filter((p) => p.isActive && !p.deletedAt).map(toListItem);
  },

  async add(userId, productSlug) {
    const product = await productRepository.findBySlug(productSlug);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    await wishlistRepository.add(userId, product.id);
  },

  async remove(userId, productSlug) {
    const product = await productRepository.findBySlug(productSlug);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    await wishlistRepository.remove(userId, product.id);
  },
};
