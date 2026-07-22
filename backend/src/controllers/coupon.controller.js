// Public coupon controller — deliberately thin, mirrors the rest of the
// app's controllers.

import { couponService } from "../services/coupon.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;
  const result = await couponService.validate(code, subtotal);
  res.status(200).json(new ApiResponse("Coupon applied successfully", result));
});
