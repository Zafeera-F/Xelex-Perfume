import { Router } from "express";
import {
  listSlides,
  getSlide,
  createSlide,
  updateSlide,
  deleteSlide,
  reorderSlides,
} from "../controllers/adminHeroSlide.controller.js";
import {
  createHeroSlideValidator,
  updateHeroSlideValidator,
  reorderHeroSlidesValidator,
} from "../validators/heroSlide.validator.js";
import { validate } from "../middlewares/validate.js";
import { requireAdmin, requireRole } from "../middlewares/admin.middleware.js";

const router = Router();

router.use(requireAdmin);

// /reorder must come before /:id — otherwise "reorder" would be captured as
// an id value and never reach this route.
router.patch("/reorder", reorderHeroSlidesValidator, validate, reorderSlides);
router.get("/", listSlides);
router.get("/:id", getSlide);
router.post("/", createHeroSlideValidator, validate, createSlide);
router.patch("/:id", updateHeroSlideValidator, validate, updateSlide);
router.delete("/:id", requireRole("MANAGER", "SUPER_ADMIN"), deleteSlide);

export default router;
