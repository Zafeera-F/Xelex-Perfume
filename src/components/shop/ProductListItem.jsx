import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { PATHS } from "../../routes/paths";
import { useCart } from "../../context/CartContext";

/**
 * ProductListItem — horizontal row layout for Shop's list view.
 * Kept separate from ProductCard (grid view) rather than jamming a
 * "layout" prop into ProductCard, since the row needs different content
 * density (rating, stock status visible inline) than the compact grid tile.
 */
export default function ProductListItem({ id, name, notes, price, image, badge, rating, reviews, inStock }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart(id, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Card className="flex flex-col gap-5 p-4 sm:flex-row sm:items-center">
      <Link to={PATHS.productLink(id)} className="relative h-40 w-full flex-shrink-0 overflow-hidden bg-background-soft sm:h-28 sm:w-28">
        <img src={image} alt={name} loading="lazy" className="h-full w-full object-cover" />
        {badge && <Badge tone="gold" className="absolute left-2 top-2">{badge}</Badge>}
      </Link>

      <div className="flex flex-1 flex-col gap-1">
        <Link to={PATHS.productLink(id)}>
          <h3 className="font-display text-lg text-ivory transition-colors hover:text-gold">{name}</h3>
        </Link>
        {notes && <p className="text-xs uppercase tracking-[0.15em] text-muted">{notes}</p>}
        <div className="mt-1 flex items-center gap-2 text-xs text-muted">
          <span className="flex items-center gap-1 text-gold">
            <Star size={13} className="fill-gold" /> {rating}
          </span>
          <span>({reviews} reviews)</span>
          <span className={inStock ? "text-success" : "text-error"}>
            {inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-3">
        <span className="font-body text-lg text-gold">₹{price.toLocaleString("en-IN")}</span>
        <div className="flex items-center gap-2">
          <button aria-label={`Add ${name} to wishlist`} className="text-ivory/60 transition-colors hover:text-gold">
            <Heart size={17} strokeWidth={1.5} />
          </button>
          <Button size="sm" variant="outline" disabled={!inStock} onClick={handleAdd}>
            {!inStock ? "Notify Me" : added ? "Added ✓" : "Add"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
