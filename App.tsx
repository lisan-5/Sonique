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
import { PulseWave } from './components/PulseWave';


// Removed old modal components in favor of unified side panel.

function App() {
  const [query, setQuery] = useState('');
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [isLyricsLoading, setIsLyricsLoading] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [moodHistory, setMoodHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Close history popover with Escape or outside click
  useEffect(() => {
    if (!showHistory) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowHistory(false); };
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-history-popover]') || target.closest('[data-history-trigger]')) return;
      setShowHistory(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onClick);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('mousedown', onClick); };
  }, [showHistory]);

  // Load mood history on mount (no enforced limit now)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('sonique:moodHistory');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setMoodHistory(parsed);
      }
    } catch {}
  }, []);

  const pushMoodHistory = (value: string) => {
    const v = value.trim();
    if (!v) return;
    setMoodHistory(prev => {
      const next = [v, ...prev.filter(p => p.toLowerCase() !== v.toLowerCase())];
      try { localStorage.setItem('sonique:moodHistory', JSON.stringify(next)); } catch {}
      return next;
    });
  };


  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setPlaylist(null);
    pushMoodHistory(searchQuery);

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
  <main className="container mx-auto px-4 pt-8 pb-0">
          <header className="mb-10 flex flex-col items-center gap-3 relative">
            {/* History icon top-right */}
            <div className="absolute top-0 right-0 -mt-2 -mr-1" data-history-trigger>
              <button
                type="button"
                onClick={() => setShowHistory(v => !v)}
                aria-label="Show recent moods"
                className="relative p-2 rounded-xl bg-gray-800/70 hover:bg-gray-700/70 border border-gray-700/60 hover:border-pink-400/60 shadow hover:shadow-[0_0_0_1px_rgba(236,72,153,0.35)] transition-colors group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                  className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3.5 2" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
                {moodHistory.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-[10px] leading-none px-1.5 py-1 rounded-full font-semibold text-white shadow-md">
                    {moodHistory.length > 9 ? '9+' : moodHistory.length}
                  </span>
                )}
              </button>
              {showHistory && (
                <div className="absolute right-0 mt-2 w-60 sm:w-72 max-h-80 overflow-y-auto rounded-xl border border-gray-700/70 bg-gray-900/95 backdrop-blur-xl shadow-xl p-4 z-20 animate-[fadeIn_.25s_ease] text-left" data-history-popover>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Recent Moods</h4>
                    <button
                      onClick={() => { setMoodHistory([]); try { localStorage.removeItem('sonique:moodHistory'); } catch {}; setShowHistory(false); }}
                      className="text-[10px] px-2 py-1 rounded-md bg-gray-700/60 hover:bg-red-600/70 text-gray-300 hover:text-white transition-colors"
                    >Clear</button>
                  </div>
                  {moodHistory.length === 0 && (
                    <p className="text-[11px] text-gray-500 italic">Your recent moods will appear here.</p>
                  )}
                  <ul className="space-y-2">
                    {moodHistory.map((m, i) => (
                      <li key={m+ i}>
                        <button
                          onClick={() => { setQuery(m); handleSearch(m); setShowHistory(false); }}
                          className="group/row w-full text-left rounded-lg px-3 py-2 bg-gray-800/60 hover:bg-gradient-to-r hover:from-purple-600/70 hover:to-pink-600/70 border border-gray-700/60 hover:border-pink-400/60 transition-all text-[12px] leading-snug text-gray-300 hover:text-white shadow-sm"
                        >
                          <span className="block truncate">{m}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setShowHistory(false)}
                      className="text-[11px] tracking-wide px-3 py-1.5 rounded-md bg-gray-700/60 hover:bg-gray-600/70 text-gray-300 hover:text-white transition-colors"
                    >Close</button>
                  </div>
                  <style>{`@keyframes fadeIn { from { opacity:0; transform: translateY(-4px);} to { opacity:1; transform:translateY(0);} }`}</style>
                </div>
              )}
            </div>
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

          <footer className="mt-24 text-center text-sm text-gray-500/70 flex flex-col items-center gap-6">
            <a
              href="https://github.com/lisan-5"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-gray-800/70 hover:bg-gray-700/70 border border-gray-700/60 hover:border-pink-500/50 text-gray-300 hover:text-white transition-colors duration-300 shadow-md hover:shadow-[0_0_0_1px_rgba(236,72,153,0.4),0_4px_18px_-4px_rgba(236,72,153,0.35)] backdrop-blur-sm"
            >
              <span className="text-sm tracking-wide font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-fuchsia-300">Lisanegebriel Abay</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity">
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.1-1.2-1.4-1.2-1.4-1-.7.1-.7.1-.7 1.1.1 1.6 1.2 1.6 1.2 1 .1.7 1.9 2.9 1.4.1-.8.4-1.3.7-1.6-2.5-.3-5.2-1.3-5.2-5.8 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 3-.4c1 0 2 .1 3 .4 2.3-1.5 3.3-1.2 3.3-1.2.6 1.5.2 2.7.1 3 .8.8 1.2 1.9 1.2 3.2 0 4.5-2.7 5.5-5.2 5.8.4.3.8 1 .8 2v3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5Z" />
              </svg>
            </a>
          </footer>
        </main>
        <div className="w-full">
          <PulseWave className="w-full" height={90} />
        </div>
        
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