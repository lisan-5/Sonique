import React from 'react';

interface CoverItem { title: string; artist: string; img: string; query: string; }

interface FamousCoversGridProps {
  onSelect: (query: string) => void;
  className?: string;
}

// Reusing YouTube public thumbnails (fair-use demo).
const covers: CoverItem[] = [
  { title: 'Bohemian Rhapsody', artist: 'Queen', query: 'Bohemian Rhapsody Queen', img: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg' },
  { title: 'Billie Jean', artist: 'Michael Jackson', query: 'Billie Jean Michael Jackson', img: 'https://img.youtube.com/vi/Zi_XLOBDo_Y/hqdefault.jpg' },
  { title: 'Hotel California', artist: 'Eagles', query: 'Hotel California Eagles', img: 'https://img.youtube.com/vi/BciS5krYL80/hqdefault.jpg' },
  { title: 'Shape of You', artist: 'Ed Sheeran', query: 'Shape of You Ed Sheeran', img: 'https://img.youtube.com/vi/JGwWNGJdvx8/hqdefault.jpg' },
  { title: 'Smells Like Teen Spirit', artist: 'Nirvana', query: 'Smells Like Teen Spirit Nirvana', img: 'https://img.youtube.com/vi/hTWKbfoikeg/hqdefault.jpg' },
  { title: 'Imagine', artist: 'John Lennon', query: 'Imagine John Lennon', img: 'https://img.youtube.com/vi/YkgkThdzX-8/hqdefault.jpg' },
  { title: 'Rolling in the Deep', artist: 'Adele', query: 'Rolling in the Deep Adele', img: 'https://img.youtube.com/vi/rYEDA3JcQqw/hqdefault.jpg' },
  { title: 'Lose Yourself', artist: 'Eminem', query: 'Lose Yourself Eminem', img: 'https://img.youtube.com/vi/_Yhyp-_hX2s/hqdefault.jpg' },
];

export const FamousCoversGrid: React.FC<FamousCoversGridProps> = ({ onSelect, className = '' }) => {
  return (
    <section className={`mt-16 ${className}`} aria-label="Famous song covers">
      <h3 className="text-xl font-bold mb-5 tracking-tight">Iconic Tracks – Quick Inspiration</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {covers.map(c => (
          <button
            key={c.query}
            onClick={() => onSelect(c.query)}
            className="group relative rounded-xl overflow-hidden bg-gray-800/60 border border-gray-700 hover:border-pink-500/70 hover:shadow-[0_0_0_2px_#ec489933,0_8px_25px_-5px_rgba(236,72,153,0.35)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500/60"
            aria-label={`Generate vibe like ${c.title} by ${c.artist}`}
          >
            <img src={c.img} alt={`${c.title} cover`} loading="lazy" className="w-full h-28 object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-2 text-left">
              <p className="text-[11px] text-pink-300/80 font-semibold uppercase tracking-wide mb-0.5">{c.artist}</p>
              <p className="text-sm font-medium text-white leading-tight line-clamp-2 drop-shadow">{c.title}</p>
            </div>
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_30%_30%,rgba(236,72,153,0.25),transparent_55%)]" />
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-4 max-w-2xl">Selecting a cover seeds a vibe using that song query. These are iconic references to spark mood-based exploration.</p>
    </section>
  );
};
