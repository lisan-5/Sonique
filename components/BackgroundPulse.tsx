import React from 'react';

interface BackgroundPulseProps {
  className?: string;
  intensity?: number; // scales opacity subtly
}

// Subtle ambient music pulse: layered radial gradients with very soft scale/opacity cycling.
// Honors prefers-reduced-motion: stops animation.
export const BackgroundPulse: React.FC<BackgroundPulseProps> = ({ className = '', intensity = 1 }) => {
  const safeIntensity = Math.min(Math.max(intensity, 0), 2);
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}> 
      <div className="absolute inset-0">
        <div className="relative w-full h-full">
          {[0,1,2].map(layer => (
            <div
              key={layer}
              className="absolute top-1/2 left-1/2 will-change-transform"
              style={{
                width: '140vmax',
                height: '140vmax',
                marginLeft: '-70vmax',
                marginTop: '-70vmax',
                background: `radial-gradient(circle at 50% 50%, rgba(236,72,153,${0.055 * safeIntensity}) 0%, rgba(147,51,234,${0.03 * safeIntensity}) 35%, rgba(17,17,29,0) 70%)`,
                filter: 'blur(60px)',
                animation: `pulseLayer ${18 + layer * 4}s ease-in-out ${layer * 3}s infinite`,
                opacity: 0.5 - layer * 0.12,
                mixBlendMode: 'screen'
              }}
            />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes pulseLayer { 
          0%, 100% { transform: scale(0.92) rotate(0deg); }
          35% { transform: scale(1.02) rotate(8deg); }
          70% { transform: scale(0.97) rotate(-6deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pointer-events-none.absolute.inset-0.overflow-hidden div[style*='pulseLayer'] { animation: none !important; }
        }
      `}</style>
    </div>
  );
};
