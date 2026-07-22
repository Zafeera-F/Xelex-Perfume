// Admin hero slide controller — deliberately thin, mirrors
// adminProduct.controller.js.

import { heroSlideService } from "../services/heroSlide.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listSlides = asyncHandler(async (req, res) => {
  const slides = await heroSlideService.listForAdmin();
  res.status(200).json(new ApiResponse("Hero slides fetched successfully", { slides }));
});

export const getSlide = asyncHandler(async (req, res) => {
  const slide = await heroSlideService.getById(req.params.id);
  res.status(200).json(new ApiResponse("Hero slide fetched successfully", { slide }));
});

export const createSlide = asyncHandler(async (req, res) => {
  const slide = await heroSlideService.create(req.body);
  res.status(201).json(new ApiResponse("Hero slide created successfully", { slide }));
});

export const updateSlide = asyncHandler(async (req, res) => {
  const slide = await heroSlideService.update(req.params.id, req.body);
  res.status(200).json(new ApiResponse("Hero slide updated successfully", { slide }));
});

export const deleteSlide = asyncHandler(async (req, res) => {
  await heroSlideService.delete(req.params.id);
  res.status(200).json(new ApiResponse("Hero slide deleted successfully"));
});

export const reorderSlides = asyncHandler(async (req, res) => {
  await heroSlideService.reorder(req.body.order);
  res.status(200).json(new ApiResponse("Hero slides reordered successfully"));
});
