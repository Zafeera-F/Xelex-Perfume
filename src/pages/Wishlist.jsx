import { Navigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import Breadcrumb from "../components/ui/Breadcrumb";
import EmptyState from "../components/ui/EmptyState";
import ProductCard from "../components/ui/ProductCard";
import { fadeInUp } from "../lib/animations";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { PATHS } from "../routes/paths";

export default function Wishlist() {
  const { status: authStatus } = useAuth();
  const location = useLocation();
  const { products, isLoading } = useWishlist();

  if (authStatus === "loading") {
    return <div className="min-h-[50vh]" />;
  }

  if (authStatus === "guest") {
    return <Navigate to={PATHS.login} state={{ from: location.pathname }} replace />;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="mx-auto max-w-7xl px-6 py-12 md:px-10"
    >
      <Breadcrumb items={[{ label: "Home", to: PATHS.home }, { label: "Wishlist" }]} />

      <h1 className="mt-6 font-display text-3xl text-ivory md:text-4xl">My Wishlist</h1>

      <div className="mt-10">
        {isLoading ? (
          <div className="min-h-[30vh]" />
        ) : products.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Save fragrances you love by tapping the heart on any product."
            actionLabel="Browse the Collection"
            onAction={() => (window.location.href = PATHS.shop)}
          />
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
