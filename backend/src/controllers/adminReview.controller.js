// Admin review controller — deliberately thin, mirrors the rest of the
// app's controllers.

import { adminReviewService } from "../services/adminReview.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listReviews = asyncHandler(async (req, res) => {
  const { page, pageSize, search, status } = req.query;
  const result = await adminReviewService.list({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    search,
    status,
  });
  res.status(200).json(new ApiResponse("Reviews fetched successfully", result));
});

export const setReviewApproval = asyncHandler(async (req, res) => {
  await adminReviewService.setApproved(req.params.id, req.body.isApproved);
  res.status(200).json(new ApiResponse("Review updated successfully"));
});

export const deleteReview = asyncHandler(async (req, res) => {
  await adminReviewService.remove(req.params.id);
  res.status(200).json(new ApiResponse("Review deleted successfully"));
});
