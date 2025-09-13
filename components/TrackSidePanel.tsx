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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dim background */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[95vw] max-w-7xl h-[80vh] bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl flex overflow-hidden animate-[panelIn_.35s_ease]">
        {/* Center video area (takes ~65%) */}
        <div className="flex flex-col flex-[0.65] border-r border-gray-800">
          <div className="px-6 py-4 flex items-start justify-between gap-4 border-b border-gray-800">
            <div className="truncate">
              <h2 className="text-2xl font-bold text-white truncate" title={track.title}>{track.title}</h2>
              <p className="text-sm text-gray-400 truncate" title={track.artist}>{track.artist} <span className="text-gray-600">• {track.album}</span></p>
            </div>
            <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-white text-3xl leading-none px-2">&times;</button>
          </div>
          <div className="relative w-full flex-1 flex items-center justify-center bg-black">
            <div className="w-full h-full">
              {isVideoLoading && !track.videoId && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm animate-pulse">Loading video…</div>
              )}
              <iframe
                title={`${track.title} video`}
                src={embedSrc}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
          <div className="px-6 py-5 border-t border-gray-800 overflow-y-auto max-h-40">
            <h3 className="text-xs font-semibold tracking-wide text-gray-400 uppercase mb-2">Description</h3>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{track.description}</p>
          </div>
        </div>
        {/* Right lyrics panel */}
        <div className="flex flex-col flex-[0.35]">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-wide text-gray-300 uppercase">Lyrics {isLyricsLoading && <span className="text-xs text-purple-400 animate-pulse ml-1">loading…</span>}</h3>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed min-h-[120px]">
              {track.lyrics ? track.lyrics : (isLyricsLoading ? '' : 'Lyrics not available.')}
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
