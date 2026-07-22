// Thin helper over the public hero slides API — same pattern as
// src/lib/products.js.

import { apiRequest } from "./api";

export function getHeroSlides() {
  return apiRequest("/api/hero-slides").then((data) => data.slides);
}
