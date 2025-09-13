// Fix: Implement the main App component to manage state and orchestrate the UI.
import React, { useState, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { ResultGrid } from './components/ResultGrid';
import { LoadingSpinner } from './components/LoadingSpinner';
import { MoodGalaxy } from './components/MoodGalaxy';
import { HomeHero } from './components/HomeHero';
import { findMusic, fetchLyrics } from './services/geminiService';
import { fetchYouTubeVideoId } from './services/youtubeService';
import { enrichTracksWithArt } from './services/albumArtService';
import { TrackSidePanel } from './components/TrackSidePanel';
import { CosmicBackdrop } from './components/CosmicBackdrop';
import { Playlist, Track } from './types';


// Removed old modal components in favor of unified side panel.

function App() {
  const [query, setQuery] = useState('');
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [isLyricsLoading, setIsLyricsLoading] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);


  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setPlaylist(null);

    try {
      const result = await findMusic(searchQuery);
      // Enrich with album art asynchronously; show initial list quickly, then update.
      setPlaylist(result);
      enrichTracksWithArt(result.tracks).then(enriched => {
        setPlaylist(prev => prev ? { ...prev, tracks: enriched } : prev);
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to find music: ${err.message}. Please try again.`);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoodSelect = (mood: string) => {
    setQuery(mood);
    handleSearch(mood);
  };

  const handleExample = (example: string) => {
    setQuery(example);
    handleSearch(example);
  };

  const handleSong = (song: string) => {
    setQuery(song);
    handleSearch(song);
  };
  
  const openTrack = async (track: Track) => {
    setActiveTrack(track);
    const needsLyrics = !track.lyrics;
    const needsVideo = !track.videoId;
    if (!needsLyrics && !needsVideo) return;
    setIsLyricsLoading(needsLyrics);
    setIsVideoLoading(needsVideo);
    try {
      const [lyricsResult, videoId] = await Promise.all([
        needsLyrics ? fetchLyrics(track).catch(() => 'Lyrics not available.') : Promise.resolve(track.lyrics),
        needsVideo ? fetchYouTubeVideoId(track) : Promise.resolve(track.videoId)
      ]);
      setPlaylist(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          tracks: prev.tracks.map(t => {
            if (t.title === track.title && t.artist === track.artist) {
              return { ...t, lyrics: lyricsResult || t.lyrics, videoId: videoId || t.videoId };
            }
            return t;
          })
        };
      });
      setActiveTrack(prev => prev ? { ...prev, lyrics: lyricsResult || prev.lyrics, videoId: videoId || prev.videoId } : prev);
    } finally {
      if (needsLyrics) setIsLyricsLoading(false);
      if (needsVideo) setIsVideoLoading(false);
    }
  };

  const closePanel = () => setActiveTrack(null);

  const goHome = () => {
    setQuery('');
    setPlaylist(null);
    setError(null);
    setActiveTrack(null);
  };


  return (
    <>
      <div className="bg-gray-900 text-white min-h-screen font-sans relative">
        <CosmicBackdrop intensity={1} />
        <main className="container mx-auto px-4 py-8">
          <header className="mb-10 flex flex-col items-center gap-3">
            <button onClick={goHome} aria-label="Go home" className="group focus:outline-none flex items-center gap-4">
              <img src="/Sonique_logo.svg" alt="Sonique logo" className="w-16 h-16 drop-shadow-md group-hover:scale-105 transition-transform" />
              <h1 className="text-5xl font-extrabold tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 group-hover:from-pink-500 group-hover:to-purple-500 transition-colors">
                  Sonique
                </span>
              </h1>
            </button>
            <p className="text-xl text-gray-400">Turn your mood into music.</p>
          </header>

          <SearchBar 
            onSearch={handleSearch} 
            isLoading={isLoading} 
            queryValue={query}
            setQueryValue={setQuery}
          />

          {isLoading && <LoadingSpinner />}
          
          {error && <p className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</p>}

          {!playlist && !isLoading && !error && (
            <>
              <HomeHero 
                onExampleSelect={handleExample} 
                onSongSelect={handleSong} 
                isPlaying={!!activeTrack} 
                condensed={false}
              />
              <MoodGalaxy onMoodSelect={handleMoodSelect} />
            </>
          )}

          {playlist && !isLoading && (
            <ResultGrid 
              playlist={playlist} 
              onTrackSelect={openTrack} 
              onPlay={openTrack} 
            />
          )}

        </main>
      </div>
      {activeTrack && (
        <TrackSidePanel 
          track={activeTrack} 
          onClose={closePanel} 
          isLyricsLoading={isLyricsLoading} 
          isVideoLoading={isVideoLoading} 
        />
      )}
    </>
  );
}

export default App;