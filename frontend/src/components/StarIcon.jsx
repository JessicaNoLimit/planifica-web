export default function StarIcon({ className = '', filled = false }) {
  const resolvedClassName = className ? `star-icon ${className}` : 'star-icon';

  return (
    <svg aria-hidden="true" className={resolvedClassName} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'}>
      <path
        d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
