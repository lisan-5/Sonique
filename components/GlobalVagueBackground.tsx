import React from 'react';

interface GlobalVagueBackgroundProps {
  className?: string;
  intensity?: number; // 0 - 1 typical
  noise?: boolean;
}

// A very subtle full-screen animated gradient + soft amorphous blobs + (optional) faint noise.
// Designed to sit at the very back (behind CosmicBackdrop & BackgroundPulse) for depth.
export const GlobalVagueBackground: React.FC<GlobalVagueBackgroundProps> = ({ className = '', intensity = 0.8, noise = true }) => {
  const clamped = Math.min(Math.max(intensity, 0), 1);
  return (
    <div className={`pointer-events-none fixed inset-0 -z-50 overflow-hidden ${className}`} aria-hidden="true">
      {/* Animated gradient layer */}
      <div className="absolute inset-0 gradient-layer opacity-[0.55]" />

      {/* Blobs layer */}
      <div className="absolute inset-0">
        {[0,1,2,3].map(i => (
          <span
            key={i}
            className={`blob blob-${i}`}
            style={{
              animationDelay: `${i * 6}s`,
              // Opacity scaled by intensity
              opacity: 0.18 - i * 0.03 * clamped,
              filter: 'blur(80px)' ,
            }}
          />
        ))}
      </div>

      {/* Optional faint film grain / noise overlay */}
      {noise && (
        <div className="absolute inset-0 mix-blend-overlay opacity-[0.07] noise-layer" />
      )}

      <style>{`
        .gradient-layer {
          background: linear-gradient(115deg, #1a1024, #221733, #1d1233, #271436, #1f1030);
          background-size: 500% 500%;
          animation: gradientDrift 80s linear infinite;
        }
        @keyframes gradientDrift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .blob {
          position: absolute;
          top: 50%; left: 50%;
          width: 110vmax; height: 110vmax;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle at 50% 50%, rgba(236,72,153,0.12) 0%, rgba(147,51,234,0.06) 32%, rgba(0,0,0,0) 70%);
          animation: blobFloat 60s ease-in-out infinite;
          mix-blend-mode: screen;
        }
        .blob-1 { animation-duration: 75s; background: radial-gradient(circle at 40% 45%, rgba(168,85,247,0.12) 0%, rgba(236,72,153,0.05) 35%, rgba(0,0,0,0) 70%); }
        .blob-2 { animation-duration: 90s; background: radial-gradient(circle at 55% 55%, rgba(236,72,153,0.1) 0%, rgba(147,51,234,0.05) 40%, rgba(0,0,0,0) 72%); }
        .blob-3 { animation-duration: 105s; background: radial-gradient(circle at 60% 40%, rgba(139,92,246,0.12) 0%, rgba(236,72,153,0.05) 42%, rgba(0,0,0,0) 75%); }
        @keyframes blobFloat {
          0% { transform: translate(-50%, -50%) scale(0.92) rotate(0deg); }
          33% { transform: translate(-48%, -52%) scale(1.05) rotate(20deg); }
          66% { transform: translate(-52%, -48%) scale(0.97) rotate(-18deg); }
          100% { transform: translate(-50%, -50%) scale(0.92) rotate(0deg); }
        }
        .noise-layer { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAIElEQVQoU2NkYGD4z0AEYBxVSFcwCkbGGIwKxGgaiB4lCABkTQkE6mG4VwAAAABJRU5ErkJggg=="); background-size: 160px 160px; }
        @media (prefers-reduced-motion: reduce) {
          .gradient-layer, .blob { animation: none !important; }
        }
      `}</style>
    </div>
  );
};
