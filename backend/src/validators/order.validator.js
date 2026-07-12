// Validation chain for POST /api/orders.

import { body } from "express-validator";

export const createOrderValidator = [
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

  body("paymentMethod").isIn(["UPI", "COD"]).withMessage("Invalid payment method"),
];
