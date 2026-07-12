import { Router } from "express";
import { listWishlist, addToWishlist, removeFromWishlist } from "../controllers/wishlist.controller.js";
import { addToWishlistValidator } from "../validators/wishlist.validator.js";
import { validate } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", listWishlist);
router.post("/", addToWishlistValidator, validate, addToWishlist);
router.delete("/:productId", removeFromWishlist);

export default router;
