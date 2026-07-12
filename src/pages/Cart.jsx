import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import Breadcrumb from "../components/ui/Breadcrumb";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import CartItemRow from "../components/cart/CartItemRow";
import OrderSummary from "../components/cart/OrderSummary";
import { fadeInUp } from "../lib/animations";
import { useCart } from "../context/CartContext";
import { PATHS } from "../routes/paths";

export default function Cart() {
  const { lines, itemCount, subtotal, updateQuantity, removeFromCart, isLoading } = useCart();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">
      <Breadcrumb items={[{ label: "Home", to: PATHS.home }, { label: "Cart" }]} />

      <motion.h1
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="mt-6 font-display text-3xl text-ivory md:text-4xl"
      >
        Your Cart
      </motion.h1>

      {isLoading ? (
        <div className="min-h-[50vh]" />
      ) : lines.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Explore the collection and find a fragrance worth adding."
          actionLabel="Continue Shopping"
          onAction={() => navigate(PATHS.shop)}
        />
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-[1fr_340px]">
          <div>
            {lines.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
            <Button as={Link} to={PATHS.shop} variant="ghost" className="mt-6 px-0">
              ← Continue Shopping
            </Button>
          </div>

          <div>
            <OrderSummary subtotal={subtotal} itemCount={itemCount} />
          </div>
        </div>
      )}
    </div>
  );
}
