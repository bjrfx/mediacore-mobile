import { MediaItem } from '@/data/mock';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface LibraryState {
  likedSongs: MediaItem[];
  toggleLike: (item: MediaItem) => void;
  isLiked: (id: string) => boolean;
  addToLibrary: (item: MediaItem) => void;
  removeFromLibrary: (id: string) => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      likedSongs: [],
      
      toggleLike: (item) => {
        const { likedSongs } = get();
        const exists = likedSongs.some((i) => i.id === item.id);
        
        if (exists) {
          set({ likedSongs: likedSongs.filter((i) => i.id !== item.id) });
        } else {
          set({ likedSongs: [item, ...likedSongs] });
        }
      },
      
      isLiked: (id) => {
        return get().likedSongs.some((item) => item.id === id);
      },
      
      addToLibrary: (item) => {
        const { likedSongs } = get();
        if (!likedSongs.some((i) => i.id === item.id)) {
          set({ likedSongs: [item, ...likedSongs] });
        }
      },
      
      removeFromLibrary: (id) => {
        set({ likedSongs: get().likedSongs.filter((item) => item.id !== id) });
      },
    }),
    {
      name: 'library-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
