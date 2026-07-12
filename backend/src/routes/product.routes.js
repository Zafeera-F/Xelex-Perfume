import { Router } from "express";
import { listProducts, getProduct, getFacets } from "../controllers/product.controller.js";
import {
  listReviews,
  getMyReview,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/review.controller.js";
import { listProductsValidator } from "../validators/product.validator.js";
import { createReviewValidator, updateReviewValidator } from "../validators/review.validator.js";
import { validate } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// /facets must come before /:slug — otherwise "facets" would be captured
// as a slug value and never reach this route.
router.get("/facets", getFacets);
router.get("/", listProductsValidator, validate, listProducts);
router.get("/:slug", getProduct);

// Reviews are a sub-resource of a product, so they live in this same
// router (mixing public and requireAuth-gated routes per-route, same as
// auth.routes.js already does) rather than a separately-mounted file.
router.get("/:slug/reviews", listReviews);
router.get("/:slug/reviews/me", requireAuth, getMyReview);
router.post("/:slug/reviews", requireAuth, createReviewValidator, validate, createReview);
router.patch("/:slug/reviews/:reviewId", requireAuth, updateReviewValidator, validate, updateReview);
router.delete("/:slug/reviews/:reviewId", requireAuth, deleteReview);

export default router;
