// Thin helper over the public newsletter API — same pattern as
// src/lib/products.js.

import { apiRequest } from "./api";

export function subscribeToNewsletter(email) {
  return apiRequest("/api/newsletter/subscribe", {
    method: "POST",
    body: { email },
  });
}
