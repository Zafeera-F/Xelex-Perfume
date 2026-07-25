// Thin helpers over the admin products API — same pattern as
// src/lib/products.js, just against the requireAdmin-protected routes.

import { apiRequest } from "./api";

export function getAdminProducts({ page = 1, pageSize = 10, search, status, lowStock } = {}) {
  const params = new URLSearchParams({ page, pageSize });
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  if (lowStock) params.set("lowStock", "true");
  return apiRequest(`/api/admin/products?${params.toString()}`);
}

export function getProductFormMeta() {
  return apiRequest("/api/admin/products/meta");
}

export function getAdminProduct(id) {
  return apiRequest(`/api/admin/products/${id}`).then((data) => data.product);
}

export function createProduct(data) {
  return apiRequest("/api/admin/products", { method: "POST", body: data }).then((d) => d.product);
}

export function updateProduct(id, data) {
  return apiRequest(`/api/admin/products/${id}`, { method: "PATCH", body: data }).then((d) => d.product);
}

export function deleteProduct(id) {
  return apiRequest(`/api/admin/products/${id}`, { method: "DELETE" });
}

export function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  return apiRequest("/api/admin/uploads", { method: "POST", body: formData }).then((d) => d.url);
}
