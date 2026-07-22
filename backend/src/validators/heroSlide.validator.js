// Validation chains for the admin hero slide routes.

import { body } from "express-validator";

// require_tld: false — uploaded image URLs point at localhost in dev
// (http://localhost:5000/uploads/...), which validator.js's default isURL
// would otherwise reject for lacking a top-level domain.
const isImageUrl = () => body("imageUrl").isURL({ require_tld: false }).withMessage("A valid image URL is required");

export const createHeroSlideValidator = [
  isImageUrl(),
  body("heading").trim().notEmpty().withMessage("Heading is required"),
  body("description").optional({ checkFalsy: true }).trim(),
  body("buttonText").optional({ checkFalsy: true }).trim(),
  body("buttonLink").optional({ checkFalsy: true }).trim(),
  body("sortOrder").optional().isInt().withMessage("Sort order must be an integer"),
  body("isEnabled").optional().isBoolean(),
];

export const updateHeroSlideValidator = [
  body("imageUrl").optional().isURL({ require_tld: false }).withMessage("A valid image URL is required"),
  body("heading").optional().trim().notEmpty().withMessage("Heading cannot be empty"),
  body("description").optional({ checkFalsy: true }).trim(),
  body("buttonText").optional({ checkFalsy: true }).trim(),
  body("buttonLink").optional({ checkFalsy: true }).trim(),
  body("sortOrder").optional().isInt().withMessage("Sort order must be an integer"),
  body("isEnabled").optional().isBoolean(),
];

export const reorderHeroSlidesValidator = [
  body("order").isArray({ min: 1 }).withMessage("Order must be a non-empty array"),
  body("order.*").isUUID().withMessage("Each order entry must be a valid id"),
];
