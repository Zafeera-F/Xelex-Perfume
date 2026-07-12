import { Router } from "express";
import { createOrder, listOrders } from "../controllers/order.controller.js";
import { createOrderValidator } from "../validators/order.validator.js";
import { validate } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", requireAuth, createOrderValidator, validate, createOrder);
router.get("/", requireAuth, listOrders);

export default router;
