// Wishlist controller — deliberately thin, mirrors the rest of the app's
// controllers. Every route requires an authenticated customer.

import { wishlistService } from "../services/wishlist.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listWishlist = asyncHandler(async (req, res) => {
  const products = await wishlistService.list(req.user.id);
  res.status(200).json(new ApiResponse("Wishlist fetched successfully", { products }));
});

export const addToWishlist = asyncHandler(async (req, res) => {
  await wishlistService.add(req.user.id, req.body.productId);
  res.status(201).json(new ApiResponse("Added to wishlist"));
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  await wishlistService.remove(req.user.id, req.params.productId);
  res.status(200).json(new ApiResponse("Removed from wishlist"));
});
