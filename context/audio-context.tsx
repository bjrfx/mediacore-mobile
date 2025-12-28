import { MediaItem } from '@/data/mock';
import { usePlayerStore } from '@/store/player-store';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import React, { createContext, useContext, useEffect, useRef } from 'react';

interface AudioContextType {
  togglePlay: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setRate: (rate: number) => Promise<void>;
  playTrack: (track: MediaItem) => Promise<void>;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function useAudioContext() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const isSyncingRef = useRef(false); // Flag to prevent infinite loops or race conditions
  
  // Selectors to avoid unnecessary re-renders
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const playbackRate = usePlayerStore((state) => state.playbackRate);
  
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
  const setPosition = usePlayerStore((state) => state.setPosition);
  const setDuration = usePlayerStore((state) => state.setDuration);
  const setIsBuffering = usePlayerStore((state) => state.setIsBuffering);
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);

  // Initialize Audio Mode
  useEffect(() => {
    async function setupAudio() {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true, 
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          shouldDuckAndroid: true,
        });
      } catch (e) {
        console.error('Failed to setup audio mode', e);
      }
    }
    setupAudio();
    
    // Cleanup on unmount
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Handle Track Changes
  useEffect(() => {
    async function loadTrack() {
      if (!currentTrack?.audioUrl) return;
      
      // Unload previous
      if (soundRef.current) {
        try {
            await soundRef.current.unloadAsync();
        } catch (e) {
            console.log('Error unloading previous sound', e);
        }
        soundRef.current = null;
      }

      // If video, let PlayerScreen handle playback via Video component
      if (currentTrack.type === 'video') {
        setIsBuffering(false);
        return;
      }

      try {
        setIsBuffering(true);
        const { sound, status } = await Audio.Sound.createAsync(
          { uri: currentTrack.audioUrl },
          { shouldPlay: isPlaying, rate: playbackRate }, // Auto-play if isPlaying is true
          onPlaybackStatusUpdate
        );
        soundRef.current = sound;
        
        // Ensure frequent progress updates and reliable callback registration
        try {
          await sound.setProgressUpdateIntervalAsync(250);
          sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
        } catch (e) {
          console.log('Error configuring progress updates', e);
        }
        
        if (status.isLoaded) {
           setDuration(status.durationMillis || 0);
        } else if (status.error) {
           console.error('Error loading sound status:', status.error);
           setIsPlaying(false);
        }
        setIsBuffering(false);
      } catch (error) {
        console.error('Error loading sound', error);
        setIsBuffering(false);
        setIsPlaying(false);
      }
    }

    if (currentTrack) {
        if (loadedTrackIdRef.current !== currentTrack.id) {
            loadedTrackIdRef.current = currentTrack.id;
            loadTrack();
        }
    } else {
        if (soundRef.current) {
            soundRef.current.unloadAsync();
            soundRef.current = null;
            loadedTrackIdRef.current = null;
        }
    }
  }, [currentTrack?.id]); 

  const loadedTrackIdRef = useRef<string | null>(null);

  // Handle Playback Rate Changes
  useEffect(() => {
      async function updateRate() {
        if (soundRef.current) {
            try {
                const status = await soundRef.current.getStatusAsync();
                if (status.isLoaded) {
                    await soundRef.current.setRateAsync(playbackRate, true);
                }
            } catch (e) {
                console.log('Error setting playback rate', e);
            }
        }
      }
      updateRate();
  }, [playbackRate]);

  // Handle Play/Pause Sync
  useEffect(() => {
    async function syncPlayState() {
        if (isSyncingRef.current) return;
        if (!soundRef.current) return;
        
        try {
            const status = await soundRef.current.getStatusAsync();
            if (!status.isLoaded) return;

            if (isPlaying && !status.isPlaying) {
                await soundRef.current.playAsync();
            } else if (!isPlaying && status.isPlaying) {
                await soundRef.current.pauseAsync();
            }
        } catch (e) {
            console.log('Error syncing play state', e);
        }
    }
    syncPlayState();
  }, [isPlaying]);

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsBuffering(status.isBuffering);
      
      // Sync playing state if changed externally
      if (!status.isBuffering && status.isPlaying !== isPlaying) {
          // Avoid triggering sync loop
          isSyncingRef.current = true;
          setIsPlaying(status.isPlaying);
          // Allow loop check again after next tick
          setTimeout(() => { isSyncingRef.current = false; }, 0);
      }
      
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
    } else if (status.error) {
      console.error(`Player Error: ${status.error}`);
    }
  };

  // Public Methods
  const togglePlay = async () => {
    if (!soundRef.current) return;
    try {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
            if (status.isPlaying) {
                await soundRef.current.pauseAsync();
                setIsPlaying(false);
            } else {
                await soundRef.current.playAsync();
                setIsPlaying(true);
            }
        }
    } catch (e) {
        console.error('Error toggling play', e);
    }
  };

  const seekTo = async (position: number) => {
    if (!soundRef.current) return;
    try {
        await soundRef.current.setPositionAsync(position);
        setPosition(position); 
    } catch (e) {
        console.error('Error seeking', e);
    }
  };

  const setRate = async (rate: number) => {
      // Direct store update triggers effect
      if (soundRef.current) {
          try {
              const status = await soundRef.current.getStatusAsync();
              if (status.isLoaded) {
                 await soundRef.current.setRateAsync(rate, true);
              }
          } catch (e) {
              console.error('Error setting rate', e);
          }
      }
  };

  const playTrack = async (track: MediaItem) => {
      setCurrentTrack(track);
      setIsPlaying(true);
  };

  return (
    <AudioContext.Provider value={{ togglePlay, seekTo, setRate, playTrack }}>
      {children}
    </AudioContext.Provider>
  );
}
