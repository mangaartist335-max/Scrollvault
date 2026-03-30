export default function ScrollVaultIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" role="img" aria-label="ScrollVault" shapeRendering="geometricPrecision">
      <rect x="20" y="12" width="24" height="40" rx="8" fill="var(--sv-phone)" />
      <rect x="23" y="16" width="18" height="28" rx="6" fill="var(--sv-screen)" opacity="0.95" />
      <circle cx="32" cy="46.5" r="2.2" fill="rgba(255,255,255,0.14)" />

      <path
        d="M34.5 20.5c-5 0-8 2.4-8 6c0 3.1 2.3 4.6 6.4 5.7l1.3.3c2.4.6 3.3 1.2 3.3 2.4c0 1.6-1.6 2.7-4.2 2.7c-2.7 0-4.5-1.1-5.1-3.0"
        stroke="var(--sv-dollar)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M32 18.5v27"
        stroke="var(--sv-dollar)"
        strokeWidth="2.8"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

