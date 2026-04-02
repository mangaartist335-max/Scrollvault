import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../motion/useReducedMotion';

export default function ProgressBar({ value, max = 20 }) {
  const percentage = Math.min((value / max) * 100, 100);
  const nearMax = percentage >= 80;
  const reduced = useReducedMotion();
  const motionWidth = useMotionValue(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const controls = animate(motionWidth, percentage, {
      duration: reduced ? 0.2 : 0.8,
      ease: [0.22, 1, 0.36, 1],
    });
    prevValue.current = percentage;
    return () => controls.stop();
  }, [percentage, motionWidth, reduced]);

  const width = useTransform(motionWidth, (v) => `${v}%`);

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="w-full h-4 bg-vault-surface rounded-full overflow-hidden border border-vault-border/50">
        <motion.div
          className="h-full rounded-full relative"
          style={{
            width,
            background: nearMax
              ? 'linear-gradient(90deg, #10b981, #fbbf24)'
              : 'linear-gradient(90deg, #38bdf8, #10b981)',
          }}
        >
          {/* Leading edge glow */}
          <div
            className={`absolute right-0 top-0 h-full w-6 rounded-full blur-sm ${
              nearMax ? 'bg-vault-gold/60' : 'bg-vault-cyan/50'
            }`}
          />

          {/* Shimmer overlay */}
          {!reduced && percentage > 0 && (
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div
                className="absolute top-0 h-full w-1/3 opacity-25 animate-shimmer"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                }}
              />
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}