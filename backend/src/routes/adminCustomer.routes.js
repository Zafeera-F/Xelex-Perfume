import { Router } from "express";
import { listCustomers, getCustomer } from "../controllers/adminCustomer.controller.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.use(requireAdmin);

router.get("/", listCustomers);
router.get("/:id", getCustomer);

export default router;
