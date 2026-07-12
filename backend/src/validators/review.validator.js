import { body } from "express-validator";

const reviewFields = [
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("title").optional({ checkFalsy: true }).trim().isLength({ max: 100 }).withMessage("Title must be 100 characters or fewer"),
  body("comment").optional({ checkFalsy: true }).trim().isLength({ max: 1000 }).withMessage("Comment must be 1000 characters or fewer"),
];

export const createReviewValidator = reviewFields;
export const updateReviewValidator = reviewFields;
