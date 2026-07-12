// CSRF token generation — a plain random value, not a JWT or anything
// verifiable on its own. Its security comes entirely from the
// double-submit pattern (middlewares/csrf.js): a cross-site attacker can
// trick a browser into sending cookies automatically, but can't read
// document.cookie on this origin to also attach it as a header, so a
// forged request will always be missing (or mismatch) the header even
// though the cookie rides along.

import crypto from "crypto";

export function generateCsrfToken() {
  return crypto.randomBytes(24).toString("hex");
}
