// Validation chains for the admin product routes.

import { body } from "express-validator";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// require_tld: false — uploaded image URLs point at localhost in dev
// (http://localhost:5000/uploads/...), which validator.js's default isURL
// would otherwise reject for lacking a top-level domain.
const isImageUrl = () => body("images.*.url").isURL({ require_tld: false }).withMessage("Each image must have a valid URL");

export const createProductValidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("slug")
    .trim()
    .notEmpty()
    .withMessage("Slug is required")
    .matches(SLUG_REGEX)
    .withMessage("Slug must be lowercase letters, numbers, and hyphens only"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("compareAtPrice").optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage("Compare-at price must be a positive number"),
  body("stockQuantity").isInt({ min: 0 }).withMessage("Stock quantity must be a non-negative integer"),
  body("categoryId").trim().notEmpty().withMessage("Category is required"),
  body("collectionId").optional({ checkFalsy: true }).trim(),
  body("isActive").optional().isBoolean(),
  body("isFeatured").optional().isBoolean(),
  body("isBestSeller").optional().isBoolean(),
  body("images").optional().isArray(),
  isImageUrl(),
];

export const updateProductValidator = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("slug")
    .optional()
    .trim()
    .notEmpty()
    .matches(SLUG_REGEX)
    .withMessage("Slug must be lowercase letters, numbers, and hyphens only"),
  body("description").optional().trim().notEmpty().withMessage("Description cannot be empty"),
  body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("compareAtPrice").optional({ checkFalsy: true }).isFloat({ min: 0 }),
  body("stockQuantity").optional().isInt({ min: 0 }).withMessage("Stock quantity must be a non-negative integer"),
  body("categoryId").optional().trim().notEmpty().withMessage("Category cannot be empty"),
  body("collectionId").optional({ checkFalsy: true }).trim(),
  body("isActive").optional().isBoolean(),
  body("isFeatured").optional().isBoolean(),
  body("isBestSeller").optional().isBoolean(),
  body("images").optional().isArray(),
  isImageUrl(),
];
