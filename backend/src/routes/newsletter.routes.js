import { Router } from "express";
import { subscribe } from "../controllers/newsletter.controller.js";
import { subscribeValidator } from "../validators/newsletter.validator.js";
import { validate } from "../middlewares/validate.js";

const router = Router();

router.post("/subscribe", subscribeValidator, validate, subscribe);

export default router;
