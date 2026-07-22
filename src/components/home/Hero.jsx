import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import HeroSlider from "./HeroSlider";
import { getHeroSlides } from "../../lib/heroSlides";
import { SECTION_IMAGES } from "../../data/placeholderData";
import { PATHS } from "../../routes/paths";

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

// Used whenever there are no admin-configured slides yet, or the slides
// fetch fails — the homepage must never show a blank hero section.
const DEFAULT_SLIDE = {
  id: "default",
  imageUrl: SECTION_IMAGES.hero,
  heading: "Luxury Within Reach",
  description: "Inspired by the world's finest fragrances. Crafted for those who appreciate elegance.",
  buttonText: "Shop Now",
  buttonLink: PATHS.shop,
};

export default function Hero() {
  const [slides, setSlides] = useState([DEFAULT_SLIDE]);

  useEffect(() => {
    let cancelled = false;

    getHeroSlides()
      .then((fetched) => {
        if (cancelled) return;
        if (fetched.length > 0) setSlides(fetched);
      })
      .catch(() => {
        // Already showing DEFAULT_SLIDE — nothing more to do.
      });

    return () => {
      cancelled = true;
    };
  }, []);

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

      <div className="relative mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
        <HeroSlider slides={slides} />
      </div>
    </section>
  );
}
