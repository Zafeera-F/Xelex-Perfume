// Rate limiting — two tiers. `apiLimiter` is a generous ceiling applied to
// every /api route (protects against scraping/DoS without bothering real
// users doing normal browsing/shopping). `authLimiter` is the strict one —
// applied specifically to login/register/change-password on both the
// customer and admin realms, the actual brute-force/credential-stuffing
// surface — 5 attempts per 15 minutes per IP, matching the security
// checklist's own recommendation.

import rateLimit from "express-rate-limit";

const RATE_LIMIT_MESSAGE = {
  success: false,
  message: "Too many requests. Please try again later.",
  errors: [],
};

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: RATE_LIMIT_MESSAGE,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: RATE_LIMIT_MESSAGE,
});
