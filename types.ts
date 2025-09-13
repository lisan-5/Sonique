// Fix: Define the data structures for the application.
export interface Track {
  title: string;
  artist: string;

  album: string;
  description: string;
  lyrics?: string;
  imageUrl?: string; // optional album art
  videoId?: string; // optional YouTube video id
}

export interface Playlist {
  title: string;
  description: string;
  tracks: Track[];
}

// A saved playlist entry
export interface SavedPlaylist {
  id: string; // unique id (e.g., timestamp or uuid)
  label: string; // user-visible label, default can be mood query or playlist title
  createdAt: number; // epoch ms
  playlist: Playlist;
  sourceQuery?: string; // original mood/query used to generate
}

export interface UserPlaylist {
  id: string;
  name: string;
  createdAt: number;
  tracks: Track[];
}