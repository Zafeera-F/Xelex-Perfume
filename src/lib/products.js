// Thin helpers over the products API — one shared place for the paths, used
// by Shop, ProductDetails, BestSellers, FeaturedCollection, and
// CartContext instead of each hand-rolling a fetch.

import { apiRequest } from "./api";

export function getProducts({ featured, bestSeller } = {}) {
  const params = new URLSearchParams();
  if (featured) params.set("featured", "true");
  if (bestSeller) params.set("bestSeller", "true");
  const query = params.toString();

  return apiRequest(`/api/products${query ? `?${query}` : ""}`).then((data) => data.products);
}

export function getProductBySlug(slug) {
  return apiRequest(`/api/products/${slug}`).then((data) => data.product);
}

export function getFacets() {
  return apiRequest("/api/products/facets");
}
