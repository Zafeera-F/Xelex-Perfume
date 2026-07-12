// Admin customer controller — deliberately thin, mirrors the rest of the
// app's controllers.

import { adminCustomerService } from "../services/adminCustomer.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listCustomers = asyncHandler(async (req, res) => {
  const { page, pageSize, search } = req.query;
  const result = await adminCustomerService.list({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    search,
  });
  res.status(200).json(new ApiResponse("Customers fetched successfully", result));
});

export const getCustomer = asyncHandler(async (req, res) => {
  const result = await adminCustomerService.getById(req.params.id);
  res.status(200).json(new ApiResponse("Customer fetched successfully", result));
});
