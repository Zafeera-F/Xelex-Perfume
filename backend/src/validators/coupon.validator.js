import { body } from "express-validator";

export const validateCouponValidator = [
  body("code").trim().notEmpty().withMessage("A coupon code is required"),
  body("subtotal").isFloat({ min: 0 }).withMessage("Subtotal must be a positive number"),
];
