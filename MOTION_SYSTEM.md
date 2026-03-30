# Genesis X — Motion Design System

## Overview
A comprehensive, Apple-clean + cinematic motion system implemented across the entire Genesis X landing page. The system prioritizes smooth, intentional animations that feel premium while respecting user preferences and performance.

## Architecture

### Core Files
- **`src/motion.js`** — Motion tokens, easing curves, durations, variants, and utilities
- **`src/components/AnimatedSection.jsx`** — Reusable scroll-reveal wrapper component
- **`src/index.css`** — Enhanced CSS with ambient background animation, transitions, and reduced-motion handling

### Motion Tokens

#### Easing Curves
```javascript
standard: [0.25, 0.1, 0.25, 1.0]  // Apple standard ease-out
enter: [0.0, 0.0, 0.2, 1.0]        // Gentle entrance
exit: [0.4, 0.0, 1.0, 1.0]         // Quick exit
spring: [0.34, 1.56, 0.64, 1.0]    // Spring-like emphasis
ambient: [0.42, 0.0, 0.58, 1.0]    // Smooth and slow
```

#### Durations (milliseconds)
- **instant**: 100ms — For tap feedback
- **fast**: 200ms — For hover states
- **base**: 400ms — Default animation
- **slow**: 600ms — For emphasis
- **slower**: 900ms — For major transitions
- **ambient**: 20000ms — For background loops

#### Stagger Delays
- **tight**: 0.05s — Fast succession
- **base**: 0.1s — Standard stagger
- **relaxed**: 0.15s — Leisurely pace

#### Movement Distances
- **micro**: 4px
- **small**: 12px
- **base**: 24px
- **large**: 48px

## Implemented Animations

### 1. Page Load Sequence (Hero)
**Location**: `src/components/Hero.jsx`

Staged entrance animation:
1. Background fade-in (900ms)
2. Orb scale-in from 90% (600ms)
3. Top eyebrow band fade-in
4. Headline fade-up (24px translate)
5. Description fade-up (12px translate)
6. CTA buttons fade-up (8px translate)
7. Hint text fade-in

All elements use staggered timing (100ms between children) for a cinematic reveal.

### 2. Scroll-Based Section Reveals
**Components**: `GenesisX.jsx`, `Applications.jsx`

Each major section uses `whileInView` to trigger animations when scrolled into viewport:
- **Viewport trigger**: -100px margin (animates just before entering view)
- **Once only**: Animations don't repeat on scroll
- **Variants**: fadeUp (default), fadeIn, scaleIn, blurIn

Example:
```jsx
<AnimatedSection variant={fadeUp}>
  <div className="genesis-card">...</div>
</AnimatedSection>
```

### 3. Application Cards
**Component**: `src/components/AppCard.jsx`

**Hover state**:
- Lift: -6px translateY
- Tilt: subtle 3D rotation (2deg X, 1deg Y)
- Shadow: Enhanced + color-specific glow
- Border: Brightens to rgba(255,255,255,0.22)
- Inner highlight: Intensifies
- Icon: Scales to 105%
- Duration: 200ms

**Tap state**:
- Scale: 0.98
- Duration: 100ms

**Orb interaction**:
- Each card hover sets `--orb-accent` and `--orb-boost` CSS variables
- Orb adapts its glow color to match the hovered card

### 4. Buttons
**Location**: Primary and Ghost buttons in Hero

**Hover states**:
- **Primary (white bg)**: Lift -1px, subtle shadow + inner border
- **Ghost (black bg)**: Lift -1px, stronger shadow glow
- Duration: 200ms

**Tap states**:
- Scale: 0.98 (via Framer Motion `whileTap`)

**Focus-visible**:
- 2px accent-colored outline, 3px offset

### 5. Theme Toggle Animation
**Component**: `src/components/ThemeToggle.jsx`

**Animated indicator pill**:
- Slides between "Studio" and "Playground" buttons
- Uses Framer Motion `animate` with `x: 0%` or `x: 100%`
- Duration: 200ms, standard easing
- Smooth color crossfade for button text

**Button tap**:
- Scale: 0.95 (subtle press feedback)

### 6. Ambient Background Animation
**Location**: `src/index.css` — `body::before`

**Features**:
- 25s infinite loop with `ambientDrift` keyframes
- Subtle translate (±2%) and scale (1.00 → 1.01)
- Fixed position, covers entire viewport
- Radial gradients with theme-aware accent colors
- z-index: -1 (behind all content)

**Noise texture overlay**:
- `body::after` with SVG fractal noise
- opacity: 0.015 (extremely subtle)
- Adds premium texture to prevent flat look

### 7. CSS Transitions
All interactive elements have explicit transitions:
- Buttons: `transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)`
- App cards: Same timing for transform, box-shadow, border-color
- Theme toggle buttons: Color transitions

## Accessibility & Performance

### Reduced Motion Support
**Global CSS rule** (`src/index.css`):
```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**JavaScript utility** (`src/motion.js`):
```javascript
export const withReducedMotion = (variant) => {
  if (prefersReducedMotion()) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0 } }
    };
  }
  return variant;
};
```

Applied to all major animation variants in Hero, GenesisX, Applications, and AppCard components.

### Performance Optimizations
1. **IntersectionObserver**: Used for scroll-based reveals (Framer Motion `whileInView`)
2. **once: true**: Animations only trigger once, preventing repeated calculations
3. **will-change**: Applied to reveal elements (controlled)
4. **GPU acceleration**: Transform-based animations (translate, scale, rotate)
5. **No layout thrashing**: All animations use transforms, not top/left/width/height
6. **Ambient animation**: Runs on pseudo-element with minimal repaints

## Theme System Integration

The motion system respects the Studio/Playground theme toggle:
- **Ambient background**: Uses `var(--accent)` and `var(--accent2)` for gradient colors
- **Smooth transitions**: Theme changes animate via CSS transitions (600ms)
- **Orb colors**: Read from CSS tokens (`--orb-a`, `--orb-b`, `--orb-c`)
- **Focus rings**: Use `var(--accent)` color

## Animation Variants Library

### fadeUp
```javascript
{
  hidden: { opacity: 0, y: 24 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4s, ease: enter }
  }
}
```

### fadeIn
```javascript
{
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2s, ease: standard }
  }
}
```

### scaleIn
```javascript
{
  hidden: { opacity: 0, scale: 0.92 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4s, ease: enter }
  }
}
```

### blurIn
```javascript
{
  hidden: { opacity: 0, filter: 'blur(8px)' },
  visible: { 
    opacity: 1, 
    filter: 'blur(0px)',
    transition: { duration: 0.6s, ease: standard }
  }
}
```

### staggerContainer
Parent variant for staggered children:
```javascript
{
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}
```

## Testing Checklist

### Visual Tests
- [ ] Hero loads with smooth staged entrance
- [ ] Scrolling reveals sections with fade-up
- [ ] App cards lift and glow on hover
- [ ] Card hover changes orb glow color
- [ ] Buttons have subtle lift + shadow on hover
- [ ] Theme toggle pill slides smoothly
- [ ] Background has subtle drift animation

### Interaction Tests
- [ ] All buttons respond to tap with scale-down
- [ ] Focus-visible states show accent outline
- [ ] Cards on mobile: tap shows pressed state (no hover stuck)
- [ ] Theme changes smoothly animate background

### Accessibility Tests
- [ ] With reduced-motion enabled: all animations instant/disabled
- [ ] Keyboard navigation: focus states visible
- [ ] Screen reader: animations don't disrupt content flow

### Performance Tests
- [ ] Page loads without jank
- [ ] Scroll performance: 60fps on modern devices
- [ ] Mobile: animations feel smooth, not laggy
- [ ] No layout shift during animations

## Files Modified

### Created
- `src/motion.js`
- `src/components/AnimatedSection.jsx`
- `MOTION_SYSTEM.md` (this file)

### Updated
- `src/index.css` — Added ambient animation, enhanced transitions, reduced-motion rules
- `src/components/Hero.jsx` — Page load sequence with Framer Motion
- `src/components/GenesisX.jsx` — Scroll reveal animations
- `src/components/Applications.jsx` — Grid stagger and header reveals
- `src/components/AppCard.jsx` — Hover/tap micro-interactions
- `src/components/ThemeToggle.jsx` — Animated indicator pill
- `package.json` — Added `framer-motion` dependency

## Dependencies Added
- **framer-motion** v12.10.2 — Production-ready React animation library

## Future Enhancements (Optional)

1. **Parallax scrolling**: Hero orb moves slightly on scroll
2. **Cursor tracking**: Orb highlight follows cursor more dynamically
3. **Micro-interactions**: Pills in Genesis section scale on hover
4. **Exit animations**: Modal fade-out with scale
5. **Loading skeleton**: Animated placeholders before content loads
6. **Haptic feedback**: Vibration on mobile taps (experimental)

## Maintenance Notes

- All motion tokens are centralized in `src/motion.js` — edit there to change global timing
- To disable a specific animation: wrap in `if (!prefersReducedMotion()) { ... }`
- To add new variants: follow existing pattern and export from `motion.js`
- CSS animations use `var(--ease)` token for consistency

---

**Status**: ✅ All TODOs completed, build passing, animations live.

