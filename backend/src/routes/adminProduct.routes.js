import { Router } from "express";
import {
  listProducts,
  getFormMeta,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/adminProduct.controller.js";
import { createProductValidator, updateProductValidator } from "../validators/adminProduct.validator.js";
import { validate } from "../middlewares/validate.js";
import { requireAdmin, requireRole } from "../middlewares/admin.middleware.js";

const router = Router();

router.use(requireAdmin);

// /meta must come before /:id — otherwise "meta" would be captured as an
// id value and never reach this route.
router.get("/meta", getFormMeta);
router.get("/", listProducts);
router.get("/:id", getProduct);
router.post("/", createProductValidator, validate, createProduct);
router.patch("/:id", updateProductValidator, validate, updateProduct);
router.delete("/:id", requireRole("MANAGER", "SUPER_ADMIN"), deleteProduct);

export default router;
