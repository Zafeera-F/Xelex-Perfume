// Sentry config — the one place that knows the DSN.
// -----------------------------------------------------------------------------
// Same graceful-degradation posture as every other integration in this
// codebase (config/mailer.js, config/razorpay.js, config/sms.js): if
// SENTRY_DSN is unset, the app runs exactly as it does today — errors are
// still generic-to-the-client and console.error'd server-side (see
// middlewares/errorHandler.js), just not additionally reported anywhere.

import * as Sentry from "@sentry/node";

const SENTRY_DSN = process.env.SENTRY_DSN;

export const isSentryConfigured = Boolean(SENTRY_DSN);

if (isSentryConfigured) {
  Sentry.init({ dsn: SENTRY_DSN, environment: process.env.NODE_ENV || "development" });
}

export { Sentry };
