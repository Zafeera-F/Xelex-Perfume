import { Router } from "express";
import {
  login,
  logout,
  getProfile,
  changePassword,
} from "../controllers/admin.controller.js";
import {
  adminLoginValidator,
  adminChangePasswordValidator,
} from "../validators/admin.validator.js";
import { validate } from "../middlewares/validate.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.post("/login", adminLoginValidator, validate, login);
router.post("/logout", logout);
router.get("/profile", requireAdmin, getProfile);
router.patch("/change-password", requireAdmin, adminChangePasswordValidator, validate, changePassword);

export default router;
