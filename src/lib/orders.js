// Thin helpers over the orders API — same pattern as src/lib/products.js.

import { apiRequest } from "./api";

export function createOrder({ items, shipping, paymentMethod }) {
  return apiRequest("/api/orders", {
    method: "POST",
    body: { items, shipping, paymentMethod },
  }).then((data) => data.order);
}

export function getOrders() {
  return apiRequest("/api/orders").then((data) => data.orders);
}
