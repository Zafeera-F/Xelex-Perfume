// Review controller — deliberately thin, mirrors the rest of the app's
// controllers.

import { reviewService } from "../services/review.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.listForProduct(req.params.slug);
  res.status(200).json(new ApiResponse("Reviews fetched successfully", { reviews }));
});

export const getMyReview = asyncHandler(async (req, res) => {
  const review = await reviewService.getMyReview(req.params.slug, req.user.id);
  res.status(200).json(new ApiResponse("Review fetched successfully", { review }));
});

export const createReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;
  const review = await reviewService.create(req.params.slug, req.user.id, { rating, title, comment });
  res.status(201).json(new ApiResponse("Review posted successfully", { review }));
});

export const updateReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;
  const review = await reviewService.update(req.params.slug, req.user.id, req.params.reviewId, {
    rating,
    title,
    comment,
  });
  res.status(200).json(new ApiResponse("Review updated successfully", { review }));
});

export const deleteReview = asyncHandler(async (req, res) => {
  await reviewService.remove(req.params.slug, req.user.id, req.params.reviewId);
  res.status(200).json(new ApiResponse("Review deleted successfully"));
});
