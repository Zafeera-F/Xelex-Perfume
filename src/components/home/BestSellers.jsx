import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "../ui/ProductCard";
import { fadeInUp, revealViewport } from "../../lib/animations";
import { getProducts } from "../../lib/products";

export default function BestSellers() {
  const [bestSellers, setBestSellers] = useState([]);

  useEffect(() => {
    getProducts({ bestSeller: true })
      .then(setBestSellers)
      .catch(() => setBestSellers([]));
  }, []);

  if (bestSellers.length === 0) return null;

  return (
    <section className="border-y border-border bg-background-soft py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          variants={fadeInUp}
          className="mb-12 flex items-end justify-between"
        >
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">Most Loved</p>
            <h2 className="font-display text-3xl text-ivory md:text-4xl">Best Sellers</h2>
          </div>
          <p className="hidden text-xs uppercase tracking-[0.2em] text-muted md:block">
            Scroll to explore →
          </p>
        </motion.div>
      </div>

      {/* Horizontal scroll track — deliberately breaks out of max-w container
          so cards can bleed toward the viewport edge, like a showcase rail. */}
      <div className="scrollbar-none flex gap-6 overflow-x-auto px-6 pb-4 md:px-10">
        {bestSellers.map((product) => (
          <ProductCard key={product.id} {...product} className="w-64 flex-shrink-0 md:w-72" />
        ))}
      </div>
    </section>
  );
}