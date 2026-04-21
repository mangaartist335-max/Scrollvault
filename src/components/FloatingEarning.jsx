import { motion } from 'framer-motion';

export default function FloatingEarning({ amount }) {
  return (
    <motion.div
      className="absolute top-4 right-6 text-vault-green font-extrabold text-xl pointer-events-none"
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -50, scale: 0.85 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
    >
      +${amount.toFixed(2)}
    </motion.div>
  );
}