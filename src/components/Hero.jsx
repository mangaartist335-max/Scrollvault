import { motion } from 'framer-motion';
import OrbScene from './OrbScene';
import ThemeToggle from './ThemeToggle';
import PlaygroundPanel from './PlaygroundPanel';
import { easing, duration, stagger, withReducedMotion, fadeIn, fadeUp } from '../motion';

const Hero = ({ mode, onModeChange, controls, onControlChange, onResetControls }) => {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Page load sequence variants
  const containerVariant = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger.base,
        delayChildren: 0.2,
      }
    }
  };

  const orbVariant = withReducedMotion({
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: duration.slow / 1000,
        ease: easing.enter,
      }
    }
  });

  const topBandVariant = withReducedMotion(fadeIn);
  const headlineVariant = withReducedMotion(fadeUp);
  const descVariant = withReducedMotion({
    hidden: { opacity: 0, y: 12 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: duration.base / 1000,
        ease: easing.enter,
      }
    }
  });

  const ctaVariant = withReducedMotion({
    hidden: { opacity: 0, y: 8 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: duration.base / 1000,
        ease: easing.enter,
      }
    }
  });

  const hintVariant = withReducedMotion(fadeIn);

  return (
    <section className="hero">
      <motion.div 
        className="heroBg" 
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: duration.slower / 1000, ease: easing.ambient }}
      />

      <motion.div 
        className="heroContainer"
        variants={containerVariant}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="heroOrbLane" 
          aria-label="Interactive orb"
          variants={orbVariant}
        >
          <OrbScene variant="lane" controls={controls} />
        </motion.div>

        <div className="heroCopyLane">
          <div className="heroPanel">
            <motion.div className="heroHeaderRow" variants={topBandVariant}>
              <div className="heroPill">
                IMMERSIVE STUDIO · REALTIME READY
              </div>
              <ThemeToggle mode={mode} onChange={onModeChange} />
            </motion.div>

            {mode === 'studio' ? (
              <>
                <motion.h1 variants={headlineVariant}>
                  Build Worlds. Ship Fast.
                </motion.h1>

                <motion.p className="muted" variants={descVariant}>
                  A responsive orb engine powering the next wave of applications. Design
                  boldly, deploy instantly, and keep the glow alive across every device.
                </motion.p>

                <motion.div className="cta-row" variants={ctaVariant}>
                  <motion.button
                    className="btn primary"
                    onClick={() => scrollTo('applications')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: duration.fast / 1000 }}
                  >
                    Open Applications
                  </motion.button>
                  <motion.button
                    className="btn ghost"
                    onClick={() => scrollTo('genesis')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: duration.fast / 1000 }}
                  >
                    Learn More
                  </motion.button>
                </motion.div>

                <motion.p className="hint" variants={hintVariant}>
                  Tip: Move your cursor to bend the glow · Drag to rotate.
                </motion.p>
              </>
            ) : (
              <PlaygroundPanel
                controls={controls}
                onChange={onControlChange}
                onReset={onResetControls}
              />
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;

