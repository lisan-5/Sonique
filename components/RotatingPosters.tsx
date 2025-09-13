import React, { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface PosterItem { title: string; artist: string; img: string; query: string; }
interface RotatingPostersProps {
  posters: PosterItem[];
  onSelect: (query: string) => void;
  radius?: number; // base radius in px (responsive scaling applied)
  autoSpinMs?: number;
  className?: string;
}

export const RotatingPosters: React.FC<RotatingPostersProps> = ({ posters, onSelect, radius = 230, autoSpinMs = 8000, className = '' }) => {
  const prefersReduced = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const angleRef = useRef(0);
  const rafRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Continuous spin (paused on hover / reduced motion)
  useEffect(() => {
    if (prefersReduced) return;
    const step = (t: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = t;
      const dt = t - lastTimeRef.current;
      lastTimeRef.current = t;
      const perMs = (Math.PI * 2) / autoSpinMs; // full rotation per autoSpinMs
      angleRef.current += perMs * dt;
      if (containerRef.current) {
        containerRef.current.style.setProperty('--spin-angle', `${angleRef.current}rad`);
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [autoSpinMs, prefersReduced]);

  const itemCount = posters.length;

  return (
    <div className={`relative mx-auto ${className}`} style={{ width: radius*2, height: radius*2 }}>
      <div
        ref={containerRef}
        className={`absolute inset-0 origin-center ${prefersReduced ? '' : 'transition-[filter]'} group`}
        style={{
          '--spin-angle': '0rad',
          animation: prefersReduced ? undefined : 'spinLinear 40s linear infinite',
        } as React.CSSProperties}
        aria-label="Rotating famous music posters"
      >
        {posters.map((p, i) => {
          const frac = i / itemCount;
          const angle = frac * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return (
            <button
              key={p.query}
              onClick={() => onSelect(p.query)}
              className="absolute w-28 h-36 md:w-32 md:h-40 rounded-xl overflow-hidden shadow-lg ring-1 ring-white/10 hover:ring-pink-400/70 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all group/poster"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(calc(var(--spin-angle) * -1))`,
                background: 'linear-gradient(135deg,#312e81,#1e1b4b)',
              }}
              aria-label={`Generate a vibe like ${p.title} by ${p.artist}`}
            >
              <img src={p.img} alt="" className="w-full h-full object-cover opacity-80 group-hover/poster:opacity-100 group-hover/poster:scale-105 transition-transform duration-500" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-1.5 text-left">
                <p className="text-[10px] uppercase tracking-wide font-semibold text-pink-300/80 leading-tight">{p.artist}</p>
                <p className="text-[11px] text-white font-medium leading-tight line-clamp-2 drop-shadow">{p.title}</p>
              </div>
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover/poster:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_35%_35%,rgba(236,72,153,0.35),transparent_60%)]" />
            </button>
          );
        })}
      </div>
      {/* Center badge */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-500 p-[2px] shadow-[0_0_40px_-8px_rgba(236,72,153,0.55)]">
        <div className="w-full h-full rounded-full bg-gray-950 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(236,72,153,0.15),transparent_65%)]" />
          <p className="text-[10px] tracking-[0.25em] text-purple-200/70 font-semibold mb-1">FAMOUS</p>
          <p className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-300 via-fuchsia-200 to-purple-200 drop-shadow">VIBES</p>
          <p className="text-[10px] mt-1 text-gray-400/80 max-w-[80%] leading-snug">Tap a cover to seed<br/>a playlist mood.</p>
        </div>
      </div>
      <style>{`
        @keyframes spinLinear { 0% { transform: rotate(0deg);} 100% { transform: rotate(-360deg);} }
      `}</style>
    </div>
  );
};
