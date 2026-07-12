// notFound — must be registered AFTER every real route and BEFORE the
// centralized error handler. Anything that reaches this point didn't match
// any route this app defines, so it's turned into a 404 ApiError and handed
// to errorHandler.js for a consistent response shape.

import { ApiError } from "../utils/ApiError.js";

export function notFound(req, res, next) {
  next(new ApiError(404, `Route not found - ${req.method} ${req.originalUrl}`));
}
