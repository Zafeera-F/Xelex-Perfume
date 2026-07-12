import { createContext, useContext, useReducer, useEffect, useMemo, useState } from "react";
import { getProducts } from "../lib/products";

// The cart stores only { productId, quantity } — never a copy of product
// name/price/image. That way price changes, stock updates, or catalog edits
// are always reflected live instead of showing a stale snapshot from whenever
// the item was added.

const CartContext = createContext(null);
const STORAGE_KEY = "xelex_cart_v1";

function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const existing = state.find((i) => i.productId === action.productId);
      if (existing) {
        return state.map((i) =>
          i.productId === action.productId
            ? { ...i, quantity: Math.min(10, i.quantity + action.quantity) }
            : i
        );
      }
      return [...state, { productId: action.productId, quantity: action.quantity }];
    }
    case "UPDATE_QUANTITY":
      return state
        .map((i) => (i.productId === action.productId ? { ...i, quantity: action.quantity } : i))
        .filter((i) => i.quantity > 0);
    case "REMOVE":
      return state.filter((i) => i.productId !== action.productId);
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, loadInitialState);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage may be unavailable (private browsing, quota) — cart still
      // works for the session, it just won't persist across a reload.
    }
  }, [items]);

  // Fetched once on mount so `lines` below can hydrate against live product
  // data instead of a stale cart-time snapshot. `isLoading` lets consumers
  // (Cart, Checkout) tell "cart is genuinely empty" apart from "still
  // hydrating" — without it, a fresh page load would briefly compute 0
  // lines from a non-empty cart and could redirect away as if it were empty.
  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, []);

  // Hydrate cart entries against live product data. Entries referencing a
  // product that no longer exists in the catalog are silently dropped
  // rather than shown as broken rows.
  const lines = useMemo(() => {
    return items
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;
        return { ...product, quantity: item.quantity };
      })
      .filter(Boolean);
  }, [items, products]);

  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + l.price * l.quantity, 0), [lines]);

  const value = {
    lines,
    itemCount,
    subtotal,
    isLoading,
    addToCart: (productId, quantity = 1) => dispatch({ type: "ADD", productId, quantity }),
    updateQuantity: (productId, quantity) => dispatch({ type: "UPDATE_QUANTITY", productId, quantity }),
    removeFromCart: (productId) => dispatch({ type: "REMOVE", productId }),
    clearCart: () => dispatch({ type: "CLEAR" }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
