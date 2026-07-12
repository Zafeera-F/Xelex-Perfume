import { motion } from "framer-motion";
import { fadeInUp } from "../../lib/animations";

/**
 * PlaceholderPage — stopgap for routes that exist in navigation but haven't
 * been built yet. Keeps links functional instead of 404ing. Swap out for the
 * real page component when that page's phase is built.
 */
export default function PlaceholderPage({ eyebrow, title, description }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center px-6 py-24 text-center"
    >
      {eyebrow && (
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">{eyebrow}</p>
      )}
      <h1 className="font-display text-3xl text-ivory md:text-4xl">{title}</h1>
      {description && (
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">{description}</p>
      )}
    </motion.div>
  );
}
