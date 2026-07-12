import { Router } from "express";
import { getStats } from "../controllers/adminDashboard.controller.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.use(requireAdmin);

router.get("/", getStats);

export default router;
