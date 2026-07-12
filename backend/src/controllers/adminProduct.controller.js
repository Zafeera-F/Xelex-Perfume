// Admin product controller — deliberately thin, mirrors the rest of the
// app's controllers.

import { adminProductService } from "../services/adminProduct.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listProducts = asyncHandler(async (req, res) => {
  const { page, pageSize, search, status } = req.query;
  const result = await adminProductService.list({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    search,
    status,
  });
  res.status(200).json(new ApiResponse("Products fetched successfully", result));
});

export const getFormMeta = asyncHandler(async (req, res) => {
  const meta = await adminProductService.getFormMeta();
  res.status(200).json(new ApiResponse("Form meta fetched successfully", meta));
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await adminProductService.getById(req.params.id);
  res.status(200).json(new ApiResponse("Product fetched successfully", { product }));
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await adminProductService.create(req.body);
  res.status(201).json(new ApiResponse("Product created successfully", { product }));
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await adminProductService.update(req.params.id, req.body);
  res.status(200).json(new ApiResponse("Product updated successfully", { product }));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await adminProductService.softDelete(req.params.id);
  res.status(200).json(new ApiResponse("Product deleted successfully"));
});
