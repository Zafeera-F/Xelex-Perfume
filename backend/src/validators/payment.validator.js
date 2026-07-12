// Validation chains for the Razorpay payment routes. `initiateCheckoutValidator`
// mirrors order.validator.js's createOrderValidator items/shipping shape
// (this endpoint is UPI-only, so no paymentMethod field here).

import { body } from "express-validator";

export const initiateCheckoutValidator = [
  body("items").isArray({ min: 1 }).withMessage("Your cart is empty"),
  body("items.*.productId").trim().notEmpty().withMessage("Invalid product in cart"),
  body("items.*.quantity").isInt({ min: 1 }).withMessage("Invalid quantity"),

  body("shipping.fullName").trim().notEmpty().withMessage("Full name is required"),
  body("shipping.phone").trim().notEmpty().withMessage("Phone number is required"),
  body("shipping.addressLine1").trim().notEmpty().withMessage("Address is required"),
  body("shipping.addressLine2").optional({ checkFalsy: true }).trim(),
  body("shipping.city").trim().notEmpty().withMessage("City is required"),
  body("shipping.state").trim().notEmpty().withMessage("State is required"),
  body("shipping.pincode").trim().notEmpty().withMessage("Pincode is required"),
];

export const verifyPaymentValidator = [
  body("razorpay_order_id").trim().notEmpty().withMessage("Missing order id"),
  body("razorpay_payment_id").trim().notEmpty().withMessage("Missing payment id"),
  body("razorpay_signature").trim().notEmpty().withMessage("Missing signature"),
];
