// Admin coupon controller — deliberately thin, mirrors
// adminProduct.controller.js. Activate/deactivate is just PATCH {isActive};
// usage stats (usedCount/usageLimit) already ride along on every list/detail
// response, so neither needs a dedicated endpoint.

import { adminCouponService } from "../services/adminCoupon.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listCoupons = asyncHandler(async (req, res) => {
  const { page, pageSize, search, status } = req.query;
  const result = await adminCouponService.list({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    search,
    status,
  });
  res.status(200).json(new ApiResponse("Coupons fetched successfully", result));
});

export const getCoupon = asyncHandler(async (req, res) => {
  const coupon = await adminCouponService.getById(req.params.id);
  res.status(200).json(new ApiResponse("Coupon fetched successfully", { coupon }));
});

export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await adminCouponService.create(req.body);
  res.status(201).json(new ApiResponse("Coupon created successfully", { coupon }));
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await adminCouponService.update(req.params.id, req.body);
  res.status(200).json(new ApiResponse("Coupon updated successfully", { coupon }));
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  await adminCouponService.delete(req.params.id);
  res.status(200).json(new ApiResponse("Coupon deleted successfully"));
});
