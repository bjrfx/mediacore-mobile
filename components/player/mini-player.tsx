/**
 * Enhanced Mini Player
 * Inspired by: Spotify's expandable player, Apple Music's blur effects
 * 
 * Features:
 * - Glassmorphic design with blur
 * - Smooth progress indicator
 * - Gesture support for expanding
 * - Animated transitions
 */

import { BrandColors, Colors } from '@/constants/theme';
import { useAudioContext } from '@/context/audio-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePlayerStore } from '@/store/player-store';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, Pressable, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '../ui/icon-symbol';
import { Body, Caption } from '../ui/typography';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MiniPlayer() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const position = usePlayerStore((state) => state.position);
  const duration = usePlayerStore((state) => state.duration);
  const { togglePlay } = useAudioContext();
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const playNext = usePlayerStore((state) => state.playNext);
  const playPrevious = usePlayerStore((state) => state.playPrevious);

  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);

  const progress = duration > 0 ? (position / duration) * 100 : 0;
  
  // Position above the custom bottom nav
  const bottomOffset = 80 + insets.bottom;

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/player');
  };

  const handlePlayPause = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    togglePlay();
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      // no-op; ensures gesture is recognized only when dragging
    })
    .activeOffsetY(10) // avoid accidental dismissals on light taps
    .onUpdate((event) => {
      const dy = Math.max(0, event.translationY);
      translateY.value = dy;
      const progress = Math.min(1, dy / 100);
      opacity.value = 1 - progress * 0.9;
      scale.value = 1 - progress * 0.05;
    })
    .onEnd((event) => {
      const dy = Math.max(0, event.translationY);
      const shouldDismiss = dy > 80 || event.velocityY > 800;
      if (shouldDismiss) {
        // Animate into bottom bar and then hide + stop playback
        translateY.value = withTiming(120, { duration: 180 });
        opacity.value = withTiming(0, { duration: 180 });
        scale.value = withTiming(0.95, { duration: 180 }, () => {
          // Stop playback and clear track to hide mini player
          runOnJS(setIsPlaying)(false);
          runOnJS(setCurrentTrack)(null);
        });
      } else {
        // Restore
        translateY.value = withSpring(0, { damping: 18, stiffness: 180 });
        opacity.value = withSpring(1, { damping: 18, stiffness: 180 });
        scale.value = withSpring(1, { damping: 18, stiffness: 180 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
    opacity: opacity.value,
  }));

  // Ensure mini player reappears cleanly when a new track starts after dismissal
  useEffect(() => {
    if (currentTrack) {
      translateY.value = withTiming(0, { duration: 180 });
      opacity.value = withTiming(1, { duration: 180 });
      scale.value = withTiming(1, { duration: 180 });
      translateX.value = withTiming(0, { duration: 180 });
    }
  }, [currentTrack, opacity, scale, translateY, translateX]);

  // Horizontal swipe for previous/next track
  const unavailableHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 60);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 120);
    }
  };

  const triggerNext = () => {
    const next = playNext();
    if (!next) {
      unavailableHaptic();
    }
  };

  const triggerPrevious = () => {
    const prev = playPrevious();
    if (!prev) {
      unavailableHaptic();
    }
  };

  const swipeGesture = Gesture.Pan()
    .activeOffsetX(12)
    .onUpdate((event) => {
      if (Math.abs(event.translationX) > Math.abs(event.translationY)) {
        const dx = Math.max(-80, Math.min(80, event.translationX));
        translateX.value = dx;
      }
    })
    .onEnd((event) => {
      const dx = event.translationX;
      const isHorizontal = Math.abs(dx) > Math.abs(event.translationY);
      const threshold = 80;
      if (isHorizontal && (dx > threshold || event.velocityX > 800)) {
        translateX.value = withTiming(40, { duration: 120 }, () => {
          runOnJS(triggerNext)();
          translateX.value = withSpring(0, { damping: 18, stiffness: 180 });
        });
      } else if (isHorizontal && (dx < -threshold || event.velocityX < -800)) {
        translateX.value = withTiming(-40, { duration: 120 }, () => {
          runOnJS(triggerPrevious)();
          translateX.value = withSpring(0, { damping: 18, stiffness: 180 });
        });
      } else {
        translateX.value = withSpring(0, { damping: 18, stiffness: 180 });
      }
    });
  if (!currentTrack) return null;

  return (
    <View
      className="absolute left-0 right-0 px-3"
      style={{ bottom: bottomOffset }}
    >
      <GestureDetector gesture={Gesture.Simultaneous(panGesture, swipeGesture)}>
        <AnimatedPressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={animatedStyle}
        >
          <View className="rounded-2xl overflow-hidden border border-white/10">
            {Platform.OS === 'ios' ? (
              <BlurView
                intensity={80}
                tint={colorScheme === 'dark' ? 'dark' : 'light'}
                className="absolute inset-0"
              />
            ) : (
              <View className="absolute inset-0 bg-surface/95 dark:bg-surface-dark/95" />
            )}
            
            <LinearGradient
              colors={
                colorScheme === 'dark'
                  ? ['rgba(139,92,246,0.1)', 'rgba(139,92,246,0.05)', 'transparent']
                  : ['rgba(139,92,246,0.08)', 'rgba(139,92,246,0.02)', 'transparent']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="absolute inset-0"
            />

            <View className="h-0.5 bg-white/10">
              <Animated.View
                className="h-full bg-brand-primary"
                style={{ width: `${progress}%` }}
              />
            </View>

            <View className="flex-row items-center p-3">
              <View className="relative">
                <View
                  className="absolute inset-0 rounded-xl bg-brand-primary/30 blur-xl"
                  style={{ transform: [{ scale: 1.2 }] }}
                />
                <Image
                  source={{ uri: currentTrack.coverUrl }}
                  style={{ width: 48, height: 48, borderRadius: 12 }}
                  contentFit="cover"
                  transition={200}
                />
                {isPlaying && (
                  <View className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-brand-primary items-center justify-center">
                    <View className="w-1.5 h-1.5 rounded-full bg-white" />
                  </View>
                )}
              </View>

              <View className="flex-1 mx-3">
                <Body
                  numberOfLines={1}
                  className="text-sm font-semibold text-primary dark:text-primary-dark"
                >
                  {currentTrack.title}
                </Body>
                <Caption numberOfLines={1} className="text-xs mt-0.5">
                  {currentTrack.artist}
                </Caption>
              </View>

              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={handlePlayPause}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  className="w-10 h-10 rounded-full items-center justify-center overflow-hidden"
                >
                  <LinearGradient
                    colors={[BrandColors.primary, BrandColors.primaryDark]}
                    className="absolute inset-0"
                  />
                  <IconSymbol
                    name={isPlaying ? 'pause.fill' : 'play.fill'}
                    size={20}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  className="w-10 h-10 items-center justify-center"
                >
                  <IconSymbol
                    name="forward.end.fill"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </AnimatedPressable>
      </GestureDetector>
    </View>
  );
}
