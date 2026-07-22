// Root router
// -----------------------------------------------------------------------------
// Mounts the health check plus every feature router. Future sprints add
// more routers here the same way auth is wired up below, e.g.:
//
//   import productRoutes from "./product.routes.js";
//   router.use("/api/products", productRoutes);
//
// Each feature router lives in its own file in this folder, keeping route
// definitions separate from the controllers/logic that handle them.

import { Router } from "express";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import productRoutes from "./product.routes.js";
import orderRoutes from "./order.routes.js";
import adminProductRoutes from "./adminProduct.routes.js";
import adminOrderRoutes from "./adminOrder.routes.js";
import uploadRoutes from "./upload.routes.js";
import wishlistRoutes from "./wishlist.routes.js";
import adminReviewRoutes from "./adminReview.routes.js";
import paymentRoutes from "./payment.routes.js";
import adminDashboardRoutes from "./adminDashboard.routes.js";
import adminCustomerRoutes from "./adminCustomer.routes.js";
import newsletterRoutes from "./newsletter.routes.js";
import adminNewsletterRoutes from "./adminNewsletter.routes.js";

const router = Router();

// GET / — health check. Confirms the API process is running and reachable,
// independent of whether any feature routes or the database are working.
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "XeleX Perfume API Running",
  });
});

router.use("/api/auth", authRoutes);
router.use("/api/admin/auth", adminRoutes);
router.use("/api/products", productRoutes);
router.use("/api/orders", orderRoutes);
router.use("/api/admin/products", adminProductRoutes);
router.use("/api/admin/orders", adminOrderRoutes);
router.use("/api/admin/uploads", uploadRoutes);
router.use("/api/wishlist", wishlistRoutes);
router.use("/api/admin/reviews", adminReviewRoutes);
router.use("/api/payments/razorpay", paymentRoutes);
router.use("/api/admin/dashboard", adminDashboardRoutes);
router.use("/api/admin/customers", adminCustomerRoutes);
router.use("/api/newsletter", newsletterRoutes);
router.use("/api/admin/newsletter", adminNewsletterRoutes);

export default router;
