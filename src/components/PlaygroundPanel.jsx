import { motion } from 'framer-motion';
import { clamp } from '../orbControls';

const CONTROL_CONFIG = [
  { key: 'scale', label: 'Orb scale', min: 0.85, max: 1.35, step: 0.01 },
  { key: 'glowStrength', label: 'Glow strength', min: 0.4, max: 1.8, step: 0.01 },
  { key: 'blurAmount', label: 'Blur amount', min: 0, max: 8, step: 0.1 },
  { key: 'rotationSpeed', label: 'Rotation speed', min: 0, max: 2, step: 0.01 },
  { key: 'ambientDarkness', label: 'Ambient darkness', min: 0, max: 1, step: 0.01 },
  { key: 'tintHue', label: 'Tint / hue', min: -90, max: 90, step: 1 },
];

const formatValue = (key, value) => {
  if (key === 'blurAmount') return `${value.toFixed(1)}px`;
  if (key === 'tintHue') return `${Math.round(value)}deg`;
  return value.toFixed(2);
};

const PlaygroundPanel = ({ controls, onChange, onReset }) => {
  return (
    <motion.div
      className="playgroundPanel"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.28 }}
    >
      <div className="playgroundHeader">
        <p className="eyebrow">Playground</p>
        <h2>Orb Sandbox</h2>
        <p className="muted">
          Live-tune the orb engine in real time. Move your cursor to steer highlights and drag to
          rotate.
        </p>
      </div>

      <div className="playgroundControls" role="group" aria-label="Orb controls">
        {CONTROL_CONFIG.map((cfg) => (
          <label className="controlRow" key={cfg.key}>
            <span className="controlLabel">{cfg.label}</span>
            <input
              type="range"
              min={cfg.min}
              max={cfg.max}
              step={cfg.step}
              value={controls[cfg.key]}
              onChange={(e) =>
                onChange(cfg.key, clamp(Number(e.target.value), cfg.min, cfg.max))
              }
            />
            <span className="controlValue">{formatValue(cfg.key, controls[cfg.key])}</span>
          </label>
        ))}
      </div>

      <div className="playgroundFooter">
        <p className="muted">This is a live demo area. Adjust values to preview production feel.</p>
        <button type="button" className="btn ghost" onClick={onReset}>
          Reset Defaults
        </button>
      </div>
    </motion.div>
  );
};

export default PlaygroundPanel;

