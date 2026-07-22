// Thin helper over the public coupon validate API — same pattern as
// src/lib/products.js.

import { apiRequest } from "./api";

export function validateCoupon(code, subtotal) {
  return apiRequest("/api/coupons/validate", {
    method: "POST",
    body: { code, subtotal },
  });
}
