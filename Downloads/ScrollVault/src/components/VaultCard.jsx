import { motion, AnimatePresence } from 'framer-motion';
import { useCountUp } from '../motion/useCountUp';
import { scaleFadeIn, spring } from '../motion/variants';
import { useReducedMotion } from '../motion/useReducedMotion';
import FloatingEarning from './FloatingEarning';

export default function VaultCard({ balance, maxBalance = 20, floatingEarnings = [] }) {
  const { value: displayBalance, isAnimating } = useCountUp(balance, 900, 200);
  const isMaxed = balance >= maxBalance;
  const reduced = useReducedMotion();

  return (
    <motion.div
      variants={scaleFadeIn}
      initial="hidden"
      animate="show"
      className={`relative rounded-2xl p-8 text-center border-2 overflow-hidden ${
        isMaxed
          ? 'border-vault-gold/50 shadow-[0_0_30px_-5px_rgba(251,191,36,0.2)]'
          : 'border-vault-cyan/30 shadow-[0_0_30px_-5px_rgba(56,189,248,0.15)]'
      } ${!reduced ? 'animate-border-glow' : ''}`}
      style={{ background: 'linear-gradient(135deg, #1a2236 0%, #111827 100%)' }}
      whileHover={reduced ? {} : { y: -2, transition: { duration: 0.25 } }}
    >
      {/* Inner light sweep */}
      {!reduced && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-0 h-full w-1/3 opacity-[0.04] blur-xl"
            style={{
              background: 'linear-gradient(90deg, transparent, white, transparent)',
              animation: 'shine-sweep 6s ease-in-out infinite',
            }}
          />
        </div>
      )}

      {/* Floating earnings */}
      <AnimatePresence>
        {floatingEarnings.map((earning) => (
          <FloatingEarning key={earning.id} amount={earning.amount} />
        ))}
      </AnimatePresence>

      {/* Balance display */}
      <motion.div
        className={`text-7xl font-black tracking-tight ${
          isMaxed ? 'text-vault-gold' : 'text-vault-green'
        }`}
        animate={
          isAnimating
            ? {
                textShadow: isMaxed
                  ? '0 0 30px rgba(251,191,36,0.5)'
                  : '0 0 30px rgba(16,185,129,0.5)',
              }
            : {
                textShadow: isMaxed
                  ? '0 0 15px rgba(251,191,36,0.25)'
                  : '0 0 15px rgba(16,185,129,0.2)',
              }
        }
        transition={{ duration: 0.4 }}
      >
        ${displayBalance}
      </motion.div>

      {/* Subtitle */}
      <motion.p
        className="text-vault-text-secondary text-base mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        out of ${maxBalance} max
      </motion.p>
    </motion.div>
  );
}