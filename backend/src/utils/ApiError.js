// ApiError — a plain Error subclass carrying an HTTP status code.
// -----------------------------------------------------------------------------
// Future routes throw this instead of a bare `Error` or hand-rolling a
// response shape inline, e.g.:
//   throw new ApiError(404, "Product not found");
// The centralized error handler (middlewares/errorHandler.js) knows how to
// read `.status` off of it and respond consistently — this is the one piece
// of shared vocabulary every future API module (auth, products, orders, ...)
// will use for error cases.
//
// The optional `errors` array is for field-level validation failures, e.g.
//   throw new ApiError(422, "Validation failed", [{ field: "email", message: "..." }])

export class ApiError extends Error {
  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.name = "ApiError";
  }
}
