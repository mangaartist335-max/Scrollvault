import { useState } from 'react';
import { motion } from 'framer-motion';
import AppCard from './AppCard';
import Modal from './Modal';
import AnimatedSection from './AnimatedSection';
import AlternateWorldIcon from './icons/AlternateWorldIcon';
import ScrollVaultIcon from './icons/ScrollVaultIcon';
import MusicVideoIcon from './icons/MusicVideoIcon';
import DinoRunIcon from './icons/DinoRunIcon';
import GearsUnknownIcon from './icons/GearsUnknownIcon';
import TeddyLoveIcon from './icons/TeddyLoveIcon';
import { fadeUp, fadeIn, staggerContainer, withReducedMotion } from '../motion';

const apps = [
  {
    title: 'Alternate World',
    tagline: 'To remain human against the world is to remain free.',
    modal: 'To remain human against the world is to remain free.',
    Icon: AlternateWorldIcon,
    iconGlow: 'rgba(30,123,255,0.24)',
  },
  {
    title: 'ScrollVault',
    tagline: 'Earn $3 while doom scrolling — up to $20 max.',
    modal: 'Earn 3$ while doom scrolling! ($20 at max)',
    Icon: ScrollVaultIcon,
    iconGlow: 'rgba(124,58,237,0.35)',
  },
  {
    title: 'MusicMaxxer',
    tagline: 'The only limit is your imagination.',
    modal: 'The only limit is your imagination.',
    Icon: MusicVideoIcon,
    iconGlow: 'rgba(59,130,246,0.30)',
  },
  {
    title: 'Dino Run?',
    tagline: "This universe isn't what it seems...",
    modal: "This universe isn't what it seems...",
    Icon: DinoRunIcon,
    iconGlow: 'rgba(255,255,255,0.18)',
  },
  {
    title: 'Gears of the Unknown ⚙️',
    tagline: 'Find out the mystery why Shibuya is being targeted for their freedom.',
    modal: 'Find out the mystery why Shibuya is being targeted for their freedom.',
    Icon: GearsUnknownIcon,
    iconGlow: 'rgba(245, 158, 11, 0.28)',
  },
  {
    title: 'Teddy Love',
    tagline: 'Can a bear show more greater love than humans?',
    modal: 'Can a bear show more greater love than humans?',
    Icon: TeddyLoveIcon,
    iconGlow: 'rgba(251,113,133,0.25)',
  },
];

const Applications = () => {
  const [modalApp, setModalApp] = useState(null);

  const headerVariant = withReducedMotion(fadeUp);
  const gridVariant = staggerContainer;

  return (
    <section
      id="applications"
      className="applications reveal"
      data-orb-accent="rgba(59, 130, 246, 0.25)"
      data-orb-boost="1.12"
    >
      <AnimatedSection className="section-header" variant={headerVariant}>
        <motion.p 
          className="eyebrow"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={withReducedMotion(fadeIn)}
        >
          Launchpad
        </motion.p>
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={withReducedMotion(fadeUp)}
        >
          Applications:
        </motion.h2>
      </AnimatedSection>

      <motion.div 
        className="apps-grid"
        variants={gridVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {apps.map((app, index) => (
          <AppCard
            key={app.title}
            title={app.title}
            tagline={app.tagline}
            Icon={app.Icon}
            iconGlow={app.iconGlow}
            onClick={() => setModalApp(app)}
            index={index}
          />
        ))}
      </motion.div>

      {modalApp && (
        <Modal
          Icon={modalApp.Icon}
          title={modalApp.title}
          body={modalApp.modal}
          iconGlow={modalApp.iconGlow}
          onClose={() => setModalApp(null)}
        />
      )}
    </section>
  );
};

export default Applications;

