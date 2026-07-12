// Thin helpers over the admin reviews API — same pattern as
// src/lib/adminProducts.js / src/lib/adminOrders.js.

import { apiRequest } from "./api";

export function getAdminReviews({ page = 1, pageSize = 10, search, status } = {}) {
  const params = new URLSearchParams({ page, pageSize });
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  return apiRequest(`/api/admin/reviews?${params.toString()}`);
}

export function setReviewApproval(id, isApproved) {
  return apiRequest(`/api/admin/reviews/${id}/approve`, { method: "PATCH", body: { isApproved } });
}

export function deleteReview(id) {
  return apiRequest(`/api/admin/reviews/${id}`, { method: "DELETE" });
}
