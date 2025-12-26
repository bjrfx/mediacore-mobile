/**
 * Media Card Component
 * Inspired by: Spotify's track cards, Apple Music's album cards
 * 
 * Variants:
 * - vertical: List item with artwork, title, artist, duration
 * - horizontal: Square card for carousels
 * - featured: Large hero card with overlay
 */

import { useAudioContext } from '@/context/audio-context';
import { MediaItem } from '@/data/mock';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/utils/cn';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Platform, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { AnimatedPressable } from '../ui/animated-pressable';
import { IconSymbol } from '../ui/icon-symbol';
import { Body, Caption, Subtitle, Title } from '../ui/typography';

interface MediaCardProps {
  item: MediaItem;
  variant?: 'vertical' | 'horizontal' | 'featured';
  onPress?: () => void;
  className?: string;
  showPlayButton?: boolean;
}

export function MediaCard({
  item,
  variant = 'vertical',
  onPress,
  className,
  showPlayButton = true,
}: MediaCardProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { playTrack } = useAudioContext();

  const handlePress = async () => {
    if (onPress) {
      onPress();
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await playTrack(item);
    router.push('/player');
  };

  // Featured variant - Large hero card
  if (variant === 'featured') {
    return (
      <AnimatedPressable onPress={handlePress} className={cn('w-full', className)}>
        <View className="rounded-3xl overflow-hidden bg-surface dark:bg-surface-dark">
          <View className="relative">
            <Image
              source={{ uri: item.coverUrl }}
              style={{ width: '100%', height: 220 }}
              contentFit="cover"
              transition={300}
            />
            {/* Gradient overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              className="absolute inset-0"
            />
            {/* Content overlay */}
            <View className="absolute bottom-0 left-0 right-0 p-5">
              <View className="flex-row items-center mb-2">
                <View className="px-2.5 py-1 rounded-full bg-brand-primary/90 mr-2">
                  <Caption className="text-white text-2xs font-bold uppercase tracking-wide">
                    Featured
                  </Caption>
                </View>
                {item.type === 'video' && (
                  <View className="px-2.5 py-1 rounded-full bg-white/20">
                    <Caption className="text-white text-2xs font-medium">Video</Caption>
                  </View>
                )}
              </View>
              <Title className="text-white text-2xl mb-1" numberOfLines={1}>
                {item.title}
              </Title>
              <Body className="text-white/80" numberOfLines={1}>
                {item.artist}
              </Body>
            </View>
            {/* Play button */}
            {showPlayButton && (
              <View className="absolute top-4 right-4 w-12 h-12 rounded-full bg-brand-primary items-center justify-center shadow-lg">
                <IconSymbol name="play.fill" size={22} color="#FFFFFF" />
              </View>
            )}
          </View>
        </View>
      </AnimatedPressable>
    );
  }

  // Horizontal variant - Square card for carousels
  if (variant === 'horizontal') {
    return (
      <AnimatedPressable
        onPress={handlePress}
        className={cn('w-36', className)}
      >
        <View className="relative rounded-xl overflow-hidden mb-2">
          <Image
            source={{ uri: item.coverUrl }}
            style={{ width: 144, height: 144 }}
            contentFit="cover"
            transition={200}
          />
          {/* Type indicator */}
          {item.type === 'video' && (
            <View className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/60 flex-row items-center">
              <IconSymbol name="video" size={12} color="#FFFFFF" />
            </View>
          )}
          {/* Hover overlay with play */}
          <View className="absolute inset-0 bg-black/0 active:bg-black/30 items-center justify-center">
            <View className="w-10 h-10 rounded-full bg-brand-primary/0 active:bg-brand-primary items-center justify-center" />
          </View>
        </View>
        <Subtitle numberOfLines={1} className="text-sm font-semibold">
          {item.title}
        </Subtitle>
        <Caption numberOfLines={1} className="text-xs mt-0.5">
          {item.artist}
        </Caption>
      </AnimatedPressable>
    );
  }

  // Vertical (List) variant - Default
  return (
    <AnimatedPressable
      onPress={handlePress}
      className={cn('flex-row items-center mb-3 py-1', className)}
    >
      {/* Artwork */}
      <View className="relative">
        <Image
          source={{ uri: item.coverUrl }}
          style={{ width: 56, height: 56, borderRadius: 10 }}
          contentFit="cover"
          transition={200}
        />
        {/* Type indicator for video */}
        {item.type === 'video' && (
          <View className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-black/60 items-center justify-center">
            <IconSymbol name="video" size={10} color="#FFFFFF" />
          </View>
        )}
      </View>

      {/* Info */}
      <View className="flex-1 ml-3 justify-center">
        <Body className="font-semibold text-sm" numberOfLines={1}>
          {item.title}
        </Body>
        <View className="flex-row items-center mt-0.5">
          <Caption className="text-xs" numberOfLines={1}>
            {item.artist}
          </Caption>
          <View className="w-1 h-1 rounded-full bg-secondary dark:bg-secondary-dark mx-2" />
          <Caption className="text-xs">{item.duration}</Caption>
        </View>
      </View>

      {/* Action button */}
      <View className="ml-2">
        <IconSymbol name="ellipsis" size={18} color={colors.textTertiary} />
      </View>
    </AnimatedPressable>
  );
}
