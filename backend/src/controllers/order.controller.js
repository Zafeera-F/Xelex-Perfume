// Order controller — deliberately thin, mirrors the rest of the app's
// controllers. Both routes require an authenticated customer.

import { orderService } from "../services/order.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createOrder = asyncHandler(async (req, res) => {
  const { items, shipping, paymentMethod } = req.body;
  const order = await orderService.createOrder(req.user.id, { items, shipping, paymentMethod });
  res.status(201).json(new ApiResponse("Order placed successfully", { order }));
});

export const listOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.listOrders(req.user.id);
  res.status(200).json(new ApiResponse("Orders fetched successfully", { orders }));
});
