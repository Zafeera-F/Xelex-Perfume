// Thin helper over the admin dashboard API — same pattern as
// src/lib/adminOrders.js.

import { apiRequest } from "./api";

export function getDashboardStats() {
  return apiRequest("/api/admin/dashboard");
}
