import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import Card from "./Card";
import Badge from "./Badge";
import Button from "./Button";
import { hoverLift } from "../../lib/animations";
import { PATHS } from "../../routes/paths";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";

/**
 * ProductCard — the single card used everywhere a product is shown
 * (homepage, shop grid, search results). Takes plain data props so it
 * has no idea whether that data came from placeholder JS or a real API —
 * swapping the data source later never touches this component.
 */
export default function ProductCard({ id, name, notes, price, image, badge, inspiredBy, inStock = true, className = "" }) {
  const { addToCart } = useCart();
  const { status } = useAuth();
  const wishlist = useWishlist();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  const wishlisted = wishlist.isInWishlist(id);

  function handleAdd() {
    addToCart(id, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleWishlistToggle(e) {
    e.preventDefault(); // inside a <Link> in the image area elsewhere on the card
    if (status === "guest") {
      navigate(PATHS.login, { state: { from: PATHS.productLink(id) } });
      return;
    }
    // WishlistContext already rolls the optimistic update back on failure
    // (the heart un-fills) — that's the user-visible feedback, so a failed
    // toggle here is a silent no-op rather than an uncaught rejection.
    if (wishlisted) {
      wishlist.remove(id).catch(() => {});
    } else {
      wishlist.add({ id, name, notes, price, image, badge, inStock }).catch(() => {});
    }
  }

  return (
    <motion.div initial="rest" whileHover="hover" animate="rest" variants={hoverLift} className={className}>
      <Card className="group relative overflow-hidden">
        <Link to={PATHS.productLink(id)} className="block">
          <div className="relative h-72 overflow-hidden bg-background-soft">
            <img
              src={image}
              alt={name}
              loading="lazy"
              className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${!inStock ? "opacity-50 grayscale" : ""}`}
            />
            {badge && inStock && <Badge tone="gold" className="absolute left-4 top-4">{badge}</Badge>}
            {!inStock && <Badge tone="muted" className="absolute left-4 top-4">Out of Stock</Badge>}
          </div>
        </Link>
        <button
          onClick={handleWishlistToggle}
          aria-label={wishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
          className={`absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-background/70 backdrop-blur-sm transition-colors hover:text-gold ${
            wishlisted ? "text-gold" : "text-ivory/80"
          }`}
        >
          <Heart size={15} strokeWidth={1.5} fill={wishlisted ? "currentColor" : "none"} />
        </button>

        <div className="p-5">
          <Link to={PATHS.productLink(id)}>
            <h3 className="font-display text-lg text-ivory transition-colors hover:text-gold">
              {name}
              {inspiredBy && <span className="ml-1.5 font-body text-xs font-normal text-muted">(Inspired by {inspiredBy})</span>}
            </h3>
          </Link>
          {notes && (
            <p className="mt-1 text-xs uppercase tracking-[0.15em] text-muted">{notes}</p>
          )}
          <div className="mt-4 flex items-center justify-between">
            <span className="font-body text-lg text-gold">₹{price.toLocaleString("en-IN")}</span>
            <Button size="sm" variant="outline" disabled={!inStock} onClick={handleAdd}>
              {!inStock ? "Notify Me" : added ? "Added ✓" : "Add"}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}