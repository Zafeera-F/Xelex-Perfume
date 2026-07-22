import { Router } from "express";
import { listPublicSlides } from "../controllers/heroSlide.controller.js";

const router = Router();

router.get("/", listPublicSlides);

export default router;
