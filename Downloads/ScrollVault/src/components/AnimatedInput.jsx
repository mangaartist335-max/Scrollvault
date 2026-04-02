import { useState } from 'react';
import { motion } from 'framer-motion';

export default function AnimatedInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  ...props
}) {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div
      className="mb-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <label
        className={`block text-sm font-semibold mb-1.5 ml-1 transition-colors duration-200 ${
          focused ? 'text-vault-cyan' : 'text-slate-400'
        }`}
      >
        {label}
      </label>

      <motion.input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        animate={
          error
            ? { x: [0, -6, 6, -4, 4, 0] }
            : focused
            ? { scale: 1.01, y: -1 }
            : { scale: 1, y: 0 }
        }
        transition={
          error
            ? { duration: 0.4, ease: 'easeInOut' }
            : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
        }
        className={`w-full px-4 py-3.5 rounded-xl text-base text-vault-text bg-vault-card border-2 outline-none transition-all duration-200 placeholder:text-vault-text-dim ${
          error
            ? 'border-vault-red shadow-[0_0_12px_-3px_rgba(239,68,68,0.4)]'
            : focused
            ? 'border-vault-cyan/60 shadow-[0_0_20px_-4px_rgba(56,189,248,0.2)]'
            : 'border-vault-border hover:border-vault-border-light'
        }`}
        {...props}
      />

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-vault-red text-xs mt-1.5 ml-1"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}