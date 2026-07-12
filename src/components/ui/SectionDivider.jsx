import { motion } from "framer-motion";
import { drawLine, revealViewport } from "../../lib/animations";

/**
 * SectionDivider — the brand's signature motif.
 * A thin gold hairline with a single rotated facet at its center,
 * referencing the cut facet of a perfume bottle stopper. Used to
 * separate major sections instead of generic spacing alone.
 */
export default function SectionDivider({ className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <motion.span
        variants={drawLine}
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        style={{ transformOrigin: "right" }}
        className="h-px w-24 bg-gradient-to-l from-gold/70 to-transparent md:w-32"
      />
      <span className="h-2 w-2 rotate-45 border border-gold/80" />
      <motion.span
        variants={drawLine}
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        style={{ transformOrigin: "left" }}
        className="h-px w-24 bg-gradient-to-r from-gold/70 to-transparent md:w-32"
      />
    </div>
  );
}
