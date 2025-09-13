// Fix: Implement the ResultGrid component to display the playlist.
import React, { useState } from 'react';
import { Playlist, Track } from '../types';
import { TrackCard } from './TrackCard';

interface ResultGridProps {
  playlist: Playlist;
  onTrackSelect: (track: Track) => void;
  onPlay?: (track: Track) => void;
  onAddTrack?: (track: Track) => void;
}

export const ResultGrid: React.FC<ResultGridProps> = ({ playlist, onTrackSelect, onPlay, onAddTrack }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="w-full">
      <div className="mb-6 md:mb-8 px-2 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight text-center">{playlist.title}</h2>
          <button
            type="button"
            onClick={handleCopy}
            className="relative group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600/70 to-pink-600/70 hover:from-purple-500/80 hover:to-pink-500/80 border border-purple-500/40 hover:border-pink-400/60 text-xs sm:text-sm font-semibold text-white transition-all shadow-md hover:shadow-[0_0_0_1px_rgba(236,72,153,0.45),0_4px_18px_-4px_rgba(236,72,153,0.35)] backdrop-blur-sm"
            aria-label="Copy shareable link"
          >
            <span className="absolute inset-0 rounded-xl ring-1 ring-white/10 group-hover:ring-pink-300/30 pointer-events-none" />
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 drop-shadow">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M8 13h8m-5-9h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V9l4-4Z" />
            </svg>
            {copied ? 'Link Copied!' : 'Copy Link'}
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] tracking-wide text-pink-200 opacity-0 group-hover:opacity-80 transition-opacity pointer-events-none">Share this mood</span>
          </button>
        </div>
        <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-3xl mx-auto px-1 md:px-2 text-center">{playlist.description}</p>
      </div>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10 lg:gap-12 justify-items-center">
        {playlist.tracks.map((track, index) => (
          <TrackCard 
            key={`${track.title}-${track.artist}-${index}`} 
            track={track}
            onSelect={onTrackSelect}
            onPlay={onPlay}
            onAdd={onAddTrack}
          />
        ))}
      </div>
    </div>
  );
};
