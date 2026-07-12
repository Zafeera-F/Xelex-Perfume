import { body } from "express-validator";

export const addToWishlistValidator = [
  body("productId").trim().notEmpty().withMessage("productId is required"),
];
