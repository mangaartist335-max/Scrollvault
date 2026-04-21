/**
 * ScrollVault Motion System
 *
 * Global animation variants for Framer Motion.
 * All durations, easings, and springs are centralized here for easy tuning.
 *
 * Tuning guide:
 *  - duration: seconds (0.45 = 450ms)
 *  - stiffness/damping: higher stiffness = snappier, higher damping = less bounce
 *  - staggerChildren: delay between each child animation
 */

// Custom easing curves
export const ease = {
  smooth: [0.22, 1, 0.36, 1],       // general entrances
  snappy: [0.16, 1, 0.3, 1],        // quick interactions
  out: [0, 0, 0.2, 1],              // exits
  inOut: [0.4, 0, 0.2, 1],          // symmetric
};

// Spring presets
export const spring = {
  gentle: { type: 'spring', stiffness: 200, damping: 26 },
  snappy: { type: 'spring', stiffness: 400, damping: 30 },
  bouncy: { type: 'spring', stiffness: 300, damping: 20 },
};

// ─── Stagger containers ────────────────────────────────────────
export const staggerContainer = (stagger = 0.07, delay = 0.1) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    },
  },
});

// ─── Entrance variants ─────────────────────────────────────────
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: ease.smooth },
  },
  exit: { opacity: 0, y: -12, transition: { duration: 0.3, ease: ease.out } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.45, ease: ease.smooth },
  },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

export const scaleFadeIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: spring.gentle,
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.25, ease: ease.out } },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 30 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: ease.smooth },
  },
  exit: { opacity: 0, x: -20, transition: { duration: 0.3, ease: ease.out } },
};

// ─── Page transitions ───────────────────────────────────────────
export const pageVariants = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: ease.smooth },
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.98,
    transition: { duration: 0.35, ease: ease.out },
  },
};

// ─── Interactive states ─────────────────────────────────────────
export const tapScale = { scale: 0.97 };
export const hoverLift = { y: -2, transition: { duration: 0.2, ease: ease.snappy } };
export const hoverGlow = {
  boxShadow: '0 0 20px -4px rgba(56, 189, 248, 0.3)',
  transition: { duration: 0.25 },
};

// ─── Special ────────────────────────────────────────────────────
export const lockRotate = {
  hidden: { rotate: -15, scale: 0.8, opacity: 0 },
  show: {
    rotate: 0,
    scale: 1,
    opacity: 1,
    transition: { ...spring.bouncy, delay: 0.3 },
  },
};

export const expandFromCenter = {
  hidden: { scaleX: 0, opacity: 0 },
  show: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: ease.smooth, delay: 0.2 },
  },
};

export const badgePop = {
  hidden: { scale: 0, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: { ...spring.bouncy, delay: 0.1 },
  },
};

// ─── Modal ──────────────────────────────────────────────────────
export const backdropVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: spring.gentle,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2, ease: ease.out },
  },
};