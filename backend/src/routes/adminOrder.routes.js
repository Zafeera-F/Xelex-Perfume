import { Router } from "express";
import {
  listOrders,
  getOrder,
  updateOrderStatus,
  updateOrderPayment,
} from "../controllers/adminOrder.controller.js";
import { updateStatusValidator, updatePaymentValidator } from "../validators/adminOrder.validator.js";
import { validate } from "../middlewares/validate.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.use(requireAdmin);

router.get("/", listOrders);
router.get("/:id", getOrder);
router.patch("/:id/status", updateStatusValidator, validate, updateOrderStatus);
router.patch("/:id/payment", updatePaymentValidator, validate, updateOrderPayment);

export default router;
