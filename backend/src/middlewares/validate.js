// validate — sits after a validator chain (e.g. registerValidator) and
// before the controller. If express-validator collected any errors, this
// turns them into the standard failure response format instead of letting
// each route handle validation results itself.

import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

export function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));

  next(new ApiError(422, "Validation failed", errors));
}
