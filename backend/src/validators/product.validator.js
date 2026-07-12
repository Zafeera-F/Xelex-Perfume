// Validation chain for the products list route's query params.

import { query } from "express-validator";

export const listProductsValidator = [
  query("featured").optional().isBoolean().withMessage("featured must be true or false"),
  query("bestSeller").optional().isBoolean().withMessage("bestSeller must be true or false"),
];
