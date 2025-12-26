/**
 * Player Store
 * Zustand store for managing playback state, queue, and preferences
 * 
 * Features:
 * - Current track and playback state
 * - Queue management (add, remove, reorder, shuffle)
 * - Playback settings (rate, repeat, shuffle)
 * - Persistence via AsyncStorage
 */

import { MediaItem } from '@/data/mock';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type RepeatMode = 'off' | 'all' | 'one';

interface PlayerState {
  // Current playback
  currentTrack: MediaItem | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  playbackRate: number;
  isBuffering: boolean;
  
  // Queue
  queue: MediaItem[];
  queueIndex: number;
  originalQueue: MediaItem[]; // For shuffle restore
  
  // Settings
  repeatMode: RepeatMode;
  isShuffled: boolean;
  volume: number;
  
  // History
  history: MediaItem[];
  
  // Actions - Playback
  setCurrentTrack: (track: MediaItem | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setPlaybackRate: (rate: number) => void;
  setIsBuffering: (isBuffering: boolean) => void;
  
  // Actions - Queue
  setQueue: (queue: MediaItem[]) => void;
  addToQueue: (track: MediaItem) => void;
  addToQueueNext: (track: MediaItem) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  
  // Actions - Navigation
  playNext: () => MediaItem | null;
  playPrevious: () => MediaItem | null;
  skipTo: (index: number) => MediaItem | null;
  
  // Actions - Settings
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
  setVolume: (volume: number) => void;
  
  // Actions - History
  addToHistory: (track: MediaItem) => void;
  clearHistory: () => void;
}

// Helper to shuffle array
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentTrack: null,
      isPlaying: false,
      position: 0,
      duration: 0,
      playbackRate: 1.0,
      isBuffering: false,
      
      queue: [],
      queueIndex: -1,
      originalQueue: [],
      
      repeatMode: 'off',
      isShuffled: false,
      volume: 1.0,
      
      history: [],

      // Playback actions
      setCurrentTrack: (track) => {
        const { addToHistory, currentTrack } = get();
        if (currentTrack && track && currentTrack.id !== track.id) {
          addToHistory(currentTrack);
        }
        set({ currentTrack: track });
      },
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setPosition: (position) => set({ position }),
      setDuration: (duration) => set({ duration }),
      setPlaybackRate: (playbackRate) => set({ playbackRate }),
      setIsBuffering: (isBuffering) => set({ isBuffering }),
      
      // Queue actions
      setQueue: (queue) => set({ 
        queue, 
        originalQueue: queue,
        queueIndex: queue.length > 0 ? 0 : -1,
        isShuffled: false,
      }),
      
      addToQueue: (track) => set((state) => ({ 
        queue: [...state.queue, track],
        originalQueue: [...state.originalQueue, track],
      })),
      
      addToQueueNext: (track) => set((state) => {
        const newQueue = [...state.queue];
        newQueue.splice(state.queueIndex + 1, 0, track);
        return { 
          queue: newQueue,
          originalQueue: [...state.originalQueue, track],
        };
      }),
      
      removeFromQueue: (trackId) => set((state) => {
        const newQueue = state.queue.filter((t) => t.id !== trackId);
        const newOriginalQueue = state.originalQueue.filter((t) => t.id !== trackId);
        let newIndex = state.queueIndex;
        
        // Adjust index if needed
        const removedIndex = state.queue.findIndex((t) => t.id === trackId);
        if (removedIndex !== -1 && removedIndex < state.queueIndex) {
          newIndex = Math.max(0, newIndex - 1);
        }
        
        return { 
          queue: newQueue, 
          originalQueue: newOriginalQueue,
          queueIndex: newIndex,
        };
      }),
      
      clearQueue: () => set({ 
        queue: [], 
        originalQueue: [],
        queueIndex: -1,
        isShuffled: false,
      }),
      
      reorderQueue: (fromIndex, toIndex) => set((state) => {
        const newQueue = [...state.queue];
        const [removed] = newQueue.splice(fromIndex, 1);
        newQueue.splice(toIndex, 0, removed);
        
        let newIndex = state.queueIndex;
        if (fromIndex === state.queueIndex) {
          newIndex = toIndex;
        } else if (fromIndex < state.queueIndex && toIndex >= state.queueIndex) {
          newIndex--;
        } else if (fromIndex > state.queueIndex && toIndex <= state.queueIndex) {
          newIndex++;
        }
        
        return { queue: newQueue, queueIndex: newIndex };
      }),
      
      // Navigation actions
      playNext: () => {
        const { queue, queueIndex, repeatMode, isShuffled } = get();
        
        if (queue.length === 0) return null;
        
        let nextIndex = queueIndex + 1;
        
        if (nextIndex >= queue.length) {
          if (repeatMode === 'all') {
            nextIndex = 0;
          } else {
            return null; // End of queue
          }
        }
        
        const nextTrack = queue[nextIndex];
        set({ queueIndex: nextIndex, currentTrack: nextTrack });
        return nextTrack;
      },
      
      playPrevious: () => {
        const { queue, queueIndex, position, repeatMode } = get();
        
        if (queue.length === 0) return null;
        
        // If more than 3 seconds in, restart current track
        if (position > 3000) {
          set({ position: 0 });
          return get().currentTrack;
        }
        
        let prevIndex = queueIndex - 1;
        
        if (prevIndex < 0) {
          if (repeatMode === 'all') {
            prevIndex = queue.length - 1;
          } else {
            prevIndex = 0; // Stay at first track
          }
        }
        
        const prevTrack = queue[prevIndex];
        set({ queueIndex: prevIndex, currentTrack: prevTrack });
        return prevTrack;
      },
      
      skipTo: (index) => {
        const { queue } = get();
        
        if (index < 0 || index >= queue.length) return null;
        
        const track = queue[index];
        set({ queueIndex: index, currentTrack: track });
        return track;
      },
      
      // Settings actions
      setRepeatMode: (repeatMode) => set({ repeatMode }),
      
      toggleShuffle: () => set((state) => {
        if (state.isShuffled) {
          // Restore original order
          const currentTrack = state.currentTrack;
          const newIndex = currentTrack 
            ? state.originalQueue.findIndex((t) => t.id === currentTrack.id)
            : 0;
          return { 
            queue: state.originalQueue,
            queueIndex: newIndex,
            isShuffled: false,
          };
        } else {
          // Shuffle, keeping current track at current position
          const currentTrack = state.currentTrack;
          const otherTracks = state.queue.filter((t) => t.id !== currentTrack?.id);
          const shuffled = shuffleArray(otherTracks);
          
          if (currentTrack) {
            shuffled.splice(state.queueIndex, 0, currentTrack);
          }
          
          return { 
            queue: shuffled,
            isShuffled: true,
          };
        }
      }),
      
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
      
      // History actions
      addToHistory: (track) => set((state) => {
        const newHistory = [track, ...state.history.filter((t) => t.id !== track.id)];
        return { history: newHistory.slice(0, 50) }; // Keep last 50
      }),
      
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'mediacore-player-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentTrack: state.currentTrack,
        playbackRate: state.playbackRate,
        queue: state.queue,
        originalQueue: state.originalQueue,
        repeatMode: state.repeatMode,
        isShuffled: state.isShuffled,
        volume: state.volume,
        history: state.history.slice(0, 20), // Persist less history
      }),
    }
  )
);
