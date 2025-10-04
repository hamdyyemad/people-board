interface EgyptFlagProps {
  className?: string;
  size?: number;
}

export function EgyptFlag({ className = "", size = 24 }: EgyptFlagProps) {
  return (
    <svg
      width={size}
      height={size * 0.6}
      viewBox="0 0 24 14.4"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Red stripe */}
      <rect width="24" height="4.8" fill="#CE1126" />
      {/* White stripe */}
      <rect width="24" height="4.8" y="4.8" fill="white" />
      {/* Black stripe */}
      <rect width="24" height="4.8" y="9.6" fill="#000000" />
      {/* Eagle of Saladin */}
      <g transform="translate(12, 7.2)">
        <circle cx="0" cy="0" r="1.2" fill="#C8102E" />
        <path d="M-0.8,-0.4 L0.8,-0.4 L0.6,0.4 L-0.6,0.4 Z" fill="#FFD700" />
        <path d="M-0.4,-0.8 L0.4,-0.8 L0.2,0.8 L-0.2,0.8 Z" fill="#FFD700" />
      </g>
    </svg>
  );
}
