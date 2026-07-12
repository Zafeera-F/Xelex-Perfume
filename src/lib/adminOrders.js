// Thin helpers over the admin orders API — same pattern as src/lib/orders.js.

import { apiRequest } from "./api";

export function getAdminOrders({ page = 1, pageSize = 10, status, search } = {}) {
  const params = new URLSearchParams({ page, pageSize });
  if (status) params.set("status", status);
  if (search) params.set("search", search);
  return apiRequest(`/api/admin/orders?${params.toString()}`);
}

export function getAdminOrder(id) {
  return apiRequest(`/api/admin/orders/${id}`).then((data) => data.order);
}

export function updateOrderStatus(id, status) {
  return apiRequest(`/api/admin/orders/${id}/status`, { method: "PATCH", body: { status } }).then(
    (d) => d.order
  );
}

export function updateOrderPayment(id, { status, transactionId }) {
  return apiRequest(`/api/admin/orders/${id}/payment`, {
    method: "PATCH",
    body: { status, transactionId },
  }).then((d) => d.order);
}
