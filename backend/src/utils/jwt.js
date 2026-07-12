// JWT helpers — sign and verify only. Nothing else in the app should call
// the `jsonwebtoken` package directly; going through these two functions
// keeps the secret/expiry/algorithm choices in one place.
//
// This JWT is the ACCESS token specifically — short-lived on purpose (see
// utils/refreshToken.js for the long-lived, revocable counterpart that
// issues new ones once this expires). A stolen access token is only ever
// useful for a few minutes; there's deliberately no revocation path for it
// beyond just waiting out the expiry, since the refresh token is where
// revocation actually lives.

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";

if (!JWT_SECRET) {
  // Fail loudly at startup rather than silently signing tokens with
  // `undefined` as the secret, which would be a serious security hole.
  throw new Error("JWT_SECRET is not set in the environment.");
}

// Admins get a dedicated signing secret so the two privilege realms can
// never be conflated — a leaked/forged customer token can't be replayed as
// an admin token (or vice versa) since the signatures are verified against
// different secrets entirely, independent of cookie separation.
if (!ADMIN_JWT_SECRET) {
  throw new Error("ADMIN_JWT_SECRET is not set in the environment.");
}

// expiresIn override exists for one case: the short-lived "MFA pending"
// token (payload.purpose === "mfa") issued between password verification
// and TOTP code verification — everything else always uses the standard
// access-token expiry.
export function signToken(payload, secret = JWT_SECRET, expiresIn = JWT_EXPIRES_IN) {
  return jwt.sign(payload, secret, { expiresIn });
}

// Throws (JsonWebTokenError / TokenExpiredError) on invalid or expired
// tokens — callers (auth.middleware.js, admin.middleware.js) are expected to
// catch this.
export function verifyToken(token, secret = JWT_SECRET) {
  return jwt.verify(token, secret);
}

export { ADMIN_JWT_SECRET };
