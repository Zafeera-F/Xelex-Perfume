// Razorpay client — the one place that knows the API keys.
// -----------------------------------------------------------------------------
// Deliberately does NOT fail loudly at import time the way jwt.js does for
// JWT_SECRET. JWT_SECRET is required for the app to function at all (every
// customer session depends on it); Razorpay keys are only required for the
// UPI payment routes specifically. Crashing the entire server — breaking
// COD checkout, auth, browsing, everything — just because the gateway
// hasn't been configured yet would violate "don't break existing
// functionality" far worse than the alternative: the payment routes
// individually report "not configured" (503) via `isRazorpayConfigured`,
// and everything else keeps working normally.

import Razorpay from "razorpay";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

export const isRazorpayConfigured = Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);

export const razorpay = isRazorpayConfigured
  ? new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET })
  : null;

export { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET };
