export default function MusicVideoIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" role="img" aria-label="MusicMaxxer" shapeRendering="geometricPrecision">
      <rect
        x="14"
        y="18"
        width="36"
        height="22"
        rx="8"
        stroke="var(--mv-video)"
        strokeWidth="2.8"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M30 24 L30 34 L39 29 Z" fill="var(--mv-video)" opacity="0.95" />

      <path
        d="M40 20v16.5c0 2.3-1.9 4.1-4.2 4.1c-2.3 0-4.2-1.8-4.2-4.1s1.9-4.1 4.2-4.1c.7 0 1.3.1 1.9.4V22.2l9-2v3.6l-6.7 1.4z"
        fill="var(--mv-music)"
      />
    </svg>
  );
}

