import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

// Animated logo: waveform bars pulsate on parent hover
export const Logo: React.FC<LogoProps> = ({ size = 64, className = '' }) => {
  const px = size;
  return (
    <div
      className={`relative inline-block group/logo select-none ${className}`}
      style={{ width: px, height: px }}
      aria-label="Sonique logo"
      role="img"
    >
      <svg
        viewBox="0 0 512 512"
        width={px}
        height={px}
        className="drop-shadow-md"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#7b5dfd" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feDropShadow dx="0" dy="6" stdDeviation="14" floodColor="#000" floodOpacity="0.32" />
          </filter>
          <clipPath id="circleClip"><circle cx="256" cy="256" r="230" /></clipPath>
        </defs>
        <circle cx="256" cy="256" r="230" fill="url(#logoGradient)" filter="url(#logoShadow)" />
        <g fill="#fff" className="origin-center">
          {/* Center bar */}
          <rect className="logo-bar bar-1" x="240" y="136" width="32" height="240" rx="16" />
          {/* Inner left */}
            <rect className="logo-bar bar-2" x="192" y="176" width="32" height="160" rx="16" />
          {/* Inner right */}
            <rect className="logo-bar bar-3" x="288" y="176" width="32" height="160" rx="16" />
          {/* Outer right */}
            <rect className="logo-bar bar-4" x="336" y="216" width="32" height="80" rx="16" />
          {/* Outer left */}
            <rect className="logo-bar bar-5" x="144" y="216" width="32" height="80" rx="16" />
        </g>
      </svg>
      <style>{`
        .group/logo .logo-bar {
          transform-origin: 50% 100%;
          transition: transform .4s cubic-bezier(.4,.2,.2,1), filter .4s;
          filter: drop-shadow(0 0 0 rgba(255,255,255,0));
        }
        .group/logo:hover .logo-bar { filter: drop-shadow(0 0 6px rgba(255,255,255,0.28)); }
        .group/logo:hover .bar-1 { animation: barPulse 1.2s ease-in-out infinite; }
        .group/logo:hover .bar-2 { animation: barPulse 1.2s .1s ease-in-out infinite; }
        .group/logo:hover .bar-3 { animation: barPulse 1.2s .15s ease-in-out infinite; }
        .group/logo:hover .bar-4 { animation: barPulse 1.2s .22s ease-in-out infinite; }
        .group/logo:hover .bar-5 { animation: barPulse 1.2s .28s ease-in-out infinite; }
        @keyframes barPulse { 0%,100% { transform: scaleY(1); } 40% { transform: scaleY(1.35); } 60% { transform: scaleY(.85);} }
        @media (prefers-reduced-motion: reduce) {
          .group/logo .logo-bar { animation: none !important; }
        }
      `}</style>
    </div>
  );
};
