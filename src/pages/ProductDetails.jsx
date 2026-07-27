import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Heart } from "lucide-react";
import Breadcrumb from "../components/ui/Breadcrumb";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import QuantitySelector from "../components/ui/QuantitySelector";
import ProductCard from "../components/ui/ProductCard";
import ImageGallery from "../components/product/ImageGallery";
import ProductTabs from "../components/product/ProductTabs";
import ReviewsSection from "../components/product/ReviewsSection";
import { fadeInUp, staggerContainer } from "../lib/animations";
import { getProductBySlug, getProducts } from "../lib/products";
import { getFragranceNotes } from "../data/productDetails";
import { PATHS } from "../routes/paths";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";

export default function ProductDetails() {
  const { productId: slug } = useParams();
  const { addToCart } = useCart();
  const { status: authStatus } = useAuth();
  const wishlist = useWishlist();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "not-found" | "error"
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setQuantity(1);

    getProductBySlug(slug)
      .then((data) => {
        if (cancelled) return;
        setProduct(data);
        setStatus("ready");
        return getProducts().then((all) => {
          if (cancelled) return;
          setRelatedProducts(
            all.filter((p) => p.id !== data.id && p.category === data.category).slice(0, 4)
          );
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus(err.status === 404 ? "not-found" : "error");
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (status === "loading") {
    return <div className="min-h-[50vh]" />;
  }

  if (status !== "ready") {
    return (
      <EmptyState
        title={status === "not-found" ? "We couldn't find that fragrance" : "Something went wrong"}
        description={
          status === "not-found"
            ? "It may have been moved or is no longer available."
            : "Please refresh to try again."
        }
        actionLabel="Back to Shop"
        onAction={() => window.history.back()}
      />
    );
  }

  const fragranceNotes = getFragranceNotes(product.collection);
  const wishlisted = wishlist.isInWishlist(product.id);

  function handleWishlistToggle() {
    if (authStatus === "guest") {
      navigate(PATHS.login, { state: { from: PATHS.productLink(product.id) } });
      return;
    }
    // WishlistContext already rolls the optimistic update back on failure
    // (the heart un-fills) — that's the user-visible feedback, so a failed
    // toggle here is a silent no-op rather than an uncaught rejection.
    if (wishlisted) {
      wishlist.remove(product.id).catch(() => {});
    } else {
      wishlist.add(product).catch(() => {});
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:px-10">
      <Breadcrumb
        items={[
          { label: "Home", to: PATHS.home },
          { label: "Shop", to: PATHS.shop },
          { label: product.name },
        ]}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer(0.1)}
        className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-2"
      >
        <motion.div variants={fadeInUp}>
          <ImageGallery images={product.images} alt={product.name} />
        </motion.div>

        <motion.div variants={fadeInUp}>
          {product.badge && (
            <Badge tone="gold" className="mb-4">{product.badge}</Badge>
          )}
          <h1 className="font-display text-3xl text-ivory md:text-4xl">
            {product.name}
            {product.inspiredBy && (
              <span className="ml-2 font-body text-base font-normal text-muted">(Inspired by {product.inspiredBy})</span>
            )}
          </h1>
          <p className="mt-2 text-xs uppercase tracking-[0.15em] text-muted">{product.line}</p>

          <div className="mt-4 flex items-center gap-2 text-sm">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.round(product.rating) ? "fill-gold text-gold" : "text-border"}
                />
              ))}
            </div>
            <span className="text-muted">{product.rating} ({product.reviews} reviews)</span>
          </div>

          <p className="mt-6 font-body text-2xl text-gold">
            ₹{product.price.toLocaleString("en-IN")}
          </p>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-ivory/75">{product.description}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <QuantitySelector value={quantity} onChange={setQuantity} />
            <Button
              variant="primary"
              size="lg"
              disabled={!product.inStock}
              className="flex-1 sm:flex-none"
              onClick={() => {
                addToCart(product.id, quantity);
                setAdded(true);
                setTimeout(() => setAdded(false), 1500);
              }}
            >
              {!product.inStock ? "Notify Me" : added ? "Added to Cart ✓" : "Add to Cart"}
            </Button>
            <button
              onClick={handleWishlistToggle}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className={`flex h-12 w-12 items-center justify-center border transition-colors hover:border-gold hover:text-gold ${
                wishlisted ? "border-gold text-gold" : "border-border text-ivory/70"
              }`}
            >
              <Heart size={18} strokeWidth={1.5} fill={wishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          {!product.inStock && (
            <p className="mt-3 text-xs text-error">Currently out of stock — we'll notify you when it's back.</p>
          )}
        </motion.div>
      </motion.div>

      <ProductTabs description={product.description} notes={fragranceNotes} />
      <ReviewsSection productSlug={product.id} rating={product.rating} reviews={product.reviews} />

      {relatedProducts.length > 0 && (
        <div className="mt-20 border-t border-border pt-16">
          <h2 className="mb-8 font-display text-2xl text-ivory">You May Also Like</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
