// Fix: Implement the TrackCard component to display individual track information.
import React, { useMemo } from 'react';
import { Track } from '../types';

interface TrackCardProps {
  track: Track;
  onSelect: (track: Track) => void;
  onPlay?: (track: Track) => void; // unified open
}

export const TrackCard: React.FC<TrackCardProps> = ({ track, onSelect, onPlay }) => {
  const placeholderStyle = useMemo(() => {
    if (track.imageUrl) return undefined;
    const seed = (track.title + track.artist).split('').reduce((a,c)=> a + c.charCodeAt(0), 0);
    const hue = seed % 360;
    const hue2 = (hue + 50) % 360;
    return {
      background: `linear-gradient(135deg, hsl(${hue} 70% 35%), hsl(${hue2} 70% 45%))`
    } as React.CSSProperties;
  }, [track.imageUrl, track.title, track.artist]);

  return (
    <div 
      onClick={() => onSelect(track)}
      className="bg-gray-800 rounded-2xl p-7 sm:p-8 lg:p-10 flex flex-col items-center text-center transform hover:scale-[1.03] md:hover:scale-[1.06] transition-transform duration-300 cursor-pointer group relative shadow-xl hover:shadow-purple-700/40 min-h-[420px] sm:min-h-[460px] lg:min-h-[520px] w-full max-w-[340px] md:max-w-[380px] lg:max-w-[420px]"
    >
      <div className="w-full aspect-square rounded-xl mb-5 sm:mb-6 flex items-center justify-center relative overflow-hidden" style={placeholderStyle}>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-[radial-gradient(circle_at_30%_30%,#a855f7,transparent_60%)]" />
        {track.imageUrl ? (
          <img
            src={track.imageUrl}
            alt={`${track.title} cover art`}
            className="w-full h-full object-cover rounded-xl scale-105 group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-white/80">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 18V6l11-3v12M9 18c0 1.1-1.34 2-3 2s-3-.9-3-2 1.34-2 3-2 3 .9 3 2Zm11-3c0 1.1-1.34 2-3 2s-3-.9-3-2 1.34-2 3-2 3 .9 3 2Z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide bg-black/30 px-2 py-1 rounded-md backdrop-blur-sm">No Art</span>
          </div>
        )}
        {onPlay && (
          <button
            onClick={(e) => { e.stopPropagation(); onPlay(track); }}
            aria-label="Play on YouTube"
            className="absolute bottom-3 right-3 bg-purple-600 hover:bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg ring-2 ring-purple-400/40 hover:ring-purple-300 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}
      </div>
  <h3 className="text-xl sm:text-2xl font-extrabold text-white w-full line-clamp-2 leading-tight mb-1 tracking-tight" title={track.title}>{track.title}</h3>
  <p className="text-sm sm:text-base text-gray-300 w-full truncate font-medium" title={track.artist}>{track.artist}</p>
  <p className="text-xs sm:text-sm text-gray-500 w-full truncate italic mb-2 sm:mb-3" title={track.album}>{track.album}</p>
      {track.description && (
        <p className="text-xs sm:text-sm text-gray-400 w-full line-clamp-4 leading-relaxed mb-2 px-0 sm:px-1">
          {track.description}
        </p>
      )}

  {/* Lyrics button removed: unified click opens side panel */}
    </div>
  );
};
