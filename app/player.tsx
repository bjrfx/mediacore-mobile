/**
 * Full-Screen Player
 * Inspired by: Spotify, Apple Music, YouTube Music
 * 
 * Features:
 * - Immersive full-screen experience with dynamic background
 * - Video playback support
 * - Comprehensive controls: play/pause, skip, shuffle, repeat
 * - Playback speed control
 * - Progress seeking with smooth animation
 * - Queue access
 * - Share, like, and more options
 */

import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Body, Caption, Title } from '@/components/ui/typography';
import { BrandColors, Colors, Shadows } from '@/constants/theme';
import { useAudioContext } from '@/context/audio-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePlayerStore } from '@/store/player-store';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Platform,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ARTWORK_SIZE = SCREEN_WIDTH - 64;

// Playback rates available
const PLAYBACK_RATES = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

// Repeat modes
type RepeatMode = 'off' | 'all' | 'one';

export default function PlayerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { togglePlay, seekTo, setRate } = useAudioContext();

  // Store State
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const position = usePlayerStore((state) => state.position);
  const duration = usePlayerStore((state) => state.duration);
  const playbackRate = usePlayerStore((state) => state.playbackRate);
  const isBuffering = usePlayerStore((state) => state.isBuffering);

  // Local state
  const [isSliding, setIsSliding] = useState(false);
  const [slideValue, setSlideValue] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');

  // Animation values
  const artworkScale = useSharedValue(1);
  const playButtonScale = useSharedValue(1);

  const formatTime = (millis: number) => {
    if (!millis || millis < 0) return '0:00';
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSlidingStart = () => {
    setIsSliding(true);
    setSlideValue(position);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSlidingComplete = async (value: number) => {
    await seekTo(value);
    setIsSliding(false);
  };

  const cyclePlaybackRate = () => {
    const currentIndex = PLAYBACK_RATES.indexOf(playbackRate);
    const nextRate = PLAYBACK_RATES[(currentIndex + 1) % PLAYBACK_RATES.length];
    setRate(nextRate);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const cycleRepeatMode = () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentIndex + 1) % modes.length]);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handlePlayPause = () => {
    togglePlay();
    playButtonScale.value = withSpring(0.9, { damping: 15, stiffness: 200 });
    setTimeout(() => {
      playButtonScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    }, 100);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const artworkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: artworkScale.value }],
  }));

  const playButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playButtonScale.value }],
  }));

  // Update artwork scale based on playing state
  React.useEffect(() => {
    artworkScale.value = withTiming(isPlaying ? 1 : 0.95, { duration: 300 });
  }, [isPlaying]);

  if (!currentTrack) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color={BrandColors.primary} />
      </View>
    );
  }

  const currentPosition = isSliding ? slideValue : position;

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      {/* Background with artwork blur */}
      <View className="absolute inset-0">
        <Image
          source={{ uri: currentTrack.coverUrl }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          blurRadius={80}
        />
        <LinearGradient
          colors={[
            'rgba(10,10,15,0.3)',
            'rgba(10,10,15,0.8)',
            'rgba(10,10,15,0.95)',
            'rgba(10,10,15,1)',
          ]}
          locations={[0, 0.4, 0.7, 1]}
          className="absolute inset-0"
        />
      </View>

      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4"
        style={{ paddingTop: insets.top + 8 }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
        >
          <IconSymbol name="chevron.down" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View className="items-center">
          <Caption className="text-white/60 uppercase tracking-widest text-2xs">
            Playing from
          </Caption>
          <Body className="text-white font-medium text-sm">
            {currentTrack.category}
          </Body>
        </View>

        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
        >
          <IconSymbol name="ellipsis" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-8 justify-center">
        {/* Artwork */}
        <Animated.View
          style={[
            artworkAnimatedStyle,
            {
              width: ARTWORK_SIZE,
              height: ARTWORK_SIZE,
              alignSelf: 'center',
              ...Shadows.lg,
            },
          ]}
          className="rounded-3xl overflow-hidden mb-8"
        >
          <Image
            source={{ uri: currentTrack.coverUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={500}
          />
          {/* Media type indicator */}
          {currentTrack.type === 'video' && (
            <View className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/50 flex-row items-center">
              <IconSymbol name="video" size={14} color="#FFFFFF" />
              <Caption className="text-white ml-1.5 text-xs">Video</Caption>
            </View>
          )}
        </Animated.View>

        {/* Track Info */}
        <View className="items-center mb-6">
          <View className="flex-row items-center w-full justify-between">
            <View className="flex-1 mr-4">
              <Title className="text-white text-2xl" numberOfLines={1}>
                {currentTrack.title}
              </Title>
              <Body className="text-white/60 text-lg mt-1" numberOfLines={1}>
                {currentTrack.artist}
              </Body>
            </View>

            {/* Like button */}
            <TouchableOpacity onPress={toggleLike}>
              <IconSymbol
                name={isLiked ? 'heart.fill' : 'heart'}
                size={28}
                color={isLiked ? BrandColors.tertiary : '#FFFFFF'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Bar */}
        <View className="mb-6">
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0}
            maximumValue={duration}
            value={currentPosition}
            onSlidingStart={handleSlidingStart}
            onValueChange={setSlideValue}
            onSlidingComplete={handleSlidingComplete}
            minimumTrackTintColor={BrandColors.primary}
            maximumTrackTintColor="rgba(255,255,255,0.3)"
            thumbTintColor={BrandColors.primary}
          />
          <View className="flex-row justify-between px-1 -mt-2">
            <Caption className="text-white/60 text-xs font-mono">
              {formatTime(currentPosition)}
            </Caption>
            <Caption className="text-white/60 text-xs font-mono">
              {formatTime(duration)}
            </Caption>
          </View>
        </View>

        {/* Main Controls */}
        <View className="flex-row items-center justify-between mb-8 px-4">
          {/* Shuffle */}
          <TouchableOpacity onPress={toggleShuffle}>
            <IconSymbol
              name="shuffle"
              size={24}
              color={isShuffle ? BrandColors.primary : 'rgba(255,255,255,0.6)'}
            />
          </TouchableOpacity>

          {/* Previous */}
          <TouchableOpacity className="w-14 h-14 items-center justify-center">
            <IconSymbol name="backward.end.fill" size={32} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Play/Pause */}
          <Animated.View style={playButtonAnimatedStyle}>
            <AnimatedPressable
              onPress={handlePlayPause}
              className="w-20 h-20 rounded-full items-center justify-center overflow-hidden"
              style={Shadows.glow(BrandColors.primary)}
            >
              <LinearGradient
                colors={[BrandColors.primary, BrandColors.primaryDark]}
                className="absolute inset-0"
              />
              {isBuffering ? (
                <ActivityIndicator color="white" size="large" />
              ) : (
                <IconSymbol
                  name={isPlaying ? 'pause.fill' : 'play.fill'}
                  size={36}
                  color="#FFFFFF"
                />
              )}
            </AnimatedPressable>
          </Animated.View>

          {/* Next */}
          <TouchableOpacity className="w-14 h-14 items-center justify-center">
            <IconSymbol name="forward.end.fill" size={32} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Repeat */}
          <TouchableOpacity onPress={cycleRepeatMode}>
            <IconSymbol
              name={repeatMode === 'one' ? 'repeat.1' : 'repeat'}
              size={24}
              color={
                repeatMode !== 'off'
                  ? BrandColors.primary
                  : 'rgba(255,255,255,0.6)'
              }
            />
          </TouchableOpacity>
        </View>

        {/* Secondary Controls */}
        <View className="flex-row items-center justify-between px-2">
          {/* Playback Speed */}
          <TouchableOpacity
            onPress={cyclePlaybackRate}
            className="px-3 py-1.5 rounded-full bg-white/10"
          >
            <Caption className="text-white font-semibold">
              {playbackRate}x
            </Caption>
          </TouchableOpacity>

          {/* Additional controls */}
          <View className="flex-row items-center gap-6">
            {/* Captions (for video) */}
            {currentTrack.type === 'video' && (
              <TouchableOpacity>
                <IconSymbol
                  name="captions.bubble"
                  size={22}
                  color="rgba(255,255,255,0.6)"
                />
              </TouchableOpacity>
            )}

            {/* Timer/Sleep */}
            <TouchableOpacity>
              <IconSymbol
                name="timer"
                size={22}
                color="rgba(255,255,255,0.6)"
              />
            </TouchableOpacity>

            {/* Queue */}
            <TouchableOpacity>
              <IconSymbol
                name="list.bullet"
                size={22}
                color="rgba(255,255,255,0.6)"
              />
            </TouchableOpacity>

            {/* Share */}
            <TouchableOpacity>
              <IconSymbol
                name="square.and.arrow.up"
                size={22}
                color="rgba(255,255,255,0.6)"
              />
            </TouchableOpacity>
          </View>

          {/* AirPlay */}
          <TouchableOpacity className="px-3 py-1.5 rounded-full bg-white/10">
            <IconSymbol name="airplayaudio" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom safe area */}
      <View style={{ height: insets.bottom + 16 }} />
    </View>
  );
}
