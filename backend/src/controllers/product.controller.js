// Product controller — deliberately thin, mirrors auth.controller.js /
// admin.controller.js. Public endpoints: no auth, no cookies involved.

import { productService } from "../services/product.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listProducts = asyncHandler(async (req, res) => {
  const featured = req.query.featured === "true";
  const bestSeller = req.query.bestSeller === "true";
  const products = await productService.list({ featured, bestSeller });
  res.status(200).json(new ApiResponse("Products fetched successfully", { products }));
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getBySlug(req.params.slug);
  res.status(200).json(new ApiResponse("Product fetched successfully", { product }));
});

export const getFacets = asyncHandler(async (req, res) => {
  const facets = await productService.getFacets();
  res.status(200).json(new ApiResponse("Facets fetched successfully", facets));
});
