// Admin order controller — deliberately thin, mirrors the rest of the
// app's controllers.

import { adminOrderService } from "../services/adminOrder.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listOrders = asyncHandler(async (req, res) => {
  const { page, pageSize, status } = req.query;
  const result = await adminOrderService.list({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    status,
  });
  res.status(200).json(new ApiResponse("Orders fetched successfully", result));
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await adminOrderService.getById(req.params.id);
  res.status(200).json(new ApiResponse("Order fetched successfully", { order }));
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await adminOrderService.updateStatus(req.params.id, req.body.status);
  res.status(200).json(new ApiResponse("Order status updated successfully", { order }));
});

export const updateOrderPayment = asyncHandler(async (req, res) => {
  const { status, transactionId } = req.body;
  const order = await adminOrderService.updatePayment(req.params.id, { status, transactionId });
  res.status(200).json(new ApiResponse("Payment status updated successfully", { order }));
});
