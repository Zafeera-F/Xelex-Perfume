// Upload middleware — local-disk storage for admin-uploaded product images.
// Swapping this for a cloud storage backend (S3/Cloudinary) later only
// means changing this one file; every consumer just calls `upload.single()`
// and reads `req.file`, same as any multer setup.

import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "products");

// Created on first use rather than at import time — keeps this module
// side-effect-free until an upload actually happens.
function ensureUploadDir() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    ensureUploadDir();
    cb(null, UPLOAD_DIR);
  },
  filename(req, file, cb) {
    // Random name (not the original filename) — avoids collisions and
    // path-traversal/special-character concerns entirely.
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(new Error("Only JPEG, PNG, WEBP, or GIF images are allowed"));
    return;
  }
  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const UPLOAD_URL_PREFIX = "/uploads/products";
