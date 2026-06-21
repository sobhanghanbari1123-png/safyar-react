export default function SafyarLogo({ size = 72 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="صافیار"
    >
      <defs>
        <linearGradient id="bg-grad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e3a5f"/>
          <stop offset="100%" stopColor="#0f1f38"/>
        </linearGradient>
        <linearGradient id="body-grad" x1="10" y1="28" x2="70" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f6a800"/>
          <stop offset="100%" stopColor="#d48a00"/>
        </linearGradient>
        <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Background circle */}
      <rect width="80" height="80" rx="20" fill="url(#bg-grad)"/>
      <rect width="80" height="80" rx="20" fill="url(#shine)"/>

      {/* Car body */}
      <path
        d="M12 47 L14 38 L22 32 L35 29 L48 29 L58 34 L66 38 L68 47 L68 53 L12 53 Z"
        fill="url(#body-grad)"
        filter="url(#glow)"
      />

      {/* Cabin / roof */}
      <path
        d="M24 38 L28 30 L38 27 L50 27 L56 32 L58 38 Z"
        fill="#ffe082"
        opacity="0.95"
      />

      {/* Windshield */}
      <path
        d="M36 29 L30 38 L52 38 L56 33 L50 29 Z"
        fill="#b3d4ff"
        opacity="0.55"
      />

      {/* Rear window */}
      <path
        d="M28 30 L25 38 L32 38 L35 29 Z"
        fill="#b3d4ff"
        opacity="0.45"
      />

      {/* Door line */}
      <line x1="40" y1="38" x2="40" y2="53" stroke="#c47800" strokeWidth="1" opacity="0.5"/>

      {/* Left wheel */}
      <circle cx="24" cy="53" r="7" fill="#1a2535"/>
      <circle cx="24" cy="53" r="4.5" fill="#2d3748"/>
      <circle cx="24" cy="53" r="2" fill="#f6a800"/>

      {/* Right wheel */}
      <circle cx="56" cy="53" r="7" fill="#1a2535"/>
      <circle cx="56" cy="53" r="4.5" fill="#2d3748"/>
      <circle cx="56" cy="53" r="2" fill="#f6a800"/>

      {/* Headlight */}
      <ellipse cx="66" cy="44" rx="3" ry="2" fill="#fff9c4" opacity="0.9"/>
      <ellipse cx="66" cy="44" rx="3" ry="2" fill="#f6a800" opacity="0.4"/>

      {/* Taillight */}
      <ellipse cx="14" cy="44" rx="2.5" ry="1.8" fill="#ff5252" opacity="0.85"/>

      {/* Wrench accent */}
      <path
        d="M34 62 Q40 59 46 62"
        stroke="#f6a800"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />

      {/* Bottom stripe */}
      <rect x="12" y="53" width="56" height="2" rx="1" fill="#c47800" opacity="0.4"/>
    </svg>
  );
}
