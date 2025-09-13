import React, { useEffect } from 'react';
import { Track } from '../types';

interface YouTubePlayerModalProps {
  track: Track;
  onClose: () => void;
  videoId?: string;
  pending: boolean;
  fallbackQuery: string;
}

export const YouTubePlayerModal: React.FC<YouTubePlayerModalProps> = ({ track, onClose, videoId, pending, fallbackQuery }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const embedSrc = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    : `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(fallbackQuery)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-4xl aspect-video relative overflow-hidden" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-4 text-gray-300 hover:text-white text-3xl" aria-label="Close">&times;</button>
        <div className="absolute top-3 left-4 text-sm text-gray-300 font-medium pr-10 line-clamp-1">
          {track.title} <span className="text-gray-500">— {track.artist}</span>
        </div>
        {pending && !videoId && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-400 animate-pulse">Resolving video…</p>
          </div>
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
  );
};
