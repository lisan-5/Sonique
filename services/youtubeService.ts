// Service to resolve a YouTube videoId for a track using YouTube Data API v3
// Falls back to undefined if API key missing or request fails.

import { Track } from '../types';

const ytCache = new Map<string, string | null>();

function keyFor(track: Track) {
  return `${track.title.toLowerCase()}::${track.artist.toLowerCase()}`;
}

export async function fetchYouTubeVideoId(track: Track): Promise<string | undefined> {
  const cacheKey = keyFor(track);
  if (ytCache.has(cacheKey)) {
    const cached = ytCache.get(cacheKey);
    return cached || undefined;
  }
  const apiKey = (import.meta as any).env?.VITE_YT_API_KEY as string | undefined;
  if (!apiKey) {
    ytCache.set(cacheKey, null);
    return undefined; // No key configured
  }
  const q = encodeURIComponent(`${track.title} ${track.artist} official audio`);
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${q}&key=${apiKey}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const id = data?.items?.[0]?.id?.videoId as string | undefined;
    ytCache.set(cacheKey, id || null);
    return id;
  } catch (e) {
    console.warn('YouTube lookup failed', e);
    ytCache.set(cacheKey, null);
    return undefined;
  }
}
