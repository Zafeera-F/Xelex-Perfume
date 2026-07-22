import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../ui/Button";
import { fadeInUp, staggerContainer } from "../../lib/animations";

const AUTOPLAY_INTERVAL_MS = 6000;

// Same fade/scale-in transition Hero.jsx's static image used, so swapping
// in a real slider doesn't change the section's premium feel.
const IMAGE_TRANSITION = { duration: 0.9, ease: [0.22, 1, 0.36, 1] };

function SlideButton({ buttonText, buttonLink }) {
  if (!buttonText || !buttonLink) return null;

  const isExternal = /^https?:\/\//.test(buttonLink);

  if (isExternal) {
    return (
      <Button as="a" href={buttonLink} target="_blank" rel="noopener noreferrer" variant="primary" size="lg">
        {buttonText}
      </Button>
    );
  }

  return (
    <Button as={Link} to={buttonLink} variant="primary" size="lg">
      {buttonText}
    </Button>
  );
}

/**
 * HeroSlider — admin-configurable replacement for Hero's old static image.
 * Auto-advances on an interval, with manual prev/next controls and
 * pagination dots; gracefully does nothing extra for a single slide (no
 * controls needed) and is driven entirely by the `slides` prop, so Hero.jsx
 * owns fetching/fallback and this component only ever renders what it's given.
 */
export default function HeroSlider({ slides }) {
  const [index, setIndex] = useState(0);

  // Reset to the first slide whenever the slide set itself changes (e.g.
  // after an admin edit), so a stale index never points past the new end.
  useEffect(() => {
    setIndex(0);
  }, [slides]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [slides]);

  if (slides.length === 0) return null;

  const slide = slides[index];

  function goTo(nextIndex) {
    setIndex((nextIndex + slides.length) % slides.length);
  }

  return (
    <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
      <AnimatePresence mode="wait">
        <motion.div
          key={`text-${slide.id}`}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={staggerContainer(0.15)}
          className="order-2 md:order-1"
        >
          <motion.p variants={fadeInUp} className="mb-4 text-xs uppercase tracking-[0.3em] text-gold">
            XeleX Perfume
          </motion.p>
          <motion.h1 variants={fadeInUp} className="font-display text-4xl leading-tight text-ivory sm:text-5xl md:text-6xl">
            {slide.heading}
          </motion.h1>
          {slide.description && (
            <motion.p variants={fadeInUp} className="mt-6 max-w-md text-base leading-relaxed text-ivory/75">
              {slide.description}
            </motion.p>
          )}
          <motion.div variants={fadeInUp} className="mt-10">
            <SlideButton buttonText={slide.buttonText} buttonLink={slide.buttonLink} />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <div className="relative order-1 md:order-2">
        <div className="absolute inset-0 -z-10 rounded-full bg-gold/10 blur-3xl" />
        <AnimatePresence mode="wait">
          <motion.img
            key={`image-${slide.id}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={IMAGE_TRANSITION}
            src={slide.imageUrl}
            alt={slide.heading}
            className="mx-auto h-[380px] w-full max-w-md rounded-[var(--radius-card)] object-cover shadow-[var(--shadow-card)] md:h-[520px]"
          />
        </AnimatePresence>

        {slides.length > 1 && (
          <>
            <button
              onClick={() => goTo(index - 1)}
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-ivory transition-colors hover:bg-gold hover:text-background"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => goTo(index + 1)}
              aria-label="Next slide"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-ivory transition-colors hover:bg-gold hover:text-background"
            >
              <ChevronRight size={18} />
            </button>

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? "w-6 bg-gold" : "w-2 bg-ivory/40 hover:bg-ivory/70"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
