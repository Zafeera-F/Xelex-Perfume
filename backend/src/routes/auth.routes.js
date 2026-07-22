import { Router } from "express";
import {
  register,
  login,
  verifyMfaLogin,
  requestPhoneOtp,
  verifyPhoneOtp,
  refresh,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  setupMfa,
  confirmMfaSetup,
  disableMfa,
} from "../controllers/auth.controller.js";
import {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
  mfaCodeValidator,
  disableMfaValidator,
  requestOtpValidator,
  verifyOtpValidator,
} from "../validators/auth.validator.js";
import { validate } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimit.js";

const router = Router();

router.post("/register", authLimiter, registerValidator, validate, register);
router.post("/login", authLimiter, loginValidator, validate, login);
// Same strict limiter as login — brute-forcing a 6-digit TOTP code (1M
// possibilities) is an even smaller search space than a password.
router.post("/mfa/login-verify", authLimiter, mfaCodeValidator, validate, verifyMfaLogin);
// No requireAuth on either — a phone login attempt has no session yet.
// authLimiter is a second layer on top of requestPhoneOtp's own per-phone
// cooldown (see auth.service.js), same "belt and suspenders" posture as
// every other auth-adjacent route here.
router.post("/otp/request", authLimiter, requestOtpValidator, validate, requestPhoneOtp);
router.post("/otp/verify", authLimiter, verifyOtpValidator, validate, verifyPhoneOtp);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/profile", requireAuth, getProfile);
router.patch("/profile", requireAuth, updateProfileValidator, validate, updateProfile);
router.patch("/change-password", requireAuth, authLimiter, changePasswordValidator, validate, changePassword);
router.post("/mfa/setup", requireAuth, setupMfa);
router.post("/mfa/verify-setup", requireAuth, authLimiter, mfaCodeValidator, validate, confirmMfaSetup);
router.post("/mfa/disable", requireAuth, authLimiter, disableMfaValidator, validate, disableMfa);

export default router;
