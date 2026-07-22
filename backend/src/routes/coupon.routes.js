import { Router } from "express";
import { validateCoupon } from "../controllers/coupon.controller.js";
import { validateCouponValidator } from "../validators/coupon.validator.js";
import { validate } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// requireAuth is safe here (not a CSRF-cookie problem like newsletter
// subscribe) — Checkout.jsx already redirects guests to /login before a
// coupon field is ever reachable, so a real session + CSRF cookie exist by
// the time this is called.
router.post("/validate", requireAuth, validateCouponValidator, validate, validateCoupon);

export default router;
