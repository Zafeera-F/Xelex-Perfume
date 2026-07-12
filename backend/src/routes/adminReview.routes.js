import { Router } from "express";
import { listReviews, setReviewApproval, deleteReview } from "../controllers/adminReview.controller.js";
import { setReviewApprovalValidator } from "../validators/adminReview.validator.js";
import { validate } from "../middlewares/validate.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.use(requireAdmin);

router.get("/", listReviews);
router.patch("/:id/approve", setReviewApprovalValidator, validate, setReviewApproval);
router.delete("/:id", deleteReview);

export default router;
