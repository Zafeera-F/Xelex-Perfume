import { motion } from "framer-motion";
import ProductCard from "../ui/ProductCard";
import ProductCardSkeleton from "../ui/ProductCardSkeleton";
import EmptyState from "../ui/EmptyState";
import ProductListItem from "./ProductListItem";
import Button from "../ui/Button";
import { fadeInUp, staggerContainer } from "../../lib/animations";

export default function ProductGrid({ products, view, loading, hasMore, onLoadMore, onClearFilters }) {
  if (loading) {
    return (
      <div className={view === "grid" ? "grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-4"}>
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="No fragrances match your filters"
        description="Try widening your price range or clearing a filter to see more results."
        actionLabel="Clear Filters"
        onAction={onClearFilters}
      />
    );
  }

  return (
    <div>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer(0.06)}
        className={
          view === "grid"
            ? "grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3"
            : "flex flex-col gap-4"
        }
      >
        {products.map((product) =>
          view === "grid" ? (
            <motion.div key={product.id} variants={fadeInUp}>
              <ProductCard {...product} />
            </motion.div>
          ) : (
            <motion.div key={product.id} variants={fadeInUp}>
              <ProductListItem {...product} />
            </motion.div>
          )
        )}
      </motion.div>

      {hasMore && (
        <div className="mt-12 flex justify-center">
          <Button variant="outline" size="lg" onClick={onLoadMore}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
