// Fix: Implement the ResultGrid component to display the playlist.
import React from 'react';
import { Playlist, Track } from '../types';
import { TrackCard } from './TrackCard';

interface ResultGridProps {
  playlist: Playlist;
  onTrackSelect: (track: Track) => void;
  onPlay?: (track: Track) => void;
}

export const ResultGrid: React.FC<ResultGridProps> = ({ playlist, onTrackSelect, onPlay }) => {
  return (
    <div className="w-full">
      <div className="text-center mb-6 md:mb-8 px-2">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2 leading-tight tracking-tight">{playlist.title}</h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-3xl mx-auto px-1 md:px-2">{playlist.description}</p>
      </div>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 xl:gap-10">
        {playlist.tracks.map((track, index) => (
          <TrackCard 
            key={`${track.title}-${track.artist}-${index}`} 
            track={track}
            onSelect={onTrackSelect}
            onPlay={onPlay}
          />
        ))}
      </div>
    </div>
  );
};
