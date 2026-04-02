import { motion, AnimatePresence } from 'framer-motion';
import { backdropVariants, modalVariants, tapScale } from '../motion/variants';

export default function ConfirmModal({ isOpen, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          variants={backdropVariants}
          initial="hidden"
          animate="show"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="relative bg-vault-card border border-vault-border-light rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          >
            <h3 className="text-xl font-bold text-vault-text mb-2">Reset Vault?</h3>
            <p className="text-vault-text-secondary text-sm mb-6">
              This will reset your balance to $0. This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <motion.button
                onClick={onCancel}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={tapScale}
                className="flex-1 py-3 rounded-xl border border-vault-border-light text-vault-text-secondary font-semibold text-sm hover:border-vault-text-dim transition-colors cursor-pointer"
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={onConfirm}
                whileHover={{
                  scale: 1.02,
                  y: -1,
                  boxShadow: '0 0 20px -4px rgba(239, 68, 68, 0.4)',
                }}
                whileTap={tapScale}
                className="flex-1 py-3 rounded-xl bg-vault-red text-white font-semibold text-sm hover:bg-red-500 transition-colors cursor-pointer"
              >
                Reset
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}