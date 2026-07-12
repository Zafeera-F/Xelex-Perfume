// Thin helpers over the product-reviews API — same pattern as
// src/lib/products.js.

import { apiRequest } from "./api";

export function getProductReviews(slug) {
  return apiRequest(`/api/products/${slug}/reviews`).then((data) => data.reviews);
}

export function getMyReview(slug) {
  return apiRequest(`/api/products/${slug}/reviews/me`).then((data) => data.review);
}

export function createReview(slug, { rating, title, comment }) {
  return apiRequest(`/api/products/${slug}/reviews`, {
    method: "POST",
    body: { rating, title, comment },
  }).then((data) => data.review);
}

export function updateReview(slug, reviewId, { rating, title, comment }) {
  return apiRequest(`/api/products/${slug}/reviews/${reviewId}`, {
    method: "PATCH",
    body: { rating, title, comment },
  }).then((data) => data.review);
}

export function deleteReview(slug, reviewId) {
  return apiRequest(`/api/products/${slug}/reviews/${reviewId}`, { method: "DELETE" });
}
