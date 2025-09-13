// Simple album art fetcher using iTunes Search API (public, no key required)
// Provides basic in-memory caching for session.

import { Track } from '../types';

const cache = new Map<string, string>();

function buildKey(title: string, artist: string) {
  return `${title.toLowerCase()}::${artist.toLowerCase()}`;
}

export async function fetchAlbumArt(title: string, artist: string): Promise<string | undefined> {
  const key = buildKey(title, artist);
  if (cache.has(key)) return cache.get(key);

  const query = encodeURIComponent(`${title} ${artist}`);
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
    if (!res.ok) return undefined;
    const data = await res.json();
    const artwork = data?.results?.[0]?.artworkUrl100 as string | undefined;
    if (artwork) {
      // Replace 100x100 with 300x300 for better quality if available
      const hiRes = artwork.replace(/100x100bb\.jpg/, '300x300bb.jpg');
      cache.set(key, hiRes);
      return hiRes;
    }
  } catch (e) {
    console.warn('Album art fetch failed', e);
  }
  return undefined;
}

export async function enrichTracksWithArt(tracks: Track[]): Promise<Track[]> {
  return Promise.all(tracks.map(async t => {
    const imageUrl = await fetchAlbumArt(t.title, t.artist);
    if (imageUrl) return { ...t, imageUrl };
    // deterministic gradient placeholder seed stored as pseudo URL string for potential caching
    const seed = (t.title + t.artist).split('').reduce((a,c)=> a + c.charCodeAt(0), 0);
    const hue = seed % 360;
    const hue2 = (hue + 50) % 360;
    const placeholder = `gradient:hsl(${hue} 70% 35%)_hsl(${hue2} 70% 45%)`;
    return { ...t, imageUrl: undefined, // keep undefined so TrackCard uses generated style
      // could attach metadata later if needed
      _placeholder: placeholder } as any;
  }));
}
