/**
 * Search Screen
 * Inspired by: Spotify's search, YouTube Music's category browsing
 * 
 * Features:
 * - Prominent search bar with animations
 * - Category grid with vibrant colors
 * - Recent searches
 * - Trending searches
 */

import { MediaCard } from '@/components/media/media-card';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { FadeIn } from '@/components/ui/fade-in';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Section } from '@/components/ui/section';
import { Body, Caption, Title } from '@/components/ui/typography';
import { BrandColors, Colors } from '@/constants/theme';
import { CATEGORIES, MediaItem } from '@/data/mock';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { publicApi } from '@/services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 12;
const GRID_COLUMNS = 2;
const CARD_WIDTH = (SCREEN_WIDTH - 32 - GRID_GAP) / GRID_COLUMNS;

// Category colors for browse cards
const CATEGORY_COLORS: Record<string, string[]> = {
  All: [BrandColors.primary, BrandColors.primaryDark],
  Electronic: ['#1DB954', '#191414'],
  House: ['#E91E63', '#9C27B0'],
  Ambient: ['#00BCD4', '#009688'],
  Documentary: ['#FF5722', '#E64A19'],
  Jazz: ['#FF9800', '#F57C00'],
  Art: ['#9C27B0', '#673AB7'],
  Rock: ['#F44336', '#D32F2F'],
  Pop: ['#E91E63', '#C2185B'],
  Classical: ['#3F51B5', '#303F9F'],
};

const TRENDING_SEARCHES = [
  'Midnight City',
  'Ambient sounds',
  'Jazz collection',
  'Workout mix',
  'Study music',
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const feedData = await publicApi.getFeed({ limit: 50 }); // Fetch more for search
      
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
        }));
        setAllMedia(mappedItems);
      }
    } catch (err) {
      console.error('Failed to fetch search data:', err);
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

  // Filter results based on search query
  const searchResults = searchQuery
    ? allMedia.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const browseCategories = CATEGORIES.filter((cat) => cat !== 'All');

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      {/* Header */}
      <View
        className="px-4 pb-4"
        style={{ paddingTop: insets.top + 8 }}
      >
        <FadeIn delay={100}>
          <Title className="text-3xl mb-4">Search</Title>
        </FadeIn>

        {/* Search Input */}
        <FadeIn delay={150}>
          <View
            className={`flex-row items-center bg-surface dark:bg-surface-dark rounded-2xl px-4 py-3 border-2 ${
              isFocused
                ? 'border-brand-primary'
                : 'border-transparent'
            }`}
          >
            <IconSymbol
              name="magnifyingglass"
              size={22}
              color={isFocused ? BrandColors.primary : colors.icon}
            />
            <TextInput
              placeholder="Songs, artists, albums..."
              placeholderTextColor={colors.textTertiary}
              className="flex-1 ml-3 text-base text-primary dark:text-primary-dark"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <IconSymbol
                  name="xmark.circle.fill"
                  size={20}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
            )}
          </View>
        </FadeIn>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 180 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Results */}
        {searchQuery.length > 0 ? (
          <View className="px-4">
            {searchResults.length > 0 ? (
              <>
                <Caption className="mb-3 text-secondary dark:text-secondary-dark">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </Caption>
                {searchResults.map((item, index) => (
                  <FadeIn key={item.id} delay={index * 50}>
                    <MediaCard item={item} variant="vertical" />
                  </FadeIn>
                ))}
              </>
            ) : (
              <FadeIn delay={100}>
                <View className="items-center py-12">
                  <IconSymbol
                    name="magnifyingglass"
                    size={48}
                    color={colors.textTertiary}
                  />
                  <Body className="mt-4 text-secondary dark:text-secondary-dark">
                    No results for &quot;{searchQuery}&quot;
                  </Body>
                  <Caption className="mt-2 text-center">
                    Try searching for something else
                  </Caption>
                </View>
              </FadeIn>
            )}
          </View>
        ) : (
          <>
            {/* Trending Searches */}
            <FadeIn delay={200}>
              <Section title="Trending Searches">
                <View className="px-4">
                  <View className="flex-row flex-wrap gap-2">
                    {TRENDING_SEARCHES.map((term, index) => (
                      <TouchableOpacity
                        key={term}
                        onPress={() => setSearchQuery(term)}
                        className="px-4 py-2 rounded-full bg-surface dark:bg-surface-dark flex-row items-center"
                      >
                        <IconSymbol
                          name="magnifyingglass"
                          size={14}
                          color={colors.textSecondary}
                        />
                        <Body className="ml-2 text-sm">{term}</Body>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </Section>
            </FadeIn>

            {/* Browse Categories */}
            <FadeIn delay={300}>
              <Section title="Browse All">
                <View className="px-4">
                  <View className="flex-row flex-wrap gap-3">
                    {browseCategories.map((category, index) => {
                      const categoryColors = (CATEGORY_COLORS[category] || [
                        BrandColors.primary,
                        BrandColors.primaryDark,
                      ]) as [string, string];
                      return (
                        <FadeIn key={category} delay={350 + index * 50}>
                          <AnimatedPressable
                            onPress={() => setSearchQuery(category)}
                            style={{ width: CARD_WIDTH }}
                            className="h-24 rounded-2xl overflow-hidden"
                          >
                            <LinearGradient
                              colors={categoryColors}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              className="flex-1 p-4 justify-end"
                            >
                              <Body className="text-white font-bold text-lg">
                                {category}
                              </Body>
                            </LinearGradient>
                          </AnimatedPressable>
                        </FadeIn>
                      );
                    })}
                  </View>
                </View>
              </Section>
            </FadeIn>
          </>
        )}
      </ScrollView>
    </View>
  );
}
