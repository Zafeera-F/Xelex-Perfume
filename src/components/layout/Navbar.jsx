import { NavLink } from "react-router-dom";
import { Heart, ShoppingBag, User } from "lucide-react";
import Logo from "../ui/Logo";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { PATHS } from "../../routes/paths";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  // No dedicated Collections route exists yet — routed to Shop for now.
  // Revisit once we decide if Collections is a filtered Shop view or its own page.
  { label: "Collections", to: "/shop" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

/**
 * Navbar — Cart count is live via CartContext, account icon is live via
 * AuthContext, wishlist count is live via WishlistContext.
 */
export default function Navbar() {
  const { itemCount } = useCart();
  const { status } = useAuth();
  const { count: wishlistCount } = useWishlist();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        <NavLink to="/">
          <Logo />
        </NavLink>

        <nav className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                `font-body text-xs uppercase tracking-[0.2em] transition-colors duration-200
                ${isActive ? "text-gold" : "text-ivory/80 hover:text-gold"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-5 text-ivory/80">
          <NavLink to={PATHS.wishlist} aria-label="Wishlist" className="relative transition-colors hover:text-gold">
            <Heart size={18} strokeWidth={1.5} />
            {wishlistCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-medium text-background">
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/cart" aria-label="Cart" className="relative transition-colors hover:text-gold">
            <ShoppingBag size={18} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-medium text-background">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </NavLink>
          <NavLink
            to={status === "authenticated" ? PATHS.profile : PATHS.login}
            aria-label="Account"
            className="transition-colors hover:text-gold"
          >
            <User size={18} strokeWidth={1.5} />
          </NavLink>
        </div>
      </div>
    </header>
  );
}
