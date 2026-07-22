// Thin helpers over the admin coupons API — same pattern as
// src/lib/adminProducts.js.

import { apiRequest } from "./api";

export function getAdminCoupons({ page = 1, pageSize = 10, search, status } = {}) {
  const params = new URLSearchParams({ page, pageSize });
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  return apiRequest(`/api/admin/coupons?${params.toString()}`);
}

export function getAdminCoupon(id) {
  return apiRequest(`/api/admin/coupons/${id}`).then((data) => data.coupon);
}

export function createCoupon(data) {
  return apiRequest("/api/admin/coupons", { method: "POST", body: data }).then((d) => d.coupon);
}

export function updateCoupon(id, data) {
  return apiRequest(`/api/admin/coupons/${id}`, { method: "PATCH", body: data }).then((d) => d.coupon);
}

export function deleteCoupon(id) {
  return apiRequest(`/api/admin/coupons/${id}`, { method: "DELETE" });
}
