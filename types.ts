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