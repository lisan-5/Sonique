import React, { useEffect, useState, useRef } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface HomeHeroProps {
  onExampleSelect: (query: string) => void;
  onSongSelect: (song: string) => void;
  /** Whether audio/video is currently playing (drives subtle reactive pulse). */
  isPlaying?: boolean;
  /** Condensed mode hides long marketing text (e.g., when a playlist is showing). */
  condensed?: boolean;
}

const examples = [
  'Misty cyberpunk rooftop at 2AM',
  'Warm campfire under starry sky',
  'Retro arcade neon nostalgia',
  'Studio Ghibli style peaceful morning',
  'Slow rainy piano memories',
];

// (Deprecated) separate famousSongs list removed in favor of unified poster carousel.

// Lightweight static poster references (royalty-free placeholder or stylized gradient combos)
// In a real app you'd host images or fetch official thumbnails via YouTube API.
const videoPosters: { title: string; artist: string; img: string; query: string }[] = [
  { title: 'Bohemian Rhapsody', artist: 'Queen', query: 'Bohemian Rhapsody Queen', img: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg' },
  { title: 'Billie Jean', artist: 'Michael Jackson', query: 'Billie Jean Michael Jackson', img: 'https://img.youtube.com/vi/Zi_XLOBDo_Y/hqdefault.jpg' },
  { title: 'Hotel California', artist: 'Eagles', query: 'Hotel California Eagles', img: 'https://img.youtube.com/vi/BciS5krYL80/hqdefault.jpg' },
  { title: 'Shape of You', artist: 'Ed Sheeran', query: 'Shape of You Ed Sheeran', img: 'https://img.youtube.com/vi/JGwWNGJdvx8/hqdefault.jpg' },
  { title: 'Smells Like Teen Spirit', artist: 'Nirvana', query: 'Smells Like Teen Spirit Nirvana', img: 'https://img.youtube.com/vi/hTWKbfoikeg/hqdefault.jpg' },
  { title: 'Imagine', artist: 'John Lennon', query: 'Imagine John Lennon', img: 'https://img.youtube.com/vi/YkgkThdzX-8/hqdefault.jpg' },
  { title: 'Rolling in the Deep', artist: 'Adele', query: 'Rolling in the Deep Adele', img: 'https://img.youtube.com/vi/rYEDA3JcQqw/hqdefault.jpg' },
  { title: 'Lose Yourself', artist: 'Eminem', query: 'Lose Yourself Eminem', img: 'https://img.youtube.com/vi/_Yhyp-_hX2s/hqdefault.jpg' },
];

export const HomeHero: React.FC<HomeHeroProps> = ({ onExampleSelect, onSongSelect, isPlaying, condensed }) => {
  const [posterIndex, setPosterIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [fade, setFade] = useState(true);
  const rotationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());
  const prefersReduced = usePrefersReducedMotion();
  const tiltRef = useRef<HTMLDivElement | null>(null);
  const glareRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (prefersReduced) return; // skip tilt for reduced motion
    const el = tiltRef.current;
    if (!el) return;
    let rect = el.getBoundingClientRect();
    const handleResize = () => { rect = el.getBoundingClientRect(); };
    window.addEventListener('resize', handleResize);
  // Track current rotation values if future smoothing is needed (not persisted now)
    const dampen = 14; // lower = more dramatic
    const onPointerMove = (e: PointerEvent) => {
      frameRef.current && cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rotX = (y - 0.5) * dampen * -1;
        const rotY = (x - 0.5) * dampen;
  // Apply transform directly (no RAF batching beyond this frame)
        el.style.transform = `perspective(1100px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.04,1.04,1.04)`;
        if (glareRef.current) {
          glareRef.current.style.background = `radial-gradient(circle at ${x*100}% ${y*100}%, rgba(255,255,255,0.35), transparent 55%)`;
          glareRef.current.style.opacity = '1';
        }
      });
    };
    const onPointerLeave = () => {
      frameRef.current && cancelAnimationFrame(frameRef.current);
      el.style.transform = 'perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
      if (glareRef.current) glareRef.current.style.opacity = '0';
    };
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerleave', onPointerLeave);
    return () => {
      window.removeEventListener('resize', handleResize);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [prefersReduced]);

  const advance = (dir: 1 | -1) => {
    setFade(false);
    setTimeout(() => {
      setPosterIndex(prev => (prev + dir + videoPosters.length) % videoPosters.length);
      setFade(true);
    }, 180);
  };

  const schedule = () => {
    if (rotationRef.current) clearInterval(rotationRef.current);
    rotationRef.current = setInterval(() => {
      // only rotate if no interaction in last 5s
      if (Date.now() - lastInteractionRef.current > 5000) {
        advance(1);
      }
    }, 4000);
  };

  useEffect(() => {
    schedule();
    return () => { if (rotationRef.current) clearInterval(rotationRef.current); };
  }, []);

  const handlePrev = (e?: React.MouseEvent) => { e?.stopPropagation(); lastInteractionRef.current = Date.now(); advance(-1); schedule(); };
  const handleNext = (e?: React.MouseEvent) => { e?.stopPropagation(); lastInteractionRef.current = Date.now(); advance(1); schedule(); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { handlePrev(); }
      else if (e.key === 'ArrowRight') { handleNext(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const currentPoster = videoPosters[posterIndex];
  useEffect(()=> { setImageError(false); }, [posterIndex]);
  const sectionPadding = condensed ? 'p-6 md:p-7' : 'p-10';
  return (
    <section className={`relative overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900 via-[#1a1324] to-[#110b1a] ${sectionPadding} ${condensed ? 'mb-8' : 'mb-14'} shadow-[0_0_60px_-15px_rgba(139,92,246,0.4)]`}>
      {/* Animated background orbs */}
  <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(circle_at_center,black,transparent_70%)]" aria-hidden="true">
  <div className="absolute -top-10 -left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse" aria-hidden="true" />
  <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl animate-[pulse_6s_ease-in-out_infinite_alternate]" aria-hidden="true" />
      </div>

  <div className={`relative z-10 flex ${condensed ? 'flex-col items-center' : 'flex-col lg:flex-row'} gap-8 md:gap-10`}>
        {/* Intro copy (hidden in condensed mode) */}
        {!condensed && (
        <div className="flex-1 min-w-[280px]">
          {!condensed && (
            <>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-5 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-fuchsia-400 drop-shadow-[0_4px_12px_rgba(236,72,153,0.25)]">
                Feed Sonique a feeling a scene, memory, or aesthetic and get a curated set of atmospheric tracks.
              </h2>
              <p className="text-base sm:text-[17px] text-gray-300/90 leading-relaxed max-w-xl mb-8 md:mb-10 font-light">
                <span className="font-semibold text-purple-200/90">Describe</span> a mood, a moment, or a vibe—Sonique turns it into an original-feeling playlist with evocative fictional tracks.
              </p>
            </>
          )}

          <div>
      {!condensed && (
              <>
                <h3 className="text-[11px] font-semibold tracking-[0.18em] text-gray-400 uppercase mb-4">Try an example mood</h3>
                <div className="flex flex-wrap gap-2 mb-8 md:mb-10">
                  {examples.map(ex => (
                    <button
                      key={ex}
                      onClick={() => onExampleSelect(ex)}
                      className="px-4 py-2 rounded-full bg-gradient-to-br from-gray-800/80 to-gray-700/70 hover:from-purple-700 hover:to-pink-600 text-gray-300 hover:text-white border border-gray-700/70 hover:border-pink-400/60 text-[13px] tracking-wide transition-all duration-300 shadow hover:shadow-[0_0_0_1px_rgba(236,72,153,0.5),0_6px_18px_-4px_rgba(236,72,153,0.5)] backdrop-blur-sm"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
    </div>
    )}

        {/* Rotating famous video poster showcase */}
  <div className={`${condensed ? 'w-full max-w-3xl' : 'flex-1'} flex items-center justify-center`}>
          <div ref={tiltRef} className="relative transition-transform duration-300 will-change-transform">
          <div className="relative w-full max-w-md aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl group cursor-pointer backdrop-blur-sm [transform-style:preserve-3d] bg-gradient-to-br from-gray-800 via-gray-900 to-black" onClick={() => onSongSelect(currentPoster.query)} role="group" aria-label="Featured music poster carousel">
            {/* Enhanced reactive pulse: layered concentric rings */}
            {isPlaying && !prefersReduced && (
              <>
                <div className="pointer-events-none absolute -inset-5 rounded-[2rem] animate-[heroBeat_1800ms_ease-in-out_infinite] bg-[conic-gradient(from_130deg_at_50%_50%,rgba(168,85,247,0.18),rgba(236,72,153,0.15),rgba(99,102,241,0.18),rgba(236,72,153,0.15),rgba(168,85,247,0.18))] blur-2xl opacity-80" />
                <div className="pointer-events-none absolute -inset-10 rounded-[2.5rem] animate-[ringPulse_2400ms_ease-in-out_infinite] bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.4),transparent_70%)] opacity-30" />
                <div className="pointer-events-none absolute -inset-[4.5rem] rounded-[3.5rem] animate-[ringPulse2_3200ms_ease-in-out_infinite] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.35),transparent_72%)] opacity-25" />
                {/* Mini equalizer bars */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 flex items-end justify-center gap-1 opacity-90">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-1 rounded-sm bg-gradient-to-t from-pink-500 via-fuchsia-400 to-purple-400 animate-[eqBeat_1400ms_ease-in-out_infinite]`} 
                      style={{ animationDelay: `${(i * 90) % 700}ms`, height: `${30 + (i%3)*4}px` }}
                    />
                  ))}
                </div>
              </>
            )}
            {!prefersReduced && (
              <div className="pointer-events-none absolute inset-0 before:content-[''] before:absolute before:inset-0 before:rounded-3xl before:p-[2px] before:bg-[conic-gradient(at_30%_30%,#a855f7,#ec4899,#6366f1,#ec4899,#a855f7)] before:animate-[spinBorder_16s_linear_infinite] before:[mask:linear-gradient(#000,#000)_content-box,linear-gradient(#000,#000)] before:[mask-composite:exclude]" />
            )}
            <div className="absolute inset-0 rounded-3xl bg-gray-900/60 backdrop-blur-md" />
            <div className="absolute inset-0 rounded-3xl opacity-30 mix-blend-overlay" style={{ backgroundImage: "url(data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' fill='none'/%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M0 0h1v1H0z'/%3E%3C/g%3E%3C/svg%3E)" }} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,rgba(168,85,247,0.35),transparent_65%)]" />
            {!imageError && (
              <img
                key={currentPoster.img}
                src={currentPoster.img}
                alt=""
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}
                loading="lazy"
                onError={() => setImageError(true)}
                decoding="async"
                referrerPolicy="no-referrer"
              />
            )}
            {imageError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-purple-800/30 via-fuchsia-800/20 to-pink-700/30">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl font-bold tracking-tight text-white/90 shadow-lg">
                  {currentPoster.title.charAt(0)}
                </div>
                <p className="text-xs text-gray-300/70 px-4 text-center max-w-[220px] leading-relaxed">Poster unavailable. Still clickable to generate a vibe.</p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
            <div ref={glareRef} className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 mix-blend-overlay" />
            <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-1">
              <h4 className="text-lg font-bold text-white drop-shadow-md tracking-tight">{currentPoster.title}</h4>
              <p className="text-sm text-gray-300">{currentPoster.artist}</p>
              <p className="text-[11px] uppercase tracking-wide text-purple-300/80 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Click to generate a vibe like this</p>
              <div className="h-1 w-24 rounded-full bg-purple-500/50 mt-3 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-400 to-pink-500 animate-[progress_3.8s_linear_infinite]" />
              </div>
            </div>
            {/* Controls */}
            <button onClick={handlePrev} aria-label="Previous" className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur text-gray-300 hover:text-white hover:bg-black/60 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none">
              <span className="sr-only">Previous poster</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button onClick={handleNext} aria-label="Next" className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur text-gray-300 hover:text-white hover:bg-black/60 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none">
              <span className="sr-only">Next poster</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="absolute top-2 right-2 flex gap-2 max-w-[55%] overflow-x-auto scrollbar-none py-1 px-1 bg-black/30 rounded-xl backdrop-blur-sm">
              {videoPosters.map((p, i) => (
                <button
                  key={p.query}
                  onClick={(e) => { e.stopPropagation(); lastInteractionRef.current = Date.now(); setPosterIndex(i); setFade(false); setTimeout(()=> setFade(true), 140); schedule(); }}
                  aria-label={`Show ${p.title} poster`}
                  className={`relative shrink-0 w-12 h-8 rounded-md overflow-hidden ring-1 ring-white/10 hover:ring-pink-400/60 transition-all ${i===posterIndex ? 'ring-2 ring-pink-400 shadow-[0_0_0_2px_rgba(236,72,153,0.35)] scale-105' : 'opacity-70 hover:opacity-100'}`}
                >
                  <img src={p.img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-20" />
                </button>
              ))}
            </div>
          </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:.55;} 50% { opacity:.9;} }
        @keyframes progress { 0% { transform: translateX(-100%);} 100% { transform: translateX(100%);} }
        @keyframes spinBorder { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
        /* Audio-reactive inspired breathing glow */
        @keyframes heroBeat { 
          0%, 100% { transform: scale(.94) rotate(0.0001deg); filter: brightness(.95) saturate(1.1); opacity:.55; }
          45% { transform: scale(1.07) rotate(0.0001deg); filter: brightness(1.15) saturate(1.35); opacity:.95; }
        }
        @keyframes ringPulse { 
          0%,100% { transform: scale(.85); opacity:.25; }
          45% { transform: scale(1); opacity:.45; }
        }
        @keyframes ringPulse2 { 
          0%,100% { transform: scale(.75); opacity:.18; }
          50% { transform: scale(1.05); opacity:.38; }
        }
        @keyframes eqBeat {
          0%,100% { transform: scaleY(.35); opacity:.55; }
          40% { transform: scaleY(1); opacity:1; }
          55% { transform: scaleY(.55); opacity:.75; }
        }
      `}</style>
    </section>
  );
};
