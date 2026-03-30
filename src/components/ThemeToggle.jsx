import { motion } from 'framer-motion';
const ThemeToggle = ({ mode = 'studio', onChange }) => {

  const options = [
    { key: 'studio', label: 'Studio' },
    { key: 'playground', label: 'Playground' },
  ];

  return (
    <div
      className="segmentedControl"
      role="tablist"
      aria-label="Theme toggle"
    >
      {options.map((opt) => {
        const isActive = mode === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange?.(opt.key)}
            className={`segmentedControl__btn ${isActive ? 'is-active' : ''}`}
          >
            {isActive && (
              <motion.div
                layoutId="segmentedPill"
                className="segmentedControl__activePill"
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
            <span className="segmentedControl__label">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;



