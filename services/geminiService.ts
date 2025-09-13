// Fix: Implement the Gemini API service to fetch music playlists.
import { GoogleGenAI, Type } from "@google/genai";
import { Playlist, Track } from '../types';

// Lazy client (avoids crashing app if env missing at build time)
let ai: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (ai) return ai;
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) {
    throw new Error("Missing VITE_GEMINI_API_KEY env variable.");
  }
  ai = new GoogleGenAI({ apiKey });
  return ai;
}

const basePlaylistSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'A creative title for the playlist based on the user query.'
    },
    description: {
      type: Type.STRING,
      description: 'A short, evocative description of the playlist\'s mood and theme.'
    },
    tracks: {
      type: Type.ARRAY,
      description: 'A list of 8-10 tracks that fit the described mood.',
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: 'The title of the track.'
          },
          artist: {
            type: Type.STRING,
            description: 'The artist of the track.'
          },
          album: {
            type: Type.STRING,
            description: 'The album the track is from.'
          },
          description: {
            type: Type.STRING,
            description: 'A short (2-3 sentences) and interesting description for the track, explaining why it fits the playlist\'s mood.'
          }
        },
        required: ['title', 'artist', 'album', 'description']
      }
    }
  },
  required: ['title', 'description', 'tracks']
};

/**
 * OPTIMIZATION: This function is designed for a fast initial response.
 * It specifically requests song metadata ONLY and explicitly excludes lyrics
 * to ensure the user gets their playlist as quickly as possible.
 */
interface FindMusicOptions { tracks?: number; fast?: boolean; timeoutMs?: number; }

export const findMusic = async (query: string, options: FindMusicOptions = {}): Promise<Playlist> => {
  try {
    const { tracks = 8, fast = true, timeoutMs = 15000 } = options;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const detailSentence = fast ? 'Keep each description short (1 sentence).' : 'Use 2 vivid sentences per description.';
    const prompt = `Return JSON only. Create a playlist for mood: "${query}". Exactly ${tracks} tracks. Fields: title, description, tracks[title,artist,album,description]. No lyrics. ${detailSentence}`;

    const playlistSchema = fast ? {
      ...basePlaylistSchema,
      properties: {
        ...basePlaylistSchema.properties,
        tracks: {
          ...basePlaylistSchema.properties.tracks,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              artist: { type: Type.STRING },
              album: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ['title','artist','album','description']
          }
        }
      }
    } : basePlaylistSchema;

    const client = getClient();
    let response;
    async function withTimeout<T>(p: Promise<T>): Promise<T> {
      return await Promise.race([
        p,
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs))
      ]);
    }

    try {
      response = await withTimeout(client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }]}],
        config: {
          responseMimeType: "application/json",
          responseSchema: playlistSchema,
        }
      }));
    } catch (err) {
      if ((err as any)?.message === 'TIMEOUT') {
        throw new Error('Playlist generation timed out. Try again with a simpler mood.');
      }
      // fallback model attempt
      response = await withTimeout(client.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }]}],
        config: {
          responseMimeType: "application/json",
          responseSchema: playlistSchema,
        }
      }));
    } finally {
      clearTimeout(timeout);
    }

    const jsonText = response.text.trim();
    if (!jsonText) {
      throw new Error("Received an empty response from the API.");
    }

    const playlistData = JSON.parse(jsonText);
    
    if (!playlistData.tracks || !Array.isArray(playlistData.tracks) || playlistData.tracks.length === 0) {
      throw new Error("API response is missing tracks.");
    }

    return playlistData as Playlist;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
  // Detect invalid API key pattern from backend error body if available
    const raw = (error as any)?.toString?.() || '';
    if (typeof error === 'object' && error && 'message' in (error as any)) {
      const msg = (error as any).message as string;
      if (/API key not valid/i.test(msg) || /API_KEY_INVALID/.test(raw)) {
        throw new Error("API key invalid. Regenerate a Gemini key at AI Studio, set VITE_GEMINI_API_KEY in .env, restart dev server.");
      }
      throw new Error(`Failed to generate playlist: ${msg}`);
    }
    throw new Error("Failed to generate playlist: Unknown error.");
  }
};

/**
 * ON-DEMAND FETCHING: This function is called only when the user requests lyrics for a *single* song.
 * This "lazy-loading" approach prevents fetching all lyrics upfront, which is a major cause of slowness.
 */
export const fetchLyrics = async (track: Track): Promise<string> => {
    try {
        const prompt = `Please provide the full lyrics for the song "${track.title}" by "${track.artist}". Only return the lyrics as plain text.`;

        const client = getClient();
        const response = await client.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: 'user', parts: [{ text: prompt }]}],
        });

        const lyrics = response.text.trim();
        if (!lyrics) {
            return "Lyrics could not be found for this track.";
        }
        return lyrics;
    } catch (error) {
        console.error("Error fetching lyrics from Gemini API:", error);
        if (typeof error === 'object' && error && 'message' in (error as any)) {
          const msg = (error as any).message as string;
          if (/API key not valid/i.test(msg) || /API_KEY_INVALID/.test(msg)) {
            throw new Error("Invalid API key while fetching lyrics.");
          }
          throw new Error(msg);
        }
        throw new Error("Failed to fetch lyrics.");
    }
};