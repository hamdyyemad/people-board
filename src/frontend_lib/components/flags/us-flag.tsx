interface USFlagProps {
  className?: string;
  size?: number;
}

export function USFlag({ className = "", size = 24 }: USFlagProps) {
  return (
    <svg
      width={size}
      height={size * 0.6}
      viewBox="0 0 24 14.4"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="24" height="14.4" fill="#B22234" />
      <rect width="24" height="1.1" y="1.1" fill="white" />
      <rect width="24" height="1.1" y="3.3" fill="white" />
      <rect width="24" height="1.1" y="5.5" fill="white" />
      <rect width="24" height="1.1" y="7.7" fill="white" />
      <rect width="24" height="1.1" y="9.9" fill="white" />
      <rect width="24" height="1.1" y="12.1" fill="white" />
      <rect width="9.6" height="7.7" fill="#3C3B6E" />
      <g fill="white">
        <circle cx="1.8" cy="1.2" r="0.3" />
        <circle cx="3.0" cy="1.2" r="0.3" />
        <circle cx="4.2" cy="1.2" r="0.3" />
        <circle cx="5.4" cy="1.2" r="0.3" />
        <circle cx="6.6" cy="1.2" r="0.3" />
        <circle cx="7.8" cy="1.2" r="0.3" />
        <circle cx="2.4" cy="2.0" r="0.3" />
        <circle cx="3.6" cy="2.0" r="0.3" />
        <circle cx="4.8" cy="2.0" r="0.3" />
        <circle cx="6.0" cy="2.0" r="0.3" />
        <circle cx="7.2" cy="2.0" r="0.3" />
        <circle cx="1.8" cy="2.8" r="0.3" />
        <circle cx="3.0" cy="2.8" r="0.3" />
        <circle cx="4.2" cy="2.8" r="0.3" />
        <circle cx="5.4" cy="2.8" r="0.3" />
        <circle cx="6.6" cy="2.8" r="0.3" />
        <circle cx="7.8" cy="2.8" r="0.3" />
        <circle cx="2.4" cy="3.6" r="0.3" />
        <circle cx="3.6" cy="3.6" r="0.3" />
        <circle cx="4.8" cy="3.6" r="0.3" />
        <circle cx="6.0" cy="3.6" r="0.3" />
        <circle cx="7.2" cy="3.6" r="0.3" />
        <circle cx="1.8" cy="4.4" r="0.3" />
        <circle cx="3.0" cy="4.4" r="0.3" />
        <circle cx="4.2" cy="4.4" r="0.3" />
        <circle cx="5.4" cy="4.4" r="0.3" />
        <circle cx="6.6" cy="4.4" r="0.3" />
        <circle cx="7.8" cy="4.4" r="0.3" />
        <circle cx="2.4" cy="5.2" r="0.3" />
        <circle cx="3.6" cy="5.2" r="0.3" />
        <circle cx="4.8" cy="5.2" r="0.3" />
        <circle cx="6.0" cy="5.2" r="0.3" />
        <circle cx="7.2" cy="5.2" r="0.3" />
        <circle cx="1.8" cy="6.0" r="0.3" />
        <circle cx="3.0" cy="6.0" r="0.3" />
        <circle cx="4.2" cy="6.0" r="0.3" />
        <circle cx="5.4" cy="6.0" r="0.3" />
        <circle cx="6.6" cy="6.0" r="0.3" />
        <circle cx="7.8" cy="6.0" r="0.3" />
      </g>
    </svg>
  );
}
