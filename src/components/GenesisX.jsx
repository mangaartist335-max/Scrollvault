import { motion } from 'framer-motion';
import AnimatedSection from './AnimatedSection';
import { fadeUp, staggerContainerFast, fadeIn, withReducedMotion } from '../motion';

const GenesisX = () => {
  const pillVariant = withReducedMotion(fadeIn);

  return (
    <section
      id="genesis"
      className="genesis reveal"
      data-orb-accent="rgba(0, 102, 204, 0.28)"
      data-orb-boost="1.08"
    >
      <AnimatedSection variant={fadeUp}>
        <div className="genesis-card">
          <div className="genesis-top">
            <motion.p 
              className="eyebrow"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={withReducedMotion(fadeIn)}
            >
              LUMINE STARWORKS
            </motion.p>
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={withReducedMotion(fadeUp)}
            >
              Build once. Deploy everywhere.
            </motion.h2>
            <motion.p 
              className="muted"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={withReducedMotion(fadeUp)}
            >
              A living platform for expressive experiences, blending spatial web energy with sharp
              execution. Apps and games that wish to change the world.
            </motion.p>
          </div>
          <motion.div 
            className="pill-row" 
            aria-label="Highlights"
            variants={staggerContainerFast}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.span className="pill" variants={pillVariant}>Realtime visuals</motion.span>
            <motion.span className="pill" variants={pillVariant}>Composable apps</motion.span>
            <motion.span className="pill" variants={pillVariant}>Secure by design</motion.span>
          </motion.div>
        </div>
      </AnimatedSection>
    </section>
  );
};

export default GenesisX;

