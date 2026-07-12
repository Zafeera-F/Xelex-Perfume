// errorHandler — the ONLY place in the app that formats an error into an
// HTTP response. Every future route (auth, products, cart, orders, ...)
// can just `throw new ApiError(...)` or call `next(err)` and trust that it
// lands here with a consistent JSON shape, rather than each route module
// reinventing its own error response format.
//
// Must be registered LAST in app.js, after notFound and all real routes —
// Express recognizes it as an error handler specifically because it takes
// 4 arguments (err, req, res, next).

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || [];

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(status).json({
    success: false,
    message,
    errors,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}
