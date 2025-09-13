import React, { useState } from 'react';
import { Track, UserPlaylist } from '../types';

interface AddToPlaylistModalProps {
  track: Track;
  playlists: UserPlaylist[];
  onCreate: (name: string, track: Track) => void;
  onAdd: (playlistId: string, track: Track) => void;
  onClose: () => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ track, playlists, onCreate, onAdd, onClose }) => {
  const [newName, setNewName] = useState('');
  const [mode, setMode] = useState<'select' | 'create'>('select');

  const createDisabled = !newName.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-gray-900/95 border border-gray-700/70 rounded-2xl shadow-2xl p-6 animate-[fadeIn_.25s_ease]">
        <h3 className="text-lg font-semibold text-white mb-1">Add Track to Playlist</h3>
        <p className="text-xs text-gray-400 mb-4 truncate">{track.title} — {track.artist}</p>
        <div className="flex gap-2 mb-4">
          <button onClick={() => setMode('select')} className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${mode==='select' ? 'bg-purple-600/70 border-purple-400 text-white' : 'bg-gray-800/60 border-gray-700 text-gray-300 hover:bg-gray-700/60'}`}>Existing</button>
          <button onClick={() => setMode('create')} className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${mode==='create' ? 'bg-pink-600/70 border-pink-400 text-white' : 'bg-gray-800/60 border-gray-700 text-gray-300 hover:bg-gray-700/60'}`}>New Playlist</button>
        </div>
        {mode === 'select' && (
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
            {playlists.length === 0 && <p className="text-xs text-gray-500 italic">No playlists yet. Create one.</p>}
            {playlists.map(pl => (
              <button key={pl.id} onClick={() => onAdd(pl.id, track)} className="w-full text-left px-4 py-2 rounded-lg bg-gray-800/60 hover:bg-gradient-to-r hover:from-purple-600/70 hover:to-pink-600/70 border border-gray-700/60 hover:border-pink-400/60 text-sm text-gray-200 hover:text-white transition-colors">
                <div className="flex justify-between items-center">
                  <span className="truncate font-medium">{pl.name}</span>
                  <span className="text-[10px] text-gray-400">{pl.tracks.length} tracks</span>
                </div>
              </button>
            ))}
          </div>
        )}
        {mode === 'create' && (
          <form onSubmit={(e) => { e.preventDefault(); if (createDisabled) return; onCreate(newName.trim(), track); setNewName(''); }} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Playlist Name</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Chill Evening" className="w-full px-3 py-2 rounded-md bg-gray-800/70 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-sm text-gray-200" />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setMode('select'); setNewName(''); }} className="px-3 py-1.5 text-xs rounded-md bg-gray-700/60 hover:bg-gray-600/60 text-gray-300 hover:text-white transition-colors">Back</button>
              <button disabled={createDisabled} className="px-4 py-1.5 text-xs rounded-md bg-pink-600/80 hover:bg-pink-500/80 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-colors">Create & Add</button>
            </div>
          </form>
        )}
        <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/60 transition-colors" aria-label="Close add to playlist">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6"/></svg>
        </button>
        <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(4px);} to { opacity:1; transform:translateY(0);} }`}</style>
      </div>
    </div>
  );
};
