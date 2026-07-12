import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { getWishlist, addToWishlist, removeFromWishlist } from "../lib/wishlist";

// Mirrors CartContext's shape, but no localStorage — Wishlist.userId is
// non-nullable in the schema, so unlike Cart there was never a guest/local
// mode on the table. Refetches whenever auth status changes: populated on
// "authenticated", cleared on "guest". Does NOT own the guest-redirect UX
// itself — consuming components (ProductCard, etc.) check useAuth().status
// and navigate to /login themselves, same division of responsibility
// already used elsewhere (Checkout/Profile own their own guard).
//
// Stores full product objects (not just ids) so the Wishlist page can
// render them directly via the same ProductCard shape used everywhere
// else; `productIds` is just a derived Set for O(1) `isInWishlist` checks.

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { status } = useAuth();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    if (status !== "authenticated") {
      setProducts([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    getWishlist()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, [status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const productIds = useMemo(() => new Set(products.map((p) => p.id)), [products]);

  // Optimistic toggle with rollback on failure — instant heart feedback
  // rather than waiting on a round-trip for every click. Add needs the full
  // product object (to render it on the Wishlist page immediately);
  // remove only needs the id.
  async function add(product) {
    setProducts((prev) => (prev.some((p) => p.id === product.id) ? prev : [product, ...prev]));
    try {
      await addToWishlist(product.id);
    } catch (err) {
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      throw err;
    }
  }

  async function remove(productId) {
    const previous = products;
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    try {
      await removeFromWishlist(productId);
    } catch (err) {
      setProducts(previous);
      throw err;
    }
  }

  const value = {
    products,
    isLoading,
    count: products.length,
    isInWishlist: (id) => productIds.has(id),
    add,
    remove,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
