interface Props {
  height?: number;
  className?: string;
}

export default function IslandScene({ height = 200, className = '' }: Props) {
  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{ height }}
    >
      <svg
        viewBox="0 0 480 200"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9FE0F2" />
            <stop offset="100%" stopColor="#C9F0E4" />
          </linearGradient>
          <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#87CEEB" />
            <stop offset="100%" stopColor="#5BB89A" />
          </linearGradient>
        </defs>

        {/* sky */}
        <rect width="480" height="200" fill="url(#skyGrad)" />

        {/* sun */}
        <circle cx="400" cy="48" r="26" fill="#FCD34D" />
        <circle cx="400" cy="48" r="34" fill="#FCD34D" opacity="0.25" />

        {/* clouds */}
        <g fill="#FFFFFF" opacity="0.9">
          <ellipse cx="90" cy="46" rx="28" ry="14" />
          <ellipse cx="118" cy="50" rx="22" ry="12" />
          <ellipse cx="64" cy="52" rx="18" ry="10" />
          <ellipse cx="270" cy="34" rx="22" ry="11" />
          <ellipse cx="292" cy="38" rx="16" ry="9" />
        </g>

        {/* sea */}
        <rect y="150" width="480" height="50" fill="url(#seaGrad)" />

        {/* island */}
        <ellipse cx="240" cy="170" rx="170" ry="38" fill="#E8D9A8" />
        <ellipse cx="240" cy="158" rx="150" ry="32" fill="#7BC97F" />
        <ellipse cx="240" cy="152" rx="120" ry="24" fill="#8FD694" />

        {/* trees */}
        <g>
          <rect x="150" y="118" width="8" height="26" rx="3" fill="#A9744F" />
          <circle cx="154" cy="112" r="20" fill="#5BB89A" />
          <circle cx="142" cy="118" r="14" fill="#6FC9A8" />
          <circle cx="166" cy="118" r="14" fill="#6FC9A8" />
        </g>
        <g>
          <rect x="320" y="124" width="7" height="22" rx="3" fill="#A9744F" />
          <circle cx="323" cy="118" r="16" fill="#5BB89A" />
          <circle cx="313" cy="124" r="11" fill="#6FC9A8" />
          <circle cx="333" cy="124" r="11" fill="#6FC9A8" />
        </g>

        {/* little house */}
        <g>
          <rect x="218" y="120" width="44" height="30" rx="3" fill="#FFFBF0" />
          <rect
            x="218"
            y="120"
            width="44"
            height="30"
            rx="3"
            fill="none"
            stroke="#E2C9A0"
            strokeWidth="2"
          />
          <polygon points="214,122 240,100 266,122" fill="#E8896B" />
          <rect x="234" y="132" width="12" height="18" rx="2" fill="#A9744F" />
          <rect x="223" y="128" width="9" height="9" rx="1" fill="#87CEEB" />
        </g>
      </svg>
    </div>
  );
}
