/**
 * Genesis X — Motion Design System
 * Apple-minimal + cinematic motion tokens
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EASING CURVES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const easing = {
  // Apple standard ease-out (use for most UI)
  standard: [0.25, 0.1, 0.25, 1.0],
  // Gentle entrance
  enter: [0.0, 0.0, 0.2, 1.0],
  // Quick exit
  exit: [0.4, 0.0, 1.0, 1.0],
  // Spring-like (for emphasis)
  spring: [0.34, 1.56, 0.64, 1.0],
  // Smooth and slow (for ambient)
  ambient: [0.42, 0.0, 0.58, 1.0],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DURATIONS (milliseconds)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const duration = {
  instant: 100,
  fast: 200,
  base: 400,
  slow: 600,
  slower: 900,
  ambient: 20000, // 20s for background loops
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STAGGER (delay between child animations)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const stagger = {
  tight: 0.05,
  base: 0.1,
  relaxed: 0.15,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DISTANCES (pixels for translate)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const distance = {
  micro: 4,
  small: 12,
  base: 24,
  large: 48,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ANIMATION VARIANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const fadeUp = {
  hidden: { 
    opacity: 0, 
    y: distance.base 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: duration.base / 1000,
      ease: easing.enter,
    }
  }
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: duration.fast / 1000,
      ease: easing.standard,
    }
  }
};

export const scaleIn = {
  hidden: { 
    opacity: 0, 
    scale: 0.92 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: duration.base / 1000,
      ease: easing.enter,
    }
  }
};

export const blurIn = {
  hidden: { 
    opacity: 0, 
    filter: 'blur(8px)' 
  },
  visible: { 
    opacity: 1, 
    filter: 'blur(0px)',
    transition: {
      duration: duration.slow / 1000,
      ease: easing.standard,
    }
  }
};

// For staggered children
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger.base,
      delayChildren: 0.1,
    }
  }
};

export const staggerContainerFast = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger.tight,
      delayChildren: 0,
    }
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOVER VARIANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const hoverLift = {
  rest: { y: 0 },
  hover: { 
    y: -4,
    transition: { 
      duration: duration.fast / 1000, 
      ease: easing.standard 
    }
  }
};

export const hoverScale = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: { 
      duration: duration.fast / 1000, 
      ease: easing.standard 
    }
  }
};

export const tapPress = {
  scale: 0.97,
  transition: { 
    duration: duration.instant / 1000, 
    ease: easing.exit 
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UTILITY: Check for reduced motion preference
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Variant wrapper that respects reduced motion
export const withReducedMotion = (variant) => {
  if (prefersReducedMotion()) {
    // Return instant version
    return {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { duration: 0 }
      }
    };
  }
  return variant;
};

