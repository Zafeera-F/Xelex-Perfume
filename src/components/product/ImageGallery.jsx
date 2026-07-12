import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ImageGallery — main image + thumbnail row. Takes a plain array of image
 * URLs, so swapping placeholder images for real product photography later
 * is just passing a different `images` array — no logic changes needed.
 */
export default function ImageGallery({ images, alt }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative h-[420px] overflow-hidden bg-background-soft md:h-[520px]">
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={images[active]}
            alt={alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="h-full w-full object-cover"
          />
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={`h-20 w-20 flex-shrink-0 overflow-hidden border transition-colors ${
                active === i ? "border-gold" : "border-border hover:border-gold/50"
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
