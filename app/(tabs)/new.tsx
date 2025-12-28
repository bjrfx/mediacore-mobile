/**
 * New / Discover Screen
 * Inspired by: Apple Music's New tab, Spotify's New Releases
 * 
 * Features:
 * - New releases with dates
 * - Featured playlists
 * - Music videos section
 * - Coming soon previews
 */

import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { FadeIn } from '@/components/ui/fade-in';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Section } from '@/components/ui/section';
import { Body, Caption, Subtitle, Title } from '@/components/ui/typography';
import { BrandColors, Colors } from '@/constants/theme';
import { MediaItem } from '@/data/mock';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { publicApi } from '@/services/api';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Featured collections
const FEATURED_COLLECTIONS = [
  {
    id: '1',
    title: 'Weekly Discoveries',
    subtitle: 'Fresh picks for you',
    gradient: [BrandColors.primary, BrandColors.tertiary] as const,
    icon: 'waveform',
  },
  {
    id: '2',
    title: 'Top Charts',
    subtitle: 'What\'s trending',
    gradient: [BrandColors.secondary, BrandColors.primary] as const,
    icon: 'star.fill',
  },
  {
    id: '3',
    title: 'New Artists',
    subtitle: 'Rising talent',
    gradient: [BrandColors.tertiary, BrandColors.warning] as const,
    icon: 'music.note',
  },
];

export default function NewScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  
  const [newReleases, setNewReleases] = useState<MediaItem[]>([]);
  const [videoItems, setVideoItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const feedData = await publicApi.getFeed({ 
        limit: 20,
        orderBy: 'createdAt',
        order: 'desc'
      });
      
      if (feedData && feedData.data && Array.isArray(feedData.data)) {
        const mappedItems: MediaItem[] = feedData.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          artist: item.artistName || 'Unknown Artist',
          album: 'Single',
          coverUrl: item.thumbnailUrl || 'https://via.placeholder.com/300',
          duration: formatDuration(item.duration),
          durationMs: (item.duration || 0) * 1000,
          type: item.type === 'video' ? 'video' : 'audio',
          category: item.type === 'video' ? 'Video' : 'Music',
          genre: 'Unknown',
          audioUrl: encodeURI(item.fileUrl || item.streamUrl || ''),
          videoUrl: encodeURI(item.fileUrl || item.streamUrl || ''),
          streamType: item.isHls ? 'hls' : 'file',
          releaseDate: item.createdAt,
          isNew: true, // Mark as new since we fetched latest
        }));
        
        setNewReleases(mappedItems);
        setVideoItems(mappedItems.filter(item => item.type === 'video'));
      }
    } catch (err) {
      console.error('Failed to fetch new releases:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
        <ActivityIndicator size="large" color={BrandColors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 180 }}
      >
        {/* Header */}
        <View
          className="px-4 pb-4"
          style={{ paddingTop: insets.top + 8 }}
        >
          <FadeIn delay={100}>
            <View className="flex-row items-center justify-between">
              <Title className="text-3xl">New</Title>
              <TouchableOpacity className="flex-row items-center">
                <Caption className="text-brand-primary mr-1">Filter</Caption>
                <IconSymbol name="chevron.down" size={14} color={BrandColors.primary} />
              </TouchableOpacity>
            </View>
          </FadeIn>
        </View>

        {/* Featured Collections */}
        <FadeIn delay={150}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={FEATURED_COLLECTIONS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <AnimatedPressable className="mr-3" style={{ width: SCREEN_WIDTH * 0.7 }}>
                <LinearGradient
                  colors={item.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="h-32 rounded-2xl p-4 justify-between"
                >
                  <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                    <IconSymbol name={item.icon} size={20} color="#FFFFFF" />
                  </View>
                  <View>
                    <Subtitle className="text-white font-bold">{item.title}</Subtitle>
                    <Caption className="text-white/70">{item.subtitle}</Caption>
                  </View>
                </LinearGradient>
              </AnimatedPressable>
            )}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          />
        </FadeIn>

        {/* New Releases */}
        <Section
          title="New Releases"
          action={
            <TouchableOpacity>
              <Caption className="text-brand-primary">See all</Caption>
            </TouchableOpacity>
          }
        >
          <View className="px-4">
            {newReleases.slice(0, 5).map((item, index) => (
              <FadeIn key={item.id} delay={200 + index * 50}>
                <AnimatedPressable className="flex-row items-center mb-4">
                  {/* Artwork with "NEW" badge */}
                  <View className="relative">
                    <Image
                      source={{ uri: item.coverUrl }}
                      style={{ width: 64, height: 64, borderRadius: 12 }}
                      contentFit="cover"
                    />
                    {item.isNew && (
                      <View className="absolute -top-1 -right-1 bg-brand-primary px-1.5 py-0.5 rounded-md">
                        <Caption className="text-white text-2xs font-bold">NEW</Caption>
                      </View>
                    )}
                  </View>

                  {/* Info */}
                  <View className="flex-1 ml-3">
                    <Body className="font-semibold" numberOfLines={1}>
                      {item.title}
                    </Body>
                    <Caption numberOfLines={1}>{item.artist}</Caption>
                    <Caption className="text-secondary dark:text-secondary-dark text-xs mt-1">
                      {item.releaseDate}
                    </Caption>
                  </View>

                  {/* Play button */}
                  <TouchableOpacity className="w-10 h-10 rounded-full bg-surface dark:bg-surface-dark items-center justify-center">
                    <IconSymbol name="play.fill" size={16} color={colors.text} />
                  </TouchableOpacity>
                </AnimatedPressable>
              </FadeIn>
            ))}
          </View>
        </Section>

        {/* Music Videos */}
        {videoItems.length > 0 && (
          <Section
            title="Music Videos"
            action={
              <TouchableOpacity>
                <Caption className="text-brand-primary">See all</Caption>
              </TouchableOpacity>
            }
          >
            <FadeIn delay={400}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={videoItems}
                keyExtractor={(item) => `video-${item.id}`}
                renderItem={({ item }) => (
                  <AnimatedPressable className="mr-3" style={{ width: 200 }}>
                    <View className="relative rounded-xl overflow-hidden">
                      <Image
                        source={{ uri: item.coverUrl }}
                        style={{ width: 200, height: 120 }}
                        contentFit="cover"
                      />
                      {/* Video indicator */}
                      <View className="absolute inset-0 items-center justify-center">
                        <View className="w-12 h-12 rounded-full bg-black/50 items-center justify-center">
                          <IconSymbol name="play.fill" size={24} color="#FFFFFF" />
                        </View>
                      </View>
                      {/* Duration badge */}
                      <View className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded">
                        <Caption className="text-white text-xs">{item.duration}</Caption>
                      </View>
                    </View>
                    <Body className="font-medium mt-2" numberOfLines={1}>
                      {item.title}
                    </Body>
                    <Caption numberOfLines={1}>{item.artist}</Caption>
                  </AnimatedPressable>
                )}
                contentContainerStyle={{ paddingHorizontal: 16 }}
              />
            </FadeIn>
          </Section>
        )}

        {/* Coming Soon */}
        <Section title="Coming Soon">
          <View className="px-4">
            <FadeIn delay={500}>
              <View className="bg-surface dark:bg-surface-dark rounded-2xl p-4 border border-border dark:border-border-dark border-dashed">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-xl bg-brand-primary/20 items-center justify-center">
                    <IconSymbol name="bell" size={24} color={BrandColors.primary} />
                  </View>
                  <View className="flex-1 ml-3">
                    <Body className="font-semibold">Get notified</Body>
                    <Caption>
                      We&apos;ll let you know when new content drops
                    </Caption>
                  </View>
                  <TouchableOpacity className="px-4 py-2 rounded-full bg-brand-primary">
                    <Body className="text-white text-sm font-semibold">Enable</Body>
                  </TouchableOpacity>
                </View>
              </View>
            </FadeIn>
          </View>
        </Section>
      </ScrollView>
    </View>
  );
}
