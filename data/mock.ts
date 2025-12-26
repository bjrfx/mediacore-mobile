/**
 * Media Data Models and Mock Data
 * Extended to support rich media playback
 */

export interface MediaItem {
  id: string;
  title: string;
  artist: string;
  album?: string;
  coverUrl: string;
  duration: string;       // Formatted duration (e.g., "4:03")
  durationMs?: number;    // Duration in milliseconds
  type: 'audio' | 'video';
  category: string;
  audioUrl: string;       // Primary media URL (audio or video)
  videoUrl?: string;      // Optional separate video URL
  isLive?: boolean;       // Live stream indicator
  isExplicit?: boolean;   // Explicit content flag
  releaseDate?: string;   // ISO date string
  
  // HLS/Streaming
  streamType?: 'file' | 'hls' | 'dash';
  qualities?: MediaQuality[];
  
  // Additional metadata
  genre?: string;
  bpm?: number;
  key?: string;
  
  // Captions/Subtitles
  captions?: CaptionTrack[];
}

export interface MediaQuality {
  label: string;          // "1080p", "720p", "480p", "Audio Only"
  url: string;
  bitrate?: number;
}

export interface CaptionTrack {
  language: string;       // "en", "es", etc.
  label: string;          // "English", "Spanish"
  url: string;            // VTT file URL
  isDefault?: boolean;
}

export const MOCK_DATA: MediaItem[] = [
  {
    id: '1',
    title: 'Midnight City',
    artist: 'M83',
    album: 'Hurry Up, We\'re Dreaming',
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&auto=format&fit=crop&q=60',
    duration: '4:03',
    durationMs: 243000,
    type: 'audio',
    category: 'Electronic',
    genre: 'Synthwave',
    audioUrl: 'https://samplelib.com/lib/preview/mp3/sample-15s.mp3',
    streamType: 'file',
    releaseDate: '2011-10-17',
  },
  {
    id: '2',
    title: 'Ocean Drive',
    artist: 'Duke Dumont',
    album: 'Blasé Boys Club, Pt. 1',
    coverUrl: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&auto=format&fit=crop&q=60',
    duration: '3:25',
    durationMs: 205000,
    type: 'audio',
    category: 'House',
    genre: 'Deep House',
    audioUrl: 'https://samplelib.com/lib/preview/mp3/sample-6s.mp3',
    streamType: 'file',
    releaseDate: '2015-08-14',
  },
  {
    id: '3',
    title: 'Mountain Echoes',
    artist: 'Nature Sounds',
    album: 'Ambient Collection',
    coverUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=60',
    duration: '15:00',
    durationMs: 900000,
    type: 'audio',
    category: 'Ambient',
    genre: 'Nature',
    audioUrl: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3',
    streamType: 'file',
    releaseDate: '2023-03-01',
  },
  {
    id: '4',
    title: 'Urban Exploration',
    artist: 'City Life',
    album: 'Street Stories',
    coverUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&auto=format&fit=crop&q=60',
    duration: '8:45',
    durationMs: 525000,
    type: 'video',
    category: 'Documentary',
    genre: 'Documentary',
    audioUrl: 'https://samplelib.com/lib/preview/mp3/sample-15s.mp3',
    streamType: 'file',
    releaseDate: '2024-01-15',
    qualities: [
      { label: '1080p', url: 'https://example.com/video-1080.mp4', bitrate: 5000 },
      { label: '720p', url: 'https://example.com/video-720.mp4', bitrate: 2500 },
      { label: '480p', url: 'https://example.com/video-480.mp4', bitrate: 1000 },
    ],
    captions: [
      { language: 'en', label: 'English', url: 'https://example.com/captions-en.vtt', isDefault: true },
    ],
  },
  {
    id: '5',
    title: 'Jazz Cafe',
    artist: 'Smooth Trio',
    album: 'Late Night Sessions',
    coverUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&auto=format&fit=crop&q=60',
    duration: '5:30',
    durationMs: 330000,
    type: 'audio',
    category: 'Jazz',
    genre: 'Smooth Jazz',
    audioUrl: 'https://samplelib.com/lib/preview/mp3/sample-6s.mp3',
    streamType: 'file',
    releaseDate: '2022-09-22',
  },
  {
    id: '6',
    title: 'Abstract Thoughts',
    artist: 'Modern Art',
    album: 'Visual Poetry',
    coverUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=60',
    duration: '12:10',
    durationMs: 730000,
    type: 'video',
    category: 'Art',
    genre: 'Visual Art',
    audioUrl: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3',
    streamType: 'file',
    releaseDate: '2024-06-10',
    qualities: [
      { label: '4K', url: 'https://example.com/video-4k.mp4', bitrate: 15000 },
      { label: '1080p', url: 'https://example.com/video-1080.mp4', bitrate: 5000 },
    ],
  },
  {
    id: '7',
    title: 'Neon Nights',
    artist: 'Synthwave Dreams',
    album: 'Retrowave',
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=60',
    duration: '4:45',
    durationMs: 285000,
    type: 'audio',
    category: 'Electronic',
    genre: 'Retrowave',
    audioUrl: 'https://samplelib.com/lib/preview/mp3/sample-15s.mp3',
    streamType: 'file',
    releaseDate: '2024-12-01',
    isExplicit: false,
  },
  {
    id: '8',
    title: 'Acoustic Morning',
    artist: 'Indie Folk Band',
    album: 'Sunrise Sessions',
    coverUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&auto=format&fit=crop&q=60',
    duration: '3:52',
    durationMs: 232000,
    type: 'audio',
    category: 'Rock',
    genre: 'Indie Folk',
    audioUrl: 'https://samplelib.com/lib/preview/mp3/sample-6s.mp3',
    streamType: 'file',
    releaseDate: '2024-11-20',
  },
];

export const CATEGORIES = [
  'All',
  'Electronic',
  'House',
  'Ambient',
  'Documentary',
  'Jazz',
  'Art',
  'Rock',
  'Pop',
  'Classical',
  'Hip Hop',
  'R&B',
  'Country',
  'Metal',
];

// Genre colors for UI
export const GENRE_COLORS: Record<string, string> = {
  Electronic: '#8B5CF6',
  House: '#EC4899',
  Ambient: '#06B6D4',
  Documentary: '#F59E0B',
  Jazz: '#10B981',
  Art: '#EF4444',
  Rock: '#F97316',
  Pop: '#D946EF',
  Classical: '#6366F1',
  'Hip Hop': '#84CC16',
  'R&B': '#14B8A6',
  Country: '#F59E0B',
  Metal: '#64748B',
};
