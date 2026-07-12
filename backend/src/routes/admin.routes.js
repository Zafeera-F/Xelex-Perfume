import { Router } from "express";
import {
  login,
  verifyMfaLogin,
  refresh,
  logout,
  getProfile,
  changePassword,
  setupMfa,
  confirmMfaSetup,
} from "../controllers/admin.controller.js";
import {
  adminLoginValidator,
  adminChangePasswordValidator,
  adminMfaCodeValidator,
} from "../validators/admin.validator.js";
import { validate } from "../middlewares/validate.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import { authLimiter } from "../middlewares/rateLimit.js";

const router = Router();

router.post("/login", authLimiter, adminLoginValidator, validate, login);
router.post("/mfa/login-verify", authLimiter, adminMfaCodeValidator, validate, verifyMfaLogin);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/profile", requireAdmin, getProfile);
router.patch("/change-password", requireAdmin, authLimiter, adminChangePasswordValidator, validate, changePassword);
// requireAdmin allows these two through even before MFA is enabled —
// otherwise an admin could never complete the enrollment it's gating on
// (see requireAdmin's own allowlist in middlewares/admin.middleware.js).
router.post("/mfa/setup", requireAdmin, setupMfa);
router.post("/mfa/verify-setup", requireAdmin, authLimiter, adminMfaCodeValidator, validate, confirmMfaSetup);

export default router;
