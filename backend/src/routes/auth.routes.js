import { Router } from "express";
import {
  register,
  login,
  logout,
  getProfile,
  changePassword,
} from "../controllers/auth.controller.js";
import {
  registerValidator,
  loginValidator,
  changePasswordValidator,
} from "../validators/auth.validator.js";
import { validate } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.post("/logout", logout);
router.get("/profile", requireAuth, getProfile);
router.patch("/change-password", requireAuth, changePasswordValidator, validate, changePassword);

export default router;
