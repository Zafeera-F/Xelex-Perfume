import { Router } from "express";
import { listSubscribers } from "../controllers/newsletter.controller.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.use(requireAdmin);

router.get("/", listSubscribers);

export default router;
