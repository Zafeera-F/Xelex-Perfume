import { body } from "express-validator";

export const setReviewApprovalValidator = [
  body("isApproved").isBoolean().withMessage("isApproved must be true or false"),
];
