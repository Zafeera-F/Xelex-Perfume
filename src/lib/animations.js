// Centralized motion variants.
// Import these instead of writing one-off animation objects per component,
// so every fade/hover/stagger in the app feels like it belongs to the same brand.

export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

export const staggerContainer = (staggerAmount = 0.12, delayChildren = 0) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerAmount,
      delayChildren,
    },
  },
});

// Subtle scale used on product cards / images on hover.
export const hoverLift = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -6,
    scale: 1.015,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

// For the gold hairline signature divider "drawing" itself in on scroll.
export const drawLine = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

// Standard viewport settings for scroll-triggered reveals.
export const revealViewport = { once: true, margin: "-80px" };
