import AnimatedSection from './AnimatedSection';
import { fadeUp } from '../motion';

const AboutSection = () => {
  return (
    <section
      id="about-us"
      className="aboutSection reveal"
      data-orb-accent="rgba(124, 58, 237, 0.26)"
      data-orb-boost="1.1"
    >
      <AnimatedSection className="aboutCard" variant={fadeUp}>
        <p className="eyebrow">About Us</p>
        <h2>Who We Are</h2>
        <p className="muted">
          Hey there! If you don't know us, we're basically a company, to put it simply, that sells
          video games like Alternate World, Gears of the Unknown, Teddy Love and Dino Run?. As for
          the apps we make, ScrollVault, MusicMaxxer and Infinity AI, our soon to be latest AI
          assistant in the market.
        </p>
        <p className="muted">
          Our company is built on heart. The kind of heart that puts so much love and creativity
          into our projects. As always, wish us luck. And God loves you!
        </p>
      </AnimatedSection>
    </section>
  );
};

export default AboutSection;

