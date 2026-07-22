// Payment controller — deliberately thin, mirrors the rest of the app's
// controllers. `handleWebhook` is the one unusual route: no auth (Razorpay
// calls it directly, verified via signature instead), and it reads
// `req.rawBody` (captured by app.js's express.json `verify` callback)
// rather than the parsed `req.body`, since signature verification needs
// the exact bytes Razorpay signed.

import { paymentService } from "../services/payment.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const initiateCheckout = asyncHandler(async (req, res) => {
  const { items, shipping, couponCode } = req.body;
  const result = await paymentService.initiateCheckout(req.user.id, { items, shipping, couponCode });
  res.status(201).json(new ApiResponse("Checkout initiated", result));
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const order = await paymentService.verifyPayment(req.user.id, {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });
  res.status(200).json(new ApiResponse("Payment verified successfully", { order }));
});

export const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.get("x-razorpay-signature");
  const result = await paymentService.handleWebhookEvent(req.rawBody, signature);
  res.status(200).json(result);
});
