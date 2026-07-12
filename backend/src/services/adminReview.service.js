// Admin review service — business logic only, mirrors the layering already
// established elsewhere. setApproved/remove both run inside a transaction
// alongside a Product rating recompute (reviewRepository.recomputeProductRating)
// — moderating a review always changes which reviews count toward the
// product's average, same posture as a customer's own review writes in
// review.service.js.

import prisma from "../config/prisma.js";
import { reviewRepository } from "../repositories/review.repository.js";
import { ApiError } from "../utils/ApiError.js";

function toAdminShape(review) {
  return {
    id: review.id,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    isApproved: review.isApproved,
    createdAt: review.createdAt,
    authorName: review.user.fullName,
    authorEmail: review.user.email,
    productName: review.product.name,
    productSlug: review.product.slug,
  };
}

export const adminReviewService = {
  async list({ page = 1, pageSize = 10, search, status } = {}) {
    const { items, total } = await reviewRepository.findAllForAdmin({ page, pageSize, search, status });
    return { items: items.map(toAdminShape), total, page, pageSize };
  },

  async setApproved(id, isApproved) {
    const review = await reviewRepository.findByIdForAdmin(id);
    if (!review) {
      throw new ApiError(404, "Review not found");
    }

    await prisma.$transaction(async (tx) => {
      await reviewRepository.setApproved(id, isApproved, tx);
      await reviewRepository.recomputeProductRating(review.product.id, tx);
    });
  },

  async remove(id) {
    const review = await reviewRepository.findByIdForAdmin(id);
    if (!review) {
      throw new ApiError(404, "Review not found");
    }

    await prisma.$transaction(async (tx) => {
      await reviewRepository.softDelete(id, tx);
      await reviewRepository.recomputeProductRating(review.product.id, tx);
    });
  },
};
