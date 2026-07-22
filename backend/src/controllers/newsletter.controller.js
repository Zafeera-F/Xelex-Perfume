// Newsletter controller — deliberately thin, mirrors the rest of the app's
// controllers.

import { newsletterService } from "../services/newsletter.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const subscribe = asyncHandler(async (req, res) => {
  await newsletterService.subscribe(req.body.email);
  res.status(201).json(new ApiResponse("Subscribed successfully"));
});

export const listSubscribers = asyncHandler(async (req, res) => {
  const { page = 1, pageSize = 10, search } = req.query;
  const result = await newsletterService.listForAdmin({
    page: Number(page),
    pageSize: Number(pageSize),
    search,
  });
  res.status(200).json(new ApiResponse("Subscribers fetched successfully", result));
});
