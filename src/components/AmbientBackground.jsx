import { useReducedMotion } from '../motion/useReducedMotion';

export default function AmbientBackground() {
  const reduced = useReducedMotion();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Slow drifting gradient */}
      <div
        className={`absolute inset-0 opacity-60 ${reduced ? '' : 'animate-gradient-drift'}`}
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(56,189,248,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(16,185,129,0.06) 0%, transparent 60%), radial-gradient(ellipse at 50% 50%, rgba(56,189,248,0.04) 0%, transparent 80%)',
          backgroundSize: '300% 300%',
        }}
      />

      {/* Radial glow behind center */}
      <div
        className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full ${reduced ? 'opacity-20' : 'animate-glow-pulse opacity-30'}`}
        style={{
          background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Subtle floating particles */}
      {!reduced && (
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-vault-cyan/20"
              style={{
                left: `${15 + i * 14}%`,
                top: `${20 + (i % 3) * 25}%`,
                animation: `particle-float ${6 + i * 2}s ease-in-out ${i * 1.5}s infinite`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}