// Phone OTP helpers — a numeric code, hashed the same way
// utils/refreshToken.js hashes its opaque token: SHA-256 is appropriate
// here too, since the code is short-lived (OTP_EXPIRES_IN_MS) and already
// throttled by MAX_OTP_ATTEMPTS + rate limiting, unlike a password that
// must resist offline cracking indefinitely.

import crypto from "crypto";

export const OTP_EXPIRES_IN_MS = 5 * 60 * 1000; // 5 minutes — matches auth.service.js's MFA_PENDING_EXPIRES_IN convention
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds between requests for the same phone
export const MAX_OTP_ATTEMPTS = 5;

export function generateOtp() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashOtp(code) {
  return crypto.createHash("sha256").update(code).digest("hex");
}
