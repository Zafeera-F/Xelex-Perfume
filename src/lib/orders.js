// Thin helpers over the orders API — same pattern as src/lib/products.js.

import { apiRequest } from "./api";

export function createOrder({ items, shipping, paymentMethod, couponCode }) {
  return apiRequest("/api/orders", {
    method: "POST",
    body: { items, shipping, paymentMethod, couponCode },
  }).then((data) => data.order);
}

export function getOrders() {
  return apiRequest("/api/orders").then((data) => data.orders);
}
