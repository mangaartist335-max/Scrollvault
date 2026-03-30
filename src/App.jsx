import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import GenesisX from './components/GenesisX';
import Applications from './components/Applications';
import AboutSection from './components/AboutSection';
import { DEFAULT_ORB_CONTROLS } from './orbControls';

const MODE_STORAGE_KEY = 'genesisx:view-mode';

function App() {
  const [mode, setMode] = useState(() => {
    try {
      const saved = localStorage.getItem(MODE_STORAGE_KEY);
      return saved === 'playground' ? 'playground' : 'studio';
    } catch {
      return 'studio';
    }
  });
  const [orbControls, setOrbControls] = useState(DEFAULT_ORB_CONTROLS);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    try {
      localStorage.setItem(MODE_STORAGE_KEY, mode);
    } catch {
      // ignore storage failures
    }
  }, [mode]);

  // Lightweight scroll reveal (no layout changes)
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal'));
    if (els.length === 0) return;
    const root = document.documentElement;
    if (!root.dataset.orbBaseAccent) root.dataset.orbBaseAccent = 'rgba(99, 179, 255, 0.22)';
    if (!root.dataset.orbBaseBoost) root.dataset.orbBaseBoost = '1';
    root.style.setProperty('--orb-accent', root.dataset.orbBaseAccent);
    root.style.setProperty('--orb-boost', root.dataset.orbBaseBoost);
    const setBaseAccent = (accent) => {
      root.dataset.orbBaseAccent = accent;
      root.style.setProperty('--orb-accent', accent);
    };
    const setBaseBoost = (b) => {
      root.dataset.orbBaseBoost = b;
      root.style.setProperty('--orb-boost', b);
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const accent = e.target.dataset.orbAccent;
            if (accent) setBaseAccent(accent);
            const b = e.target.dataset.orbBoost;
            if (b) setBaseBoost(b);
            e.target.classList.add('is-inview');
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="page">
      <div id="top" />
      <Navbar />
      <Hero
        mode={mode}
        onModeChange={setMode}
        controls={orbControls}
        onControlChange={(key, value) =>
          setOrbControls((prev) => ({
            ...prev,
            [key]: value,
          }))
        }
        onResetControls={() => setOrbControls(DEFAULT_ORB_CONTROLS)}
      />
      {mode === 'studio' && (
        <>
          <GenesisX />
          <Applications />
          <AboutSection />
        </>
      )}
    </div>
  );
}

export default App;

