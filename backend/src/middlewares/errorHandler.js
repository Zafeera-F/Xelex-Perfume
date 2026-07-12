// errorHandler — the ONLY place in the app that formats an error into an
// HTTP response. Every future route (auth, products, cart, orders, ...)
// can just `throw new ApiError(...)` or call `next(err)` and trust that it
// lands here with a consistent JSON shape, rather than each route module
// reinventing its own error response format.
//
// Must be registered LAST in app.js, after notFound and all real routes —
// Express recognizes it as an error handler specifically because it takes
// 4 arguments (err, req, res, next).
//
// ApiError vs. everything else is a deliberate trust boundary: ApiError
// messages are hand-written by this codebase specifically to be safe to
// show a client ("Product not found", "Invalid email or password", ...).
// Anything else — a raw Prisma error, a TypeError from a bug, whatever —
// was never written with an end user in mind, so its .message might
// reveal schema/column names or internal structure. Those always get a
// fixed generic message instead, in every environment, and are always
// logged server-side (not just in dev) so they're never a silent blind
// spot in production.

import { ApiError } from "../utils/ApiError.js";
import { Sentry, isSentryConfigured } from "../config/sentry.js";

const GENERIC_MESSAGE = "Something went wrong. Please try again.";

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const isSafe = err instanceof ApiError;
  const status = err.status || err.statusCode || 500;
  const message = isSafe ? err.message : GENERIC_MESSAGE;
  const errors = isSafe ? err.errors || [] : [];

  if (!isSafe) {
    // Always logged, including production — an unexpected error hidden
    // from the client must still be visible to us. Sentry (when
    // configured) gets this too, alongside the console log rather than
    // instead of it.
    console.error(err);
    if (isSentryConfigured) Sentry.captureException(err);
  } else if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(status).json({
    success: false,
    message,
    errors,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}
