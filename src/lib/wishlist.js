// Thin helpers over the wishlist API — same pattern as src/lib/products.js.

import { apiRequest } from "./api";

export function getWishlist() {
  return apiRequest("/api/wishlist").then((data) => data.products);
}

export function addToWishlist(productId) {
  return apiRequest("/api/wishlist", { method: "POST", body: { productId } });
}

export function removeFromWishlist(productId) {
  return apiRequest(`/api/wishlist/${productId}`, { method: "DELETE" });
}
