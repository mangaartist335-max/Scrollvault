export const DEFAULT_ORB_CONTROLS = {
  scale: 1,
  glowStrength: 1,
  blurAmount: 0,
  rotationSpeed: 1,
  ambientDarkness: 0.35,
  tintHue: 0,
};

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

