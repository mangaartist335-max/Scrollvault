import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Animated count-up hook.
 *
 * @param {number} target - Target value to count up to.
 * @param {number} duration - Duration in ms (default 1000). Tune for feel.
 * @param {number} delay - Delay before starting (ms).
 * @returns {{ value: number, isAnimating: boolean }}
 */
export function useCountUp(target, duration = 1000, delay = 0) {
  const [value, setValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevTarget = useRef(0);
  const rafRef = useRef(null);

  const easeOutExpo = useCallback((t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)), []);

  useEffect(() => {
    const startValue = prevTarget.current;
    const diff = target - startValue;
    if (diff === 0) return;

    const timeout = setTimeout(() => {
      setIsAnimating(true);
      const startTime = performance.now();

      const animate = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutExpo(progress);

        setValue(Math.round(startValue + diff * easedProgress));

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          setValue(target);
          setIsAnimating(false);
          prevTarget.current = target;
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, delay, easeOutExpo]);

  return { value, isAnimating };
}