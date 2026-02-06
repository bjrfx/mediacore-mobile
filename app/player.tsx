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
import { BrandColors, Shadows } from '@/constants/theme';
import { useAudioContext } from '@/context/audio-context';
import { usePlayerStore } from '@/store/player-store';
import Slider from '@react-native-community/slider';
import { ResizeMode, Video } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Playback rates available
const PLAYBACK_RATES = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

// Repeat modes
type RepeatMode = 'off' | 'all' | 'one';

export default function PlayerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { togglePlay, seekTo, setRate } = useAudioContext();

  // Store State
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const position = usePlayerStore((state) => state.position);
  const duration = usePlayerStore((state) => state.duration);
  const playbackRate = usePlayerStore((state) => state.playbackRate);
  const isBuffering = usePlayerStore((state) => state.isBuffering);
  const setPosition = usePlayerStore((state) => state.setPosition);
  const setDuration = usePlayerStore((state) => state.setDuration);
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
  const playNext = usePlayerStore((state) => state.playNext);
  const playPrevious = usePlayerStore((state) => state.playPrevious);
  const setPlaybackRate = usePlayerStore((state) => state.setPlaybackRate);
  const volume = usePlayerStore((state) => state.volume);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const setIsBuffering = usePlayerStore((state) => state.setIsBuffering);

  // Local state
  const [isSliding, setIsSliding] = useState(false);
  const [slideValue, setSlideValue] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [bufferedPosition, setBufferedPosition] = useState(0);
  const [selectedQualityLabel, setSelectedQualityLabel] = useState<string | null>(null);
  const [brightnessLevel, setBrightnessLevel] = useState(1);
  const [gestureHudLabel, setGestureHudLabel] = useState<string | null>(null);

  const videoRef = useRef<Video>(null);
  const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const isLeftGestureRef = useRef(false);
  const startVolumeRef = useRef(volume);
  const startBrightnessRef = useRef(brightnessLevel);

  // Animation values
  const artworkScale = useSharedValue(1);
  const playButtonScale = useSharedValue(1);
  const leftSkipOpacity = useSharedValue(0);
  const rightSkipOpacity = useSharedValue(0);
  const gestureHudOpacity = useSharedValue(0);

  const isVideo = currentTrack?.type === 'video';
  const isLandscape = width > height;
  const showFullscreenVideo = isFullscreen || isLandscape;

  const activeQuality =
    isVideo && currentTrack?.qualities && currentTrack.qualities.length > 0
      ? currentTrack.qualities.find((q) => q.label === selectedQualityLabel) ||
        currentTrack.qualities[0]
      : null;

  const videoSourceUri =
    activeQuality?.url || currentTrack?.videoUrl || currentTrack?.audioUrl;

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
    if (currentTrack?.type === 'video' && videoRef.current) {
      await videoRef.current.setPositionAsync(value);
      setPosition(value); // Update store immediately
    } else {
      await seekTo(value);
    }
    setIsSliding(false);
  };

  const cyclePlaybackRate = async () => {
    const currentIndex = PLAYBACK_RATES.indexOf(playbackRate);
    const nextRate = PLAYBACK_RATES[(currentIndex + 1) % PLAYBACK_RATES.length];
    setPlaybackRate(nextRate);
    if (isVideo && videoRef.current) {
      try {
        await videoRef.current.setRateAsync(nextRate, true);
      } catch {
      }
    } else {
      setRate(nextRate);
    }
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

  const handleSeekBy = async (deltaMs: number) => {
    if (!currentTrack) return;
    if (isVideo && videoRef.current) {
      try {
        const status = await videoRef.current.getStatusAsync();
        if (!status.isLoaded) return;
        const durationMs = status.durationMillis || duration || 0;
        const next = Math.max(
          0,
          Math.min(durationMs, status.positionMillis + deltaMs)
        );
        await videoRef.current.setPositionAsync(next);
        setPosition(next);
      } catch {
      }
    } else {
      const durationMs = duration || 0;
      const next = Math.max(0, Math.min(durationMs, position + deltaMs));
      await seekTo(next);
    }
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const showLeftSkipHud = () => {
    leftSkipOpacity.value = 1;
    leftSkipOpacity.value = withTiming(0, { duration: 400 });
  };

  const showRightSkipHud = () => {
    rightSkipOpacity.value = 1;
    rightSkipOpacity.value = withTiming(0, { duration: 400 });
  };

  const showGestureHud = (label: string) => {
    setGestureHudLabel(label);
    gestureHudOpacity.value = 1;
    gestureHudOpacity.value = withTiming(0, { duration: 600 });
  };

  const handlePlayPause = async () => {
    if (currentTrack?.type === 'video' && videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await videoRef.current.playAsync();
        setIsPlaying(true);
      }
    } else {
      togglePlay();
    }
    
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

  React.useEffect(() => {
    if (!showFullscreenVideo) return;
    if (!isPlaying) return;
    if (!controlsVisible) return;
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    hideControlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, [showFullscreenVideo, isPlaying, controlsVisible]);

  React.useEffect(() => {
    if (!isVideo || !currentTrack?.qualities || currentTrack.qualities.length === 0) {
      setSelectedQualityLabel(null);
      return;
    }
    if (!selectedQualityLabel) {
      setSelectedQualityLabel(currentTrack.qualities[0].label);
    }
  }, [isVideo, currentTrack?.id]);

  React.useEffect(() => {
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, []);

  const leftSkipHudStyle = useAnimatedStyle(() => ({
    opacity: leftSkipOpacity.value,
    transform: [{ scale: 0.9 + 0.1 * leftSkipOpacity.value }],
  }));

  const rightSkipHudStyle = useAnimatedStyle(() => ({
    opacity: rightSkipOpacity.value,
    transform: [{ scale: 0.9 + 0.1 * rightSkipOpacity.value }],
  }));

  const gestureHudStyle = useAnimatedStyle(() => ({
    opacity: gestureHudOpacity.value,
    transform: [{ scale: 0.96 + 0.04 * gestureHudOpacity.value }],
  }));

  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .maxDuration(250)
    .onEnd((_event, success) => {
      if (!success) return;
      runOnJS(setControlsVisible)((prev) => !prev);
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(300)
    .onEnd((event, success) => {
      if (!success) return;
      const isLeft = event.x < width / 2;
      if (isLeft) {
        runOnJS(handleSeekBy)(-10000);
        runOnJS(showLeftSkipHud)();
      } else {
        runOnJS(handleSeekBy)(10000);
        runOnJS(showRightSkipHud)();
      }
    });

  const verticalGesture = Gesture.Pan()
    .onStart((event) => {
      isLeftGestureRef.current = event.x < width / 2;
      startVolumeRef.current = volume;
      startBrightnessRef.current = brightnessLevel;
    })
    .onUpdate((event) => {
      const delta = -event.translationY / 300;
      if (isLeftGestureRef.current) {
        let value = startBrightnessRef.current + delta;
        if (value < 0.1) value = 0.1;
        if (value > 1) value = 1;
        runOnJS(setBrightnessLevel)(value);
        runOnJS(showGestureHud)('Brightness');
      } else {
        let value = startVolumeRef.current + delta;
        if (value < 0) value = 0;
        if (value > 1) value = 1;
        runOnJS(setVolume)(value);
        runOnJS(showGestureHud)('Volume');
      }
    });

  const videoGestures = Gesture.Simultaneous(singleTap, doubleTap, verticalGesture);

  const handleToggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    setControlsVisible(true);
  };

  const handleNext = () => {
    const next = playNext();
    if (next) {
      setIsPlaying(true);
    }
  };

  const handlePrevious = () => {
    const prev = playPrevious();
    if (prev) {
      setIsPlaying(true);
    }
  };

  const handleSelectQuality = (label: string) => {
    setSelectedQualityLabel(label);
    setControlsVisible(true);
  };

  if (!currentTrack) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color={BrandColors.primary} />
      </View>
    );
  }

  const currentPosition = isSliding ? slideValue : position;
  const bufferedPercent =
    duration > 0 ? Math.min(1, bufferedPosition / duration) : 0;

  const brightnessOverlayOpacity = 1 - brightnessLevel;

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <StatusBar hidden={showFullscreenVideo && controlsVisible === false} style="light" />
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
      {!showFullscreenVideo && (
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
      )}

      {/* Main Content */}
      <View className="flex-1 px-4 justify-center">
        <View
          style={{
            width,
            height: showFullscreenVideo ? height : (width * 9) / 16,
            alignSelf: 'center',
          }}
        >
          <Animated.View
            style={[
              artworkAnimatedStyle,
              {
                width: '100%',
                height: '100%',
                alignSelf: 'center',
                ...Shadows.lg,
              },
            ]}
            className="rounded-3xl overflow-hidden"
          >
            {isVideo ? (
              <GestureDetector gesture={videoGestures}>
                <Animated.View className="w-full h-full">
                  <Video
                    ref={videoRef}
                    source={videoSourceUri ? { uri: videoSourceUri } : undefined}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay={isPlaying}
                    isLooping={false}
                    useNativeControls={false}
                    volume={volume}
                    onPlaybackStatusUpdate={(status) => {
                      if (status.isLoaded) {
                        if (!isSliding) {
                          setPosition(status.positionMillis);
                          if (status.durationMillis) {
                            setDuration(status.durationMillis);
                          }
                        }
                        if (status.playableDurationMillis) {
                          setBufferedPosition(status.playableDurationMillis);
                        }
                        setIsBuffering(status.isBuffering);
                        if (status.didJustFinish) {
                          setIsPlaying(false);
                        }
                      }
                    }}
                  />

                  <Animated.View
                    style={{ opacity: brightnessOverlayOpacity }}
                    className="absolute inset-0 bg-black"
                  />

                  {controlsVisible && (
                    <View className="absolute inset-0 justify-between">
                      <View className="flex-row items-center justify-between px-4 pt-4">
                        <TouchableOpacity
                          onPress={() => router.back()}
                          hitSlop={{
                            top: 10,
                            bottom: 10,
                            left: 10,
                            right: 10,
                          }}
                          className="w-9 h-9 rounded-full bg-black/40 items-center justify-center"
                        >
                          <IconSymbol
                            name="chevron.down"
                            size={20}
                            color="#FFFFFF"
                          />
                        </TouchableOpacity>

                        <View className="flex-1 px-3">
                          <Title
                            className="text-white text-sm"
                            numberOfLines={1}
                          >
                            {currentTrack.title}
                          </Title>
                          <Caption
                            className="text-white/70 text-2xs"
                            numberOfLines={1}
                          >
                            {currentTrack.artist}
                          </Caption>
                        </View>

                        <TouchableOpacity
                          onPress={handleToggleFullscreen}
                          className="w-9 h-9 rounded-full bg-black/40 items-center justify-center"
                        >
                          <IconSymbol
                            name={
                              showFullscreenVideo
                                ? 'arrow.down.right.and.arrow.up.left'
                                : 'arrow.up.left.and.arrow.down.right'
                            }
                            size={18}
                            color="#FFFFFF"
                          />
                        </TouchableOpacity>
                      </View>

                      <View className="flex-row items-center justify-center gap-10 pb-10">
                        <TouchableOpacity
                          className="w-12 h-12 rounded-full bg-black/40 items-center justify-center"
                          onPress={handlePrevious}
                        >
                          <IconSymbol
                            name="backward.end.fill"
                            size={22}
                            color="#FFFFFF"
                          />
                        </TouchableOpacity>

                        <Animated.View style={playButtonAnimatedStyle}>
                          <AnimatedPressable
                            onPress={handlePlayPause}
                            className="w-16 h-16 rounded-full items-center justify-center overflow-hidden"
                            style={Shadows.glow(BrandColors.primary)}
                          >
                            <LinearGradient
                              colors={[
                                BrandColors.primary,
                                BrandColors.primaryDark,
                              ]}
                              className="absolute inset-0"
                            />
                            {isBuffering ? (
                              <ActivityIndicator color="white" size="small" />
                            ) : (
                              <IconSymbol
                                name={isPlaying ? 'pause.fill' : 'play.fill'}
                                size={28}
                                color="#FFFFFF"
                              />
                            )}
                          </AnimatedPressable>
                        </Animated.View>

                        <TouchableOpacity
                          className="w-12 h-12 rounded-full bg-black/40 items-center justify-center"
                          onPress={handleNext}
                        >
                          <IconSymbol
                            name="forward.end.fill"
                            size={22}
                            color="#FFFFFF"
                          />
                        </TouchableOpacity>
                      </View>

                      <View className="px-4 pb-4">
                        <View className="h-1.5 rounded-full bg-white/20 overflow-hidden mb-2">
                          <View
                            style={{
                              width: `${bufferedPercent * 100}%`,
                            }}
                            className="h-full bg-white/30"
                          />
                          <View
                            style={{
                              width:
                                duration > 0
                                  ? `${(currentPosition / duration) * 100}%`
                                  : '0%',
                            }}
                            className="h-full bg-brand-primary absolute left-0 top-0"
                          />
                        </View>

                        <View className="flex-row justify-between items-center">
                          <Caption className="text-white/70 text-2xs font-mono">
                            {formatTime(currentPosition)}
                          </Caption>
                          <View className="flex-row items-center gap-3">
                            <TouchableOpacity
                              onPress={cyclePlaybackRate}
                              className="px-2 py-0.5 rounded-full bg-black/40"
                            >
                              <Caption className="text-white text-2xs">
                                {playbackRate}x
                              </Caption>
                            </TouchableOpacity>

                            {isVideo &&
                              currentTrack.qualities &&
                              currentTrack.qualities.length > 0 && (
                                <View className="flex-row items-center">
                                  {currentTrack.qualities.map((q) => (
                                    <TouchableOpacity
                                      key={q.label}
                                      onPress={() =>
                                        handleSelectQuality(q.label)
                                      }
                                      className={`px-2 py-0.5 rounded-full ${
                                        q.label === selectedQualityLabel
                                          ? 'bg-brand-primary'
                                          : 'bg-black/40'
                                      } ml-1`}
                                    >
                                      <Caption className="text-white text-2xs">
                                        {q.label}
                                      </Caption>
                                    </TouchableOpacity>
                                  ))}
                                </View>
                              )}
                          </View>
                          <Caption className="text-white/70 text-2xs font-mono">
                            {formatTime(duration)}
                          </Caption>
                        </View>
                      </View>
                    </View>
                  )}

                  {isVideo && (
                    <>
                      <Animated.View
                        style={leftSkipHudStyle}
                        className="absolute left-4 top-1/2 -mt-8 w-16 h-16 rounded-full bg-black/60 items-center justify-center"
                      >
                        <Caption className="text-white text-xs">
                          -10s
                        </Caption>
                      </Animated.View>
                      <Animated.View
                        style={rightSkipHudStyle}
                        className="absolute right-4 top-1/2 -mt-8 w-16 h-16 rounded-full bg-black/60 items-center justify-center"
                      >
                        <Caption className="text-white text-xs">
                          +10s
                        </Caption>
                      </Animated.View>
                    </>
                  )}

                  {gestureHudLabel && (
                    <Animated.View
                      style={gestureHudStyle}
                      className="absolute self-center top-1/2 -mt-10 px-4 py-2 rounded-full bg-black/70"
                    >
                      <Caption className="text-white text-xs">
                        {gestureHudLabel}
                      </Caption>
                    </Animated.View>
                  )}

                  {isVideo && (
                    <View className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/50 flex-row items-center">
                      <IconSymbol name="video" size={14} color="#FFFFFF" />
                      <Caption className="text-white ml-1.5 text-xs">
                        Video
                      </Caption>
                    </View>
                  )}
                </Animated.View>
              </GestureDetector>
            ) : (
              <Image
                source={{ uri: currentTrack.coverUrl }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={500}
              />
            )}
          </Animated.View>
        </View>

        {!showFullscreenVideo && (
          <View>
            <View className="items-center mb-6 px-4 mt-6">
              <View className="flex-row items-center w-full justify-between">
                <View className="flex-1 mr-4">
                  <Title className="text-white text-2xl" numberOfLines={1}>
                    {currentTrack.title}
                  </Title>
                  <Body
                    className="text-white/60 text-lg mt-1"
                    numberOfLines={1}
                  >
                    {currentTrack.artist}
                  </Body>
                </View>

                <TouchableOpacity onPress={toggleLike}>
                  <IconSymbol
                    name={isLiked ? 'heart.fill' : 'heart'}
                    size={28}
                    color={isLiked ? BrandColors.tertiary : '#FFFFFF'}
                  />
                </TouchableOpacity>
              </View>
            </View>

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

            <View className="flex-row items-center justify-between mb-8 px-4">
              <TouchableOpacity onPress={toggleShuffle}>
                <IconSymbol
                  name="shuffle"
                  size={24}
                  color={
                    isShuffle
                      ? BrandColors.primary
                      : 'rgba(255,255,255,0.6)'
                  }
                />
              </TouchableOpacity>

              <TouchableOpacity className="w-14 h-14 items-center justify-center">
                <IconSymbol
                  name="backward.end.fill"
                  size={32}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

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

              <TouchableOpacity className="w-14 h-14 items-center justify-center">
                <IconSymbol
                  name="forward.end.fill"
                  size={32}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

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

            <View className="flex-row items-center justify-between px-2">
              <TouchableOpacity
                onPress={cyclePlaybackRate}
                className="px-3 py-1.5 rounded-full bg-white/10"
              >
                <Caption className="text-white font-semibold">
                  {playbackRate}x
                </Caption>
              </TouchableOpacity>

              <View className="flex-row items-center gap-6">
                {currentTrack.type === 'video' && (
                  <TouchableOpacity>
                    <IconSymbol
                      name="captions.bubble"
                      size={22}
                      color="rgba(255,255,255,0.6)"
                    />
                  </TouchableOpacity>
                )}

                <TouchableOpacity>
                  <IconSymbol
                    name="timer"
                    size={22}
                    color="rgba(255,255,255,0.6)"
                  />
                </TouchableOpacity>

                <TouchableOpacity>
                  <IconSymbol
                    name="list.bullet"
                    size={22}
                    color="rgba(255,255,255,0.6)"
                  />
                </TouchableOpacity>

                <TouchableOpacity>
                  <IconSymbol
                    name="square.and.arrow.up"
                    size={22}
                    color="rgba(255,255,255,0.6)"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity className="px-3 py-1.5 rounded-full bg-white/10">
                <IconSymbol name="airplayaudio" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={{ height: insets.bottom + 16 }} />
    </View>
  );
}
