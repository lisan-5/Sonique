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
import { Playlist, Track, UserPlaylist } from './types';
import { PulseWave } from './components/PulseWave';
import { AddToPlaylistModal } from './components/AddToPlaylistModal';
import { Logo } from './components/Logo';
import { BackgroundPulse } from './components/BackgroundPulse';
import { GlobalVagueBackground } from './components/GlobalVagueBackground';


// Removed old modal components in favor of unified side panel.

function App() {
  const [query, setQuery] = useState('');
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [isLyricsLoading, setIsLyricsLoading] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  interface MoodHistoryEntry { value: string; pinned: boolean; addedAt: number }
  const [moodHistory, setMoodHistory] = useState<MoodHistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState<UserPlaylist[]>([]);
  const [trackToAdd, setTrackToAdd] = useState<Track | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPlaylistsPanel, setShowPlaylistsPanel] = useState(false);
  const [viewingUserPlaylistId, setViewingUserPlaylistId] = useState<string | null>(null);

  // Close popovers/panels (history, playlists) with Escape or outside click
  useEffect(() => {
    if (!showHistory && !showPlaylistsPanel) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setShowHistory(false); setShowPlaylistsPanel(false); } };
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('[data-history-popover]') ||
        target.closest('[data-history-trigger]') ||
        target.closest('[data-playlists-panel]') ||
        target.closest('[data-playlists-trigger]')
      ) return;
      setShowHistory(false); setShowPlaylistsPanel(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onClick);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('mousedown', onClick); };
  }, [showHistory, showPlaylistsPanel]);

  // Load mood history on mount (migrate from simple string[] to object[])
  useEffect(() => {
    try {
      const raw = localStorage.getItem('sonique:moodHistory');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) return;
        if (typeof parsed[0] === 'string') {
          const migrated: MoodHistoryEntry[] = parsed.map((v: string) => ({ value: v, pinned: false, addedAt: Date.now() }));
          setMoodHistory(migrated);
          try { localStorage.setItem('sonique:moodHistory', JSON.stringify(migrated)); } catch {}
        } else if (parsed[0] && typeof parsed[0] === 'object' && 'value' in parsed[0]) {
          setMoodHistory(parsed as MoodHistoryEntry[]);
        }
      }
    } catch {}
  }, []);

  // Load user playlists
  useEffect(() => {
    try {
      const raw = localStorage.getItem('sonique:userPlaylists');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setUserPlaylists(parsed);
      }
    } catch {}
  }, []);

  const persistUserPlaylists = (data: UserPlaylist[]) => {
    try { localStorage.setItem('sonique:userPlaylists', JSON.stringify(data)); } catch {}
  };


  const persistMoodHistory = (data: MoodHistoryEntry[]) => {
    try { localStorage.setItem('sonique:moodHistory', JSON.stringify(data)); } catch {}
  };

  const pushMoodHistory = (value: string) => {
    const v = value.trim();
    if (!v) return;
    setMoodHistory(prev => {
      const existing = prev.find(p => p.value.toLowerCase() === v.toLowerCase());
      const entry: MoodHistoryEntry = existing ? { ...existing, addedAt: Date.now() } : { value: v, pinned: false, addedAt: Date.now() };
      const next = [entry, ...prev.filter(p => p.value.toLowerCase() !== v.toLowerCase())];
      persistMoodHistory(next);
      return next;
    });
  };

  const togglePinMood = (value: string) => {
    setMoodHistory(prev => {
      const next = prev.map(e => e.value.toLowerCase() === value.toLowerCase() ? { ...e, pinned: !e.pinned } : e);
      persistMoodHistory(next);
      return next;
    });
  };

  const clearUnpinnedHistory = () => {
    setMoodHistory(prev => {
      const kept = prev.filter(e => e.pinned);
      if (kept.length === 0) {
        try { localStorage.removeItem('sonique:moodHistory'); } catch {}
        return [];
      }
      persistMoodHistory(kept);
      return kept;
    });
    setShowHistory(false);
  };



  const handleSearch = async (searchQuery: string, opts?: { skipHistory?: boolean; ts?: string }) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);
    setPlaylist(null);
    if (!opts?.skipHistory) pushMoodHistory(trimmed);

    // Update URL to make session shareable (?mood=...&ts=...)
    try {
      const encodedMood = encodeURIComponent(trimmed).replace(/%20/g, '+');
      const ts = opts?.ts || Date.now().toString();
      const params = new URLSearchParams(window.location.search);
      params.set('mood', encodedMood);
      params.set('ts', ts);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, '', newUrl);
    } catch {}

    try {
      const result = await findMusic(trimmed);
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
    // Remove sharable params from URL
    try { window.history.replaceState(null, '', window.location.pathname); } catch {}
  };

  // On initial mount, parse ?mood= & ?ts= to auto-load shared session
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const moodParam = params.get('mood');
      if (moodParam) {
        const decodedMood = decodeURIComponent(moodParam.replace(/\+/g, ' '));
        const ts = params.get('ts') || Date.now().toString();
        setQuery(decodedMood);
        // Skip history push to avoid duplicate if already in list
        handleSearch(decodedMood, { skipHistory: true, ts });
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // User playlists operations
  const createUserPlaylist = (name: string, firstTrack: Track) => {
    const pl: UserPlaylist = { id: Date.now().toString(36)+Math.random().toString(36).slice(2,8), name, createdAt: Date.now(), tracks: [firstTrack] };
    setUserPlaylists(prev => { const next = [pl, ...prev]; persistUserPlaylists(next); return next; });
    setShowAddModal(false); setTrackToAdd(null);
  };

  const addTrackToExisting = (playlistId: string, track: Track) => {
    setUserPlaylists(prev => {
      const next = prev.map(p => p.id === playlistId ? { ...p, tracks: p.tracks.some(t => t.title===track.title && t.artist===track.artist) ? p.tracks : [track, ...p.tracks] } : p);
      persistUserPlaylists(next);
      return next;
    });
    setShowAddModal(false); setTrackToAdd(null);
  };

  const removeTrackFromUser = (playlistId: string, track: Track) => {
    setUserPlaylists(prev => { const next = prev.map(p => p.id===playlistId ? { ...p, tracks: p.tracks.filter(t => !(t.title===track.title && t.artist===track.artist)) } : p); persistUserPlaylists(next); return next; });
  };

  const deleteUserPlaylist = (playlistId: string) => {
    setUserPlaylists(prev => { const next = prev.filter(p => p.id !== playlistId); persistUserPlaylists(next); return next; });
  };


  const openUserPlaylist = (id: string) => {
    const pl = userPlaylists.find(p => p.id === id);
    if (!pl) return;
    setViewingUserPlaylistId(id);
    setPlaylist({ title: pl.name, description: `Custom playlist • ${pl.tracks.length} tracks`, tracks: pl.tracks });
    setShowPlaylistsPanel(false);
    window.scrollTo({ top:0, behavior:'smooth' });
  };

  // Keep displayed user playlist in sync when tracks change
  useEffect(() => {
    if (!viewingUserPlaylistId) return;
    const pl = userPlaylists.find(p => p.id === viewingUserPlaylistId);
    if (!pl) return;
    setPlaylist({ title: pl.name, description: `Custom playlist • ${pl.tracks.length} tracks`, tracks: pl.tracks });
  }, [userPlaylists, viewingUserPlaylistId]);

  const compactBrand = !!playlist || isLoading; // shrink & move logo when user is in results/loading state

  return (
    <>
      <div className="bg-gray-900 text-white min-h-screen font-sans relative overflow-hidden">
        <GlobalVagueBackground />
        <CosmicBackdrop intensity={1} />
        <BackgroundPulse intensity={0.9} />
  <main className="container mx-auto px-4 pt-8 pb-0">
          <header className={`relative ${compactBrand ? 'mb-6 flex items-center gap-3 justify-start min-h-[72px]' : 'mb-10 flex flex-col items-center gap-3'}`}>
            {/* Icons top-right: history + playlists */}
            <div className="absolute top-0 right-0 -mt-2 -mr-1 flex items-start gap-2">
              <div data-history-trigger>
                <button
                  type="button"
                  onClick={() => { setShowHistory(v => !v); setShowPlaylistsPanel(false); }}
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
                  <div className="absolute right-0 mt-2 w-60 sm:w-72 max-h-80 overflow-y-auto rounded-xl border border-gray-700/70 bg-gray-900/95 backdrop-blur-xl shadow-xl p-4 z-30 animate-[fadeIn_.25s_ease] text-left" data-history-popover>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Recent Moods</h4>
                      <button
                        onClick={clearUnpinnedHistory}
                        className="text-[10px] px-2 py-1 rounded-md bg-gray-700/60 hover:bg-red-600/70 text-gray-300 hover:text-white transition-colors"
                        title="Clears only unpinned moods"
                      >Clear</button>
                    </div>
                    {moodHistory.length === 0 && (
                      <p className="text-[11px] text-gray-500 italic">Your recent moods will appear here.</p>
                    )}
                    <ul className="space-y-2">
                      {moodHistory.map((m, i) => (
                        <li key={m.value + i} className="group flex items-stretch">
                          <button
                            onClick={() => { setQuery(m.value); handleSearch(m.value); setShowHistory(false); }}
                            className="flex-1 text-left rounded-l-lg px-3 py-2 bg-gray-800/60 hover:bg-gradient-to-r hover:from-purple-600/70 hover:to-pink-600/70 border border-r-0 border-gray-700/60 hover:border-pink-400/60 transition-all text-[12px] leading-snug text-gray-300 hover:text-white shadow-sm"
                          >
                            <span className="block truncate">{m.value}</span>
                          </button>
                          <button
                            onClick={() => togglePinMood(m.value)}
                            aria-label={m.pinned ? 'Unpin mood' : 'Pin mood'}
                            className={`px-2 py-2 rounded-r-lg border border-l-0 border-gray-700/60 transition-all text-[12px] flex items-center justify-center ${m.pinned ? 'bg-pink-600/80 text-white hover:bg-pink-500/80 border-pink-400/60' : 'bg-gray-800/60 text-gray-300 hover:text-white hover:bg-gray-700/60 hover:border-pink-300/50'}`}
                            title={m.pinned ? 'Unpin' : 'Pin'}
                          >
                            {m.pinned ? (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M9.7 2.3a1 1 0 0 1 1 .2l2.8 2.8 2-.7a1 1 0 0 1 1 .3l1.9 1.9a1 1 0 0 1-.3 1l-.7 2 2.8 2.8a1 1 0 0 1 0 1.4l-3.2 3.2a1 1 0 0 1-1.4 0l-2.8-2.8-2 .7a1 1 0 0 1-1-.3l-1.9-1.9a1 1 0 0 1-.3-1l.7-2L6 9.5a1 1 0 0 1 0-1.4l3.2-3.2a1 1 0 0 1 .5-.3Z"/></svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9.5 2.5 14 7l3-1 2 2-1 3 4.5 4.5-3 3L15 14.9l-3 1-2-2 1-3L6.6 6.5l2.9-2.9Z"/></svg>
                            )}
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
              <div data-playlists-trigger>
                <button
                  type="button"
                  onClick={() => { setShowPlaylistsPanel(v => !v); setShowHistory(false); }}
                  aria-label="Show your playlists"
                  className="relative p-2 rounded-xl bg-gray-800/70 hover:bg-gray-700/70 border border-gray-700/60 hover:border-purple-400/60 shadow hover:shadow-[0_0_0_1px_rgba(168,85,247,0.35)] transition-colors group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h12M4 12h10M4 18h8M17 6h3M17 12h3M17 18h3" />
                  </svg>
                  {userPlaylists.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-purple-600 text-[10px] leading-none px-1.5 py-1 rounded-full font-semibold text-white shadow-md">
                      {userPlaylists.length > 9 ? '9+' : userPlaylists.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
            {!compactBrand && (
              <>
                <button onClick={goHome} aria-label="Go home" className="group focus:outline-none flex items-center gap-4">
                  <Logo size={72} className="transition-transform group-hover:scale-105" />
                  <h1 className="text-5xl font-extrabold tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 group-hover:from-pink-500 group-hover:to-purple-500 transition-colors">
                      Sonique
                    </span>
                  </h1>
                </button>
                <p className="text-xl text-gray-400">Turn your mood into music.</p>
              </>
            )}
            {compactBrand && (
              <button onClick={goHome} aria-label="Go home" className="group focus:outline-none inline-flex items-center gap-2 pr-28">
                <Logo size={44} className="transition-transform group-hover:scale-110" />
                <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 group-hover:from-pink-500 group-hover:to-purple-400 transition-colors">Sonique</span>
              </button>
            )}
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
                onAddTrack={(t) => { setTrackToAdd(t); setShowAddModal(true); }}
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

      {showPlaylistsPanel && (
        <div className="fixed left-0 top-0 h-full w-[460px] max-w-[92%] md:max-w-[72%] lg:max-w-[520px] z-50 bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/60 shadow-2xl animate-[slideIn_.3s_ease] flex flex-col" data-playlists-panel>
          <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-wide text-gray-300">Your Playlists</h3>
            <button onClick={() => setShowPlaylistsPanel(false)} className="p-1 rounded-md hover:bg-gray-700/60 text-gray-400 hover:text-white transition-colors" aria-label="Close playlists">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6"/></svg>
            </button>
          </div>
          <div className="p-5 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
            {userPlaylists.length === 0 && (
              <p className="text-xs text-gray-500 italic">No custom playlists yet. Use the + on a track.</p>
            )}
            {userPlaylists.map(pl => (
              <div key={pl.id} className="group border border-gray-700/60 rounded-xl p-4 bg-gray-800/40 hover:border-pink-400/60 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <button onClick={() => openUserPlaylist(pl.id)} className="text-left text-sm font-medium text-gray-200 group-hover:text-white truncate w-full">
                      {pl.name}
                    </button>
                    <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-2">
                      <span>{pl.tracks.length} tracks</span>
                      <span className="opacity-60">• {new Date(pl.createdAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                  <button onClick={() => deleteUserPlaylist(pl.id)} className="px-2 py-1 rounded-md bg-gray-700/60 hover:bg-red-600/70 text-[11px] text-gray-300 hover:text-white transition-colors">Delete</button>
                </div>
                {pl.tracks.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 max-h-24 overflow-hidden">
                    {pl.tracks.slice(0,10).map(t => (
                      <span key={t.title + t.artist} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-300 truncate max-w-[140px]">{t.title}</span>
                    ))}
                    {pl.tracks.length > 10 && <span className="text-[10px] text-gray-500">+{pl.tracks.length - 10} more</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-gray-700/50 text-right text-[10px] text-gray-500">Total: {userPlaylists.length}</div>
          <style>{`@keyframes slideIn { from { transform: translateX(-15px); opacity:0;} to { transform: translateX(0); opacity:1;} }`}</style>
        </div>
      )}

      {showAddModal && trackToAdd && (
        <AddToPlaylistModal
          track={trackToAdd}
          playlists={userPlaylists}
          onCreate={createUserPlaylist}
          onAdd={addTrackToExisting}
          onClose={() => { setShowAddModal(false); setTrackToAdd(null); }}
        />
      )}
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