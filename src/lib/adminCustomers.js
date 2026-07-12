// Thin helpers over the admin customers API — same pattern as
// src/lib/adminOrders.js.

import { apiRequest } from "./api";

export function getAdminCustomers({ page = 1, pageSize = 10, search } = {}) {
  const params = new URLSearchParams({ page, pageSize });
  if (search) params.set("search", search);
  return apiRequest(`/api/admin/customers?${params.toString()}`);
}

export function getAdminCustomer(id) {
  return apiRequest(`/api/admin/customers/${id}`);
}
