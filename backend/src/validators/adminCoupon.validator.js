// Validation chains for the admin coupon routes.

import { body } from "express-validator";

// A PERCENTAGE discount must be a sane percentage (0-100); a FIXED discount
// just needs to be non-negative. Cross-field, hence the .custom() rather
// than a plain isFloat max.
const discountValueRule = () =>
  body("discountValue")
    .isFloat({ min: 0 })
    .withMessage("Discount value must be a positive number")
    .custom((value, { req }) => req.body.discountType !== "PERCENTAGE" || value <= 100)
    .withMessage("A percentage discount cannot exceed 100");

export const createCouponValidator = [
  body("code").trim().notEmpty().withMessage("Code is required"),
  body("description").optional({ checkFalsy: true }).trim(),
  body("discountType").isIn(["PERCENTAGE", "FIXED"]).withMessage("Discount type must be PERCENTAGE or FIXED"),
  discountValueRule(),
  body("minOrderAmount").optional({ checkFalsy: true }).isFloat({ min: 0 }),
  body("maxDiscountAmount").optional({ checkFalsy: true }).isFloat({ min: 0 }),
  body("expiresAt").optional({ checkFalsy: true }).isISO8601().withMessage("Expiry must be a valid date"),
  body("usageLimit").optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage("Usage limit must be a positive integer"),
  body("isActive").optional().isBoolean(),
];

export const updateCouponValidator = [
  body("code").optional().trim().notEmpty().withMessage("Code cannot be empty"),
  body("description").optional({ checkFalsy: true }).trim(),
  body("discountType").optional().isIn(["PERCENTAGE", "FIXED"]).withMessage("Discount type must be PERCENTAGE or FIXED"),
  body("discountValue")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Discount value must be a positive number")
    .custom((value, { req }) => req.body.discountType !== "PERCENTAGE" || value <= 100)
    .withMessage("A percentage discount cannot exceed 100"),
  body("minOrderAmount").optional({ checkFalsy: true }).isFloat({ min: 0 }),
  body("maxDiscountAmount").optional({ checkFalsy: true }).isFloat({ min: 0 }),
  body("expiresAt").optional({ checkFalsy: true }).isISO8601().withMessage("Expiry must be a valid date"),
  body("usageLimit").optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage("Usage limit must be a positive integer"),
  body("isActive").optional().isBoolean(),
];
