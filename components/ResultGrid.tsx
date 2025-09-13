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
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-2">{playlist.title}</h2>
        <p className="text-lg text-gray-400">{playlist.description}</p>
      </div>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
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