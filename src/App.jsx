import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import { PATHS } from "./routes/paths";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import About from "./pages/About";
import Contact from "./pages/Contact";
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

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={PATHS.home} element={<Home />} />
        <Route path={PATHS.shop} element={<Shop />} />
        <Route path={PATHS.product} element={<ProductDetails />} />
        <Route path={PATHS.about} element={<About />} />
        <Route path={PATHS.contact} element={<Contact />} />
        <Route
          path={PATHS.shipping}
          element={
            <PlaceholderPage
              eyebrow="Support"
              title="Shipping"
              description="Details on delivery timelines and shipping partners are coming soon."
            />
          }
        />
        <Route
          path={PATHS.returns}
          element={
            <PlaceholderPage
              eyebrow="Support"
              title="Returns"
              description="Our returns and refund policy is coming soon."
            />
          }
        />
        <Route
          path={PATHS.faqs}
          element={
            <PlaceholderPage
              eyebrow="Support"
              title="FAQs"
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
          path={PATHS.termsOfService}
          element={
            <PlaceholderPage
              eyebrow="Legal"
              title="Terms of Service"
              description="Our terms of service are coming soon."
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
      </Route>
    </Routes>
  );
}

export default App;
