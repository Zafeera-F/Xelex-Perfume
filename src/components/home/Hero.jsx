import { motion } from "framer-motion";
import Button from "../ui/Button";
import { fadeInUp, staggerContainer } from "../../lib/animations";
import { SECTION_IMAGES } from "../../data/placeholderData";

// Fixed positions/delays for floating particles so they don't reshuffle
// on every re-render (would look jittery rather than ambient).
const PARTICLES = [
  { top: "12%", left: "18%", size: 5, delay: 0 },
  { top: "28%", left: "72%", size: 3, delay: 1.2 },
  { top: "55%", left: "10%", size: 4, delay: 0.6 },
  { top: "68%", left: "85%", size: 6, delay: 1.8 },
  { top: "40%", left: "45%", size: 3, delay: 0.3 },
  { top: "80%", left: "55%", size: 4, delay: 2.1 },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Ambient gradient wash */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(212,175,55,0.12),_transparent_55%)]" />

      {/* Floating gold particles */}
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute rounded-full bg-gold/60"
          style={{ top: p.top, left: p.left, width: p.size, height: p.size }}
          animate={{ y: [0, -18, 0], opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 5 + i, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2 md:px-10 md:py-28">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer(0.15)}
          className="order-2 md:order-1"
        >
          <motion.p variants={fadeInUp} className="mb-4 text-xs uppercase tracking-[0.3em] text-gold">
            XeleX Perfumes
          </motion.p>
          <motion.h1 variants={fadeInUp} className="font-display text-4xl leading-tight text-ivory sm:text-5xl md:text-6xl">
            Luxury Within Reach
          </motion.h1>
          <motion.p variants={fadeInUp} className="mt-6 max-w-md text-base leading-relaxed text-ivory/75">
            Inspired by the world's finest fragrances. Crafted for those who
            appreciate elegance.
          </motion.p>
          <motion.div variants={fadeInUp} className="mt-10">
            <Button variant="primary" size="lg">Shop Now</Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative order-1 md:order-2"
        >
          <div className="absolute inset-0 -z-10 rounded-full bg-gold/10 blur-3xl" />
          <img
            src={SECTION_IMAGES.hero}
            alt="Featured XeleX fragrance"
            className="mx-auto h-[380px] w-full max-w-md rounded-[var(--radius-card)] object-cover shadow-[var(--shadow-card)] md:h-[520px]"
          />
        </motion.div>
      </div>
    </section>
  );
}