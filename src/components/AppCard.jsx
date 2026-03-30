import { motion } from 'framer-motion';
import { fadeUp, duration, easing, prefersReducedMotion } from '../motion';

const AppCard = ({ title, Icon, tagline, onClick, iconGlow, index = 0 }) => {
  const reduced = prefersReducedMotion();

  const cardVariant = {
    hidden: { opacity: 0, y: 24 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: duration.base / 1000,
        ease: easing.enter,
      }
    }
  };

  return (
    <motion.button
      className="app-card"
      onClick={onClick}
      aria-label={`Open ${title}`}
      variants={reduced ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : cardVariant}
      whileHover={reduced ? {} : { 
        y: -6,
        rotateX: 2,
        rotateY: 1,
        transition: { 
          duration: duration.fast / 1000,
          ease: easing.standard 
        }
      }}
      whileTap={reduced ? {} : { 
        scale: 0.98,
        transition: { 
          duration: duration.instant / 1000 
        }
      }}
      onMouseEnter={() => {
        if (!iconGlow) return;
        const root = document.documentElement;
        root.style.setProperty('--orb-accent', iconGlow);
        root.style.setProperty('--orb-boost', '1.18');
      }}
      onMouseLeave={() => {
        const root = document.documentElement;
        const base = root.dataset.orbBaseAccent || 'rgba(99, 179, 255, 0.22)';
        root.style.setProperty('--orb-accent', base);
        const b = root.dataset.orbBaseBoost || '1';
        root.style.setProperty('--orb-boost', b);
      }}
    >
      <motion.div 
        className="appIconTile" 
        style={{ '--icon-glow': iconGlow }}
        whileHover={reduced ? {} : { 
          scale: 1.05,
          transition: { duration: duration.fast / 1000 }
        }}
      >
        <Icon />
      </motion.div>
      <div className="app-card__text">
        <h3>{title}</h3>
        <p className="muted">{tagline}</p>
      </div>
    </motion.button>
  );
};

export default AppCard;

