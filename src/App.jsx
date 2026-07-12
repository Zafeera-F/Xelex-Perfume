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

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProductList from "./pages/admin/AdminProductList";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminOrderList from "./pages/admin/AdminOrderList";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import AdminCustomerList from "./pages/admin/AdminCustomerList";
import AdminCustomerDetail from "./pages/admin/AdminCustomerDetail";
import AdminReviewList from "./pages/admin/AdminReviewList";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={PATHS.home} element={<Home />} />
        <Route path={PATHS.shop} element={<Shop />} />
        <Route path={PATHS.product} element={<ProductDetails />} />
        <Route path={PATHS.about} element={<About />} />
        <Route path={PATHS.contact} element={<Contact />} />
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
      </Route>
    </Routes>
  );
}

export default App;
