import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "../ui/ProductCard";
import SectionDivider from "../ui/SectionDivider";
import { fadeInUp, staggerContainer, revealViewport } from "../../lib/animations";
import { getProducts } from "../../lib/products";

export default function FeaturedCollection() {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    getProducts({ featured: true })
      .then(setFeaturedProducts)
      .catch(() => setFeaturedProducts([]));
  }, []);

  if (featuredProducts.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 md:px-10">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        variants={fadeInUp}
        className="mb-10 text-center"
      >
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">Curated For You</p>
        <h2 className="font-display text-3xl text-ivory md:text-4xl">Featured Collection</h2>
        <SectionDivider className="mt-6" />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        variants={staggerContainer(0.1)}
        className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
      >
        {featuredProducts.map((product) => (
          <motion.div key={product.id} variants={fadeInUp}>
            <ProductCard {...product} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}