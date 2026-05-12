export default function LogoPlanifica({ className = '' }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="planificaNeonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff2fd1" />
          <stop offset="100%" stopColor="#00e5ff" />
        </linearGradient>
        <filter id="planificaGlow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M 0 220 Q 100 180 200 220 T 400 220"
        stroke="url(#planificaNeonGradient)"
        strokeWidth="3"
        fill="none"
        opacity="0.4"
        filter="url(#planificaGlow)"
      />
      <circle
        cx="200"
        cy="200"
        r="90"
        stroke="url(#planificaNeonGradient)"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        filter="url(#planificaGlow)"
      />
      <path
        d="M 160 200 L 190 230 L 250 170"
        stroke="url(#planificaNeonGradient)"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#planificaGlow)"
      />
    </svg>
  );
}
