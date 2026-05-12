export default function AuthBrandHero() {
  return (
    <div className="auth-brand-hero" aria-label="Planifica">
      <div className="auth-brand-logo" aria-hidden="true">
        <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="authHeroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff4fd8" />
              <stop offset="42%" stopColor="#c06cff" />
              <stop offset="72%" stopColor="#69a8ff" />
              <stop offset="100%" stopColor="#49e6ff" />
            </linearGradient>

            <filter id="authHeroGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d="M 18 220 Q 108 182 200 220 T 382 220"
            stroke="url(#authHeroGradient)"
            strokeWidth="4"
            fill="none"
            opacity="0.44"
            strokeLinecap="round"
            filter="url(#authHeroGlow)"
          />

          <circle
            cx="200"
            cy="190"
            r="88"
            stroke="url(#authHeroGradient)"
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
            filter="url(#authHeroGlow)"
          />

          <path
            d="M 160 190 L 190 222 L 246 164"
            stroke="url(#authHeroGradient)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#authHeroGlow)"
          />
        </svg>
      </div>

      <div className="auth-brand-name">planifica</div>
      <div className="auth-brand-tagline">Organiza tu vida. Sin ruido.</div>
    </div>
  );
}
