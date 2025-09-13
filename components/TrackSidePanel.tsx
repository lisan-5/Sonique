import React, { useEffect } from 'react';
import { Track } from '../types';

interface TrackSidePanelProps {
  track: Track;
  onClose: () => void;
  isLyricsLoading: boolean;
  isVideoLoading: boolean;
}

export const TrackSidePanel: React.FC<TrackSidePanelProps> = ({ track, onClose, isLyricsLoading, isVideoLoading }) => {
  const query = `${track.title} ${track.artist} official audio`;
  const embedSrc = track.videoId
    ? `https://www.youtube.com/embed/${track.videoId}?autoplay=1&rel=0`
    : `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query)}`;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-2">
      {/* Dim background */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
  <div className="relative w-full sm:w-[95vw] max-w-7xl h-full sm:h-[85vh] md:h-[80vh] bg-gray-900 border border-gray-800 rounded-none sm:rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-[panelIn_.35s_ease]">
        {/* Video / main area */}
  <div className="flex flex-col md:flex-[0.65] md:border-r border-gray-800 min-h-[55vh] md:min-h-0 relative">
          <div className="px-6 py-4 flex items-start justify-between gap-4 border-b border-gray-800">
            <div className="truncate">
              <h2 className="text-2xl font-bold text-white truncate" title={track.title}>{track.title}</h2>
              <p className="text-sm text-gray-400 truncate" title={track.artist}>{track.artist} <span className="text-gray-600">• {track.album}</span></p>
            </div>
            <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-white text-3xl leading-none px-2">&times;</button>
          </div>
          <div className="relative w-full flex-1 flex items-center justify-center bg-black">
            <div className="w-full h-full flex items-center justify-center">
              {isVideoLoading && !track.videoId && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm animate-pulse">Loading video…</div>
              )}
              <iframe
                title={`${track.title} video`}
                src={embedSrc}
                className="w-full h-full max-h-[50vh] md:max-h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
          <div className="px-5 sm:px-6 py-4 border-t border-gray-800 overflow-y-auto max-h-40 md:max-h-44">
            <h3 className="text-xs font-semibold tracking-wide text-gray-400 uppercase mb-2">Description</h3>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{track.description}</p>
          </div>
        </div>
        {/* Desktop lyrics panel (hidden on mobile) */}
        <div className="hidden md:flex flex-col md:flex-[0.35] md:max-h-full border-t md:border-t-0 border-gray-800">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-wide text-gray-300 uppercase">Lyrics {isLyricsLoading && <span className="text-xs text-purple-400 animate-pulse ml-1">loading…</span>}</h3>
          </div>
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4">
            <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed min-h-[120px]">
              {track.lyrics ? track.lyrics : (isLyricsLoading ? '' : 'Lyrics not available.')}
            </div>
          </div>
        </div>

        {/* Mobile bottom sheet for lyrics */}
        <div className="md:hidden absolute left-0 right-0 bottom-0 z-20">
          <div className="relative">
            <input type="checkbox" id="lyrics-toggle" className="peer hidden" />
            <div className="absolute inset-x-0 bottom-0 max-h-[65vh] translate-y-[calc(100%-3rem)] peer-checked:translate-y-0 transition-transform duration-400 ease-out bg-gray-850 bg-gray-900/98 backdrop-blur-xl border-t border-purple-800/40 rounded-t-3xl shadow-[0_-6px_30px_-8px_rgba(168,85,247,0.4)] flex flex-col overflow-hidden">
              <label htmlFor="lyrics-toggle" className="cursor-pointer select-none px-5 pt-3 pb-2 flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-400">Lyrics {isLyricsLoading && <span className="text-[10px] text-purple-400 animate-pulse ml-1">loading…</span>}</span>
                <span className="text-gray-400 text-xs px-2 py-1 rounded-md bg-gray-700/40">{track.artist}</span>
              </label>
              <div className="px-5 pb-5 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700/70 scrollbar-track-transparent">
                <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed pb-10">
                  {track.lyrics ? track.lyrics : (isLyricsLoading ? '' : 'Lyrics not available.')}
                </div>
              </div>
              <button onClick={onClose} className="absolute top-2 right-3 text-gray-400 hover:text-white text-xl" aria-label="Close panel">✕</button>
              <div className="absolute left-1/2 -top-3 -translate-x-1/2 w-16 h-1.5 rounded-full bg-gray-600/60" />
            </div>
          </div>
        </div>
        <style>{`
          @keyframes panelIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </div>
  );
};
