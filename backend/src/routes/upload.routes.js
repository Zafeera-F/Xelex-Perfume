import { Router } from "express";
import { uploadImage, uploadHeroSlideImage } from "../controllers/upload.controller.js";
import { upload, heroSlideUpload } from "../middlewares/upload.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import { ApiError } from "../utils/ApiError.js";

const router = Router();

// multer reports bad file type / too-large as a plain error via its own
// callback, not a thrown exception asyncHandler could catch — translate it
// into the app's standard ApiError shape (422) instead of letting it fall
// through to errorHandler.js's 500 default.
function handleSingleImage(req, res, next) {
  upload.single("image")(req, res, (err) => {
    if (err) return next(new ApiError(422, err.message || "Image upload failed"));
    next();
  });
}

function handleHeroSlideImage(req, res, next) {
  heroSlideUpload.single("image")(req, res, (err) => {
    if (err) return next(new ApiError(422, err.message || "Image upload failed"));
    next();
  });
}

router.post("/", requireAdmin, handleSingleImage, uploadImage);
router.post("/hero-slides", requireAdmin, handleHeroSlideImage, uploadHeroSlideImage);

export default router;
