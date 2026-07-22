// Public hero slide controller — deliberately thin, mirrors the rest of the
// app's controllers.

import { heroSlideService } from "../services/heroSlide.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listPublicSlides = asyncHandler(async (req, res) => {
  const slides = await heroSlideService.listPublic();
  res.status(200).json(new ApiResponse("Hero slides fetched successfully", { slides }));
});
