import { Router } from "express";
import {
  listCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/adminCoupon.controller.js";
import { createCouponValidator, updateCouponValidator } from "../validators/adminCoupon.validator.js";
import { validate } from "../middlewares/validate.js";
import { requireAdmin, requireRole } from "../middlewares/admin.middleware.js";

const router = Router();

router.use(requireAdmin);

router.get("/", listCoupons);
router.get("/:id", getCoupon);
router.post("/", createCouponValidator, validate, createCoupon);
router.patch("/:id", updateCouponValidator, validate, updateCoupon);
router.delete("/:id", requireRole("MANAGER", "SUPER_ADMIN"), deleteCoupon);

export default router;
