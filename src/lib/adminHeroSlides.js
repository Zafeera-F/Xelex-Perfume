// Thin helpers over the admin hero slides API — same pattern as
// src/lib/adminProducts.js.

import { apiRequest } from "./api";

export function getAdminHeroSlides() {
  return apiRequest("/api/admin/hero-slides").then((data) => data.slides);
}

export function getAdminHeroSlide(id) {
  return apiRequest(`/api/admin/hero-slides/${id}`).then((data) => data.slide);
}

export function createHeroSlide(data) {
  return apiRequest("/api/admin/hero-slides", { method: "POST", body: data }).then((d) => d.slide);
}

export function updateHeroSlide(id, data) {
  return apiRequest(`/api/admin/hero-slides/${id}`, { method: "PATCH", body: data }).then((d) => d.slide);
}

export function deleteHeroSlide(id) {
  return apiRequest(`/api/admin/hero-slides/${id}`, { method: "DELETE" });
}

export function reorderHeroSlides(orderedIds) {
  return apiRequest("/api/admin/hero-slides/reorder", { method: "PATCH", body: { order: orderedIds } });
}

export function uploadHeroSlideImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  return apiRequest("/api/admin/uploads/hero-slides", { method: "POST", body: formData }).then((d) => d.url);
}
