import React, { useMemo, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface PulseWaveProps {
  bars?: number;
  height?: number; // total height of the wave area
  className?: string;
}

// A decorative animated pulse bar wave that sweeps left->right with subtle randomization.
export const PulseWave: React.FC<PulseWaveProps> = ({ bars = 48, height = 72, className = '' }) => {
  const reduce = usePrefersReducedMotion();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Pre-generate random base heights + delays so they are consistent per render.
  const barMeta = useMemo(() => {
    return Array.from({ length: bars }).map((_, i) => {
      const base = 20 + Math.random() * 55; // base amplitude % of max height
      const delay = (i * 90) % 2400; // ms
      const dur = 1600 + (i % 7) * 180; // variance
      return { base, delay, dur };
    });
  }, [bars]);

  return (
    <div
      className={`pointer-events-auto select-none w-full ${className}`}
      style={{ height }}
      aria-hidden="true"
    >
      <div className="relative w-full h-full overflow-hidden group" style={{ maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)' }}>
        {/* subtle gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-gray-900/40 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(236,72,153,0.18),transparent_60%),radial-gradient(circle_at_85%_55%,rgba(99,102,241,0.22),transparent_55%)] opacity-70" />
        <div className="absolute inset-0 flex items-end justify-between px-2">
          {barMeta.map((m, i) => {
            const proximity = hoverIndex == null ? 0 : Math.abs(hoverIndex - i);
            const amplify = hoverIndex == null ? 1 : Math.max(1, 1.4 - proximity * 0.22); // neighbors slightly scale
            return (
              <span
                key={i}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(prev => (prev === i ? null : prev))}
                className={
                  `relative flex-1 mx-[1px] rounded-sm bg-gradient-to-t from-fuchsia-600 via-pink-500 to-purple-400 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] ` +
                  (reduce ? '' : 'animate-[pulseGrow_var(--dur)_ease-in-out_infinite]')
                }
                style={{
                  height: `${m.base * amplify}%`,
                  animationDelay: reduce ? undefined : `${m.delay}ms`,
                  ['--dur' as any]: `${m.dur}ms`,
                  transformOrigin: 'center bottom',
                  transition: 'height 300ms ease, transform 400ms ease, filter 600ms ease',
                  filter: hoverIndex === i ? 'brightness(1.3) saturate(1.4)' : proximity === 1 ? 'brightness(1.15)' : 'brightness(1)',
                }}
                data-i={i}
              />
            );
          })}
        </div>
        {/* sweeping gloss */}
        {!reduce && (
          <div className="absolute inset-0 before:content-[''] before:absolute before:inset-y-0 before:left-[-20%] before:w-[40%] before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent before:animate-[sweep_5.5s_linear_infinite] group-hover:before:animate-[sweep_2.5s_linear_infinite]" />
        )}
        {/* top subtle hairline */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
      </div>
      <style>{`
        @keyframes pulseGrow {
          0%,100% { transform: scaleY(.45); filter: brightness(.9) saturate(.9); }
          40% { transform: scaleY(1); filter: brightness(1.2) saturate(1.3); }
          55% { transform: scaleY(.6); filter: brightness(1) saturate(1); }
        }
        @keyframes sweep {
          0% { transform: translateX(0); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
};
