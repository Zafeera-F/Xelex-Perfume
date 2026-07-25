import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import { PATHS } from "./routes/paths";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ShippingPolicy from "./pages/ShippingPolicy";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import PlaceholderPage from "./components/ui/PlaceholderPage";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminMfaSetup from "./pages/admin/AdminMfaSetup";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProductList from "./pages/admin/AdminProductList";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminOrderList from "./pages/admin/AdminOrderList";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import AdminCustomerList from "./pages/admin/AdminCustomerList";
import AdminCustomerDetail from "./pages/admin/AdminCustomerDetail";
import AdminReviewList from "./pages/admin/AdminReviewList";
import AdminSubscribers from "./pages/admin/AdminSubscribers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminHeroSlideList from "./pages/admin/AdminHeroSlideList";
import AdminHeroSlideForm from "./pages/admin/AdminHeroSlideForm";
import AdminCouponList from "./pages/admin/AdminCouponList";
import AdminCouponForm from "./pages/admin/AdminCouponForm";

// Keyed on pathname only (not the full location, which also changes for
// Shop's filter/search query-param updates) — a new page should open at the
// top, but tweaking a filter checkbox shouldn't yank scroll position back up.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path={PATHS.home} element={<Home />} />
          <Route path={PATHS.shop} element={<Shop />} />
          <Route path={PATHS.product} element={<ProductDetails />} />
          <Route path={PATHS.about} element={<About />} />
          <Route path={PATHS.contact} element={<Contact />} />
          <Route path={PATHS.shippingPolicy} element={<ShippingPolicy />} />
          <Route
            path={PATHS.returnPolicy}
            element={
              <PlaceholderPage
                eyebrow="Support"
                title="Return Policy"
                description="Our returns and refund policy is coming soon."
              />
            }
          />
          <Route
            path={PATHS.faq}
            element={
              <PlaceholderPage
                eyebrow="Support"
                title="FAQ"
                description="Answers to common questions are coming soon."
              />
            }
          />
          <Route
            path={PATHS.trackOrder}
            element={
              <PlaceholderPage
                eyebrow="Company"
                title="Track Order"
                description="Order tracking is coming soon — check your account's order history in the meantime."
              />
            }
          />
          <Route
            path={PATHS.privacyPolicy}
            element={
              <PlaceholderPage
                eyebrow="Legal"
                title="Privacy Policy"
                description="Our privacy policy is coming soon."
              />
            }
          />
          <Route
            path={PATHS.terms}
            element={
              <PlaceholderPage
                eyebrow="Legal"
                title="Terms & Conditions"
                description="Our terms and conditions are coming soon."
              />
            }
          />
          <Route path={PATHS.cart} element={<Cart />} />
          <Route path={PATHS.checkout} element={<Checkout />} />
          <Route path={PATHS.wishlist} element={<Wishlist />} />
          <Route path={PATHS.login} element={<Login />} />
          <Route path={PATHS.register} element={<Register />} />
          <Route path={PATHS.profile} element={<Profile />} />
        </Route>

        {/* Standalone — not nested under AdminLayout, which assumes an
            authenticated admin (a sidebar has nothing to show otherwise). */}
        <Route path={PATHS.admin.login} element={<AdminLogin />} />
        <Route path={PATHS.admin.mfaSetup} element={<AdminMfaSetup />} />

        <Route path={PATHS.admin.root} element={<AdminLayout />}>
          <Route index element={<Navigate to={PATHS.admin.dashboard} replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProductList />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="orders" element={<AdminOrderList />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="customers" element={<AdminCustomerList />} />
          <Route path="customers/:id" element={<AdminCustomerDetail />} />
          <Route path="reviews" element={<AdminReviewList />} />
          <Route path="subscribers" element={<AdminSubscribers />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="settings/hero-slides" element={<AdminHeroSlideList />} />
          <Route path="settings/hero-slides/new" element={<AdminHeroSlideForm />} />
          <Route path="settings/hero-slides/:id/edit" element={<AdminHeroSlideForm />} />
          <Route path="coupons" element={<AdminCouponList />} />
          <Route path="coupons/new" element={<AdminCouponForm />} />
          <Route path="coupons/:id/edit" element={<AdminCouponForm />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
