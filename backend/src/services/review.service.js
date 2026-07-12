// Review service — business logic only, mirrors the layering already
// established elsewhere. Every write (create/update/soft-delete) runs
// inside a transaction alongside the Product.ratingAverage/ratingCount
// recompute it triggers — same atomicity posture as order.service.js.

import prisma from "../config/prisma.js";
import { reviewRepository } from "../repositories/review.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import { ApiError } from "../utils/ApiError.js";

function toPublicShape(review) {
  return {
    id: review.id,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    authorName: review.user.fullName,
    createdAt: review.createdAt,
  };
}

function toOwnShape(review) {
  return { id: review.id, rating: review.rating, title: review.title, comment: review.comment };
}

async function resolveProduct(slug) {
  const product = await productRepository.findBySlug(slug);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  return product;
}

// Ownership check shared by update/remove — 404 either way (missing vs.
// belongs to someone else) so a review's existence is never leaked to a
// non-owner.
async function findOwnReviewOrThrow(userId, productId, reviewId) {
  const review = await reviewRepository.findById(reviewId);
  if (!review || review.userId !== userId || review.productId !== productId) {
    throw new ApiError(404, "Review not found");
  }
  return review;
}

export const reviewService = {
  async listForProduct(slug) {
    const product = await resolveProduct(slug);
    const reviews = await reviewRepository.findApprovedByProduct(product.id);
    return reviews.map(toPublicShape);
  },

  async getMyReview(slug, userId) {
    const product = await resolveProduct(slug);
    const review = await reviewRepository.findByUserAndProduct(userId, product.id);
    return review ? toOwnShape(review) : null;
  },

  async create(slug, userId, { rating, title, comment }) {
    const product = await resolveProduct(slug);

    const existing = await reviewRepository.findByUserAndProduct(userId, product.id);
    if (existing) {
      throw new ApiError(409, "You've already reviewed this product");
    }

    return prisma.$transaction(async (tx) => {
      const review = await reviewRepository.create(
        { productId: product.id, userId, rating, title, comment },
        tx
      );
      await reviewRepository.recomputeProductRating(product.id, tx);
      return toOwnShape(review);
    });
  },

  async update(slug, userId, reviewId, { rating, title, comment }) {
    const product = await resolveProduct(slug);
    await findOwnReviewOrThrow(userId, product.id, reviewId);

    return prisma.$transaction(async (tx) => {
      const updated = await reviewRepository.update(reviewId, { rating, title, comment }, tx);
      await reviewRepository.recomputeProductRating(product.id, tx);
      return toOwnShape(updated);
    });
  },

  async remove(slug, userId, reviewId) {
    const product = await resolveProduct(slug);
    await findOwnReviewOrThrow(userId, product.id, reviewId);

    await prisma.$transaction(async (tx) => {
      await reviewRepository.softDelete(reviewId, tx);
      await reviewRepository.recomputeProductRating(product.id, tx);
    });
  },
};
