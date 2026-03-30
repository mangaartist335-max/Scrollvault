import { motion } from 'framer-motion';
import { fadeUp, withReducedMotion } from '../motion';

/**
 * AnimatedSection — Reveals section content when scrolled into view
 * Handles reduced motion preference automatically
 */
export default function AnimatedSection({ 
  children, 
  variant = fadeUp,
  className = '',
  delay = 0,
  ...props 
}) {
  const effectiveVariant = withReducedMotion(variant);
  
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={{
        hidden: effectiveVariant.hidden,
        visible: {
          ...effectiveVariant.visible,
          transition: {
            ...effectiveVariant.visible.transition,
            delay,
          }
        }
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

