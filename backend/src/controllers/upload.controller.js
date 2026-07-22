// Upload controller — no service/repository layer. Multer already did the
// actual work (validating + saving the file); this just reports back where
// it landed. Nothing here talks to Prisma.

import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { UPLOAD_URL_PREFIX, HERO_SLIDE_UPLOAD_URL_PREFIX } from "../middlewares/upload.js";

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(422, "No image file was provided");
  }

  const url = `${req.protocol}://${req.get("host")}${UPLOAD_URL_PREFIX}/${req.file.filename}`;
  res.status(201).json(new ApiResponse("Image uploaded successfully", { url }));
});

export const uploadHeroSlideImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(422, "No image file was provided");
  }

  const url = `${req.protocol}://${req.get("host")}${HERO_SLIDE_UPLOAD_URL_PREFIX}/${req.file.filename}`;
  res.status(201).json(new ApiResponse("Image uploaded successfully", { url }));
});
