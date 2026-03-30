import { useRef } from 'react';
import { motion } from 'framer-motion';
import { duration, easing } from '../motion';

const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://www.instagram.com/lumine8264/' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@genesiscreationgaming' },
  { label: 'Twitter', href: 'https://x.com/X419817X' },
  { label: 'YouTube', href: 'https://www.youtube.com/@luminestar234' },
];

const Navbar = () => {
  const dropdownRef = useRef(null);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <motion.header
      className="siteNavWrap"
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.slow / 1000, ease: easing.enter }}
    >
      <motion.nav
        className="siteNav"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: duration.base / 1000, ease: easing.standard, delay: 0.08 }}
      >
        <button type="button" className="brandMark" onClick={() => scrollTo('top')}>
            <img
              className="brandLogoImage"
              src="/lumine-logo.png"
              alt="Lumine Starworks"
            />
          </button>

        <div className="siteNavLinks">
          <div className="socialMenu" ref={dropdownRef}>
            <span className="siteNavLink socialToggle">
              Social Media
            </span>

            <div className="socialDropdown" role="menu">
              {SOCIAL_LINKS.map((item) => (
                <a
                  key={item.label}
                  className="socialDropdownLink"
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  role="menuitem"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <button type="button" className="siteNavLink" onClick={() => scrollTo('top')}>
            Home
          </button>
          <button type="button" className="siteNavLink" onClick={() => scrollTo('applications')}>
            Games
          </button>
          <button type="button" className="siteNavLink" onClick={() => scrollTo('about-us')}>
            About Us
          </button>
        </div>
      </motion.nav>
    </motion.header>
  );
};

export default Navbar;

