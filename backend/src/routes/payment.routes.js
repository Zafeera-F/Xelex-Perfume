import { Router } from "express";
import { initiateCheckout, verifyPayment, handleWebhook } from "../controllers/payment.controller.js";
import { initiateCheckoutValidator, verifyPaymentValidator } from "../validators/payment.validator.js";
import { validate } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/checkout", requireAuth, initiateCheckoutValidator, validate, initiateCheckout);
router.post("/verify", requireAuth, verifyPaymentValidator, validate, verifyPayment);

// No requireAuth — Razorpay calls this directly (server-to-server), and
// it's authenticated via signature verification (payment.service.js)
// instead of a customer session/cookie.
router.post("/webhook", handleWebhook);

export default router;
