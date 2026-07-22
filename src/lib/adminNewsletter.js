// Thin helpers over the admin newsletter API — same pattern as
// src/lib/adminReviews.js.

import { apiRequest } from "./api";

export function getAdminSubscribers({ page = 1, pageSize = 10, search } = {}) {
  const params = new URLSearchParams({ page, pageSize });
  if (search) params.set("search", search);
  return apiRequest(`/api/admin/newsletter?${params.toString()}`);
}
