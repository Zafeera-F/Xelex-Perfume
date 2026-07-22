// Upload middleware — local-disk storage for admin-uploaded images.
// Swapping this for a cloud storage backend (S3/Cloudinary) later only
// means changing this one file; every consumer just calls `upload.single()`
// and reads `req.file`, same as any multer setup.

import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(new Error("Only JPEG, PNG, WEBP, or GIF images are allowed"));
    return;
  }
  cb(null, true);
}

// One multer instance per upload "kind" (products, hero slides, ...), each
// writing to its own subdirectory under uploads/. Directories are created
// on first use rather than at import time — keeps this module side-effect-
// free until an upload actually happens.
function makeUploader(subdir) {
  const dir = path.join(UPLOAD_ROOT, subdir);

  const storage = multer.diskStorage({
    destination(req, file, cb) {
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename(req, file, cb) {
      // Random name (not the original filename) — avoids collisions and
      // path-traversal/special-character concerns entirely.
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${crypto.randomUUID()}${ext}`);
    },
  });

  return multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB
}

export const upload = makeUploader("products");
export const heroSlideUpload = makeUploader("hero-slides");

export const UPLOAD_URL_PREFIX = "/uploads/products";
export const HERO_SLIDE_UPLOAD_URL_PREFIX = "/uploads/hero-slides";
