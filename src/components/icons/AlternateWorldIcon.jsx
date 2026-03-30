export default function AlternateWorldIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label="Alternate World"
      shapeRendering="geometricPrecision"
    >
      <defs>
        <clipPath id="awClip">
          <circle cx="32" cy="32" r="18" />
        </clipPath>
        <clipPath id="awRight">
          <rect x="32" y="0" width="32" height="64" />
        </clipPath>
      </defs>

      <circle cx="32" cy="32" r="18" fill="var(--aw-ocean)" opacity="0.95" />
      <circle
        cx="32"
        cy="32"
        r="18"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="2.6"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <g clipPath="url(#awClip)">
        <path
          d="M18 30c4-6 11-6 13-2c1.7 3-2 6-6.5 7.2c-3 .8-4.3 2.2-5.6 4.8c-1.6 3.1-5 2.5-6.2.8c-1.3-1.9-.5-6.3 5.3-10.6z"
          fill="var(--aw-land)"
          opacity="0.95"
        />

        <g clipPath="url(#awRight)">
          <rect x="32" y="14" width="20" height="36" fill="rgba(0,0,0,0.10)" />
          {Array.from({ length: 6 }).map((_, i) => (
            <path
              key={`v${i}`}
              d={`M${34 + i * 3} 16 L${34 + i * 3} 48`}
              stroke="var(--aw-digital)"
              strokeOpacity="0.45"
              strokeWidth="1.4"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <path
              key={`h${i}`}
              d={`M32  ${18 + i * 5} L52 ${18 + i * 5}`}
              stroke="var(--aw-digital)"
              strokeOpacity="0.34"
              strokeWidth="1.4"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          <rect x="45" y="22" width="2.5" height="2.5" rx="0.6" fill="var(--aw-digital)" opacity="0.7" />
          <rect x="38" y="40" width="2.5" height="2.5" rx="0.6" fill="var(--aw-digital)" opacity="0.6" />
        </g>
      </g>

      <path
        d="M22.5 23.5c4.2-4.3 11.2-5.4 16.3-2.4"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

