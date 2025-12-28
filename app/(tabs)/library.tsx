/**
 * Library Screen
 * Inspired by: Spotify's Your Library, Apple Music's Library
 * 
 * Features:
 * - Organized content sections
 * - Quick filters (playlists, artists, albums)
 * - Downloads section
 * - Recently added
 * - Sorting options
 */

import { MediaCard } from '@/components/media/media-card';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { Card } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/fade-in';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Section } from '@/components/ui/section';
import { Body, Caption, Title } from '@/components/ui/typography';
import { BrandColors, Colors } from '@/constants/theme';
import { MOCK_DATA } from '@/data/mock';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePlayerStore } from '@/store/player-store';
import { useLibraryStore } from '@/store/library-store';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { FlatList, ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Filter options
const FILTERS = [
  { id: 'all', label: 'All', icon: 'square.stack' },
  { id: 'playlists', label: 'Playlists', icon: 'music.note' },
  { id: 'artists', label: 'Artists', icon: 'person.circle' },
  { id: 'albums', label: 'Albums', icon: 'square.stack.fill' },
  { id: 'downloads', label: 'Downloads', icon: 'arrow.down.circle' },
];

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [activeFilter, setActiveFilter] = useState('all');
  const queue = usePlayerStore((state) => state.queue);
  const history = usePlayerStore((state) => state.history);
  const likedSongs = useLibraryStore((state) => state.likedSongs);

  // Library sections with icons
  const LIBRARY_SECTIONS = [
    {
      id: 'liked',
      title: 'Liked Songs',
      subtitle: `${likedSongs.length} songs`,
      icon: 'heart.fill',
      color: BrandColors.tertiary,
      gradient: [BrandColors.tertiary, BrandColors.primary] as const,
    },
    {
      id: 'recent',
      title: 'Recently Played',
      subtitle: 'Updated today',
      icon: 'clock.fill',
      color: BrandColors.secondary,
      gradient: [BrandColors.secondary, BrandColors.primaryDark] as const,
    },
    {
      id: 'queue',
      title: 'Play Queue',
      subtitle: `${queue.length} items`,
      icon: 'list.bullet',
      color: BrandColors.primary,
      gradient: [BrandColors.primary, BrandColors.tertiary] as const,
    },
  ];

  const savedItems = likedSongs.slice(0, 4);
  const downloadedItems: typeof MOCK_DATA = []; // Empty for demo

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
            <View className="flex-row items-center justify-between mb-4">
              <Title className="text-3xl">Library</Title>
              <View className="flex-row items-center gap-3">
                <TouchableOpacity className="w-10 h-10 rounded-full bg-surface dark:bg-surface-dark items-center justify-center">
                  <IconSymbol name="magnifyingglass" size={20} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity className="w-10 h-10 rounded-full bg-surface dark:bg-surface-dark items-center justify-center">
                  <IconSymbol name="plus" size={22} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          </FadeIn>

          {/* Filters */}
          <FadeIn delay={150}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={FILTERS}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setActiveFilter(item.id)}
                  className={`mr-2 px-4 py-2 rounded-full flex-row items-center ${
                    activeFilter === item.id
                      ? 'bg-brand-primary'
                      : 'bg-surface dark:bg-surface-dark'
                  }`}
                >
                  <IconSymbol
                    name={item.icon}
                    size={16}
                    color={activeFilter === item.id ? '#FFFFFF' : colors.textSecondary}
                  />
                  <Body
                    className={`ml-2 text-sm font-medium ${
                      activeFilter === item.id ? 'text-white' : ''
                    }`}
                  >
                    {item.label}
                  </Body>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingRight: 16 }}
            />
          </FadeIn>
        </View>

        {/* Library Sections */}
        <FadeIn delay={200}>
          <View className="px-4 mb-6">
            {LIBRARY_SECTIONS.map((section, index) => (
              <AnimatedPressable
                key={section.id}
                className="mb-3"
              >
                <LinearGradient
                  colors={section.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="rounded-2xl p-4 flex-row items-center"
                >
                  <View className="w-12 h-12 rounded-xl bg-white/20 items-center justify-center">
                    <IconSymbol name={section.icon} size={24} color="#FFFFFF" />
                  </View>
                  <View className="flex-1 ml-4">
                    <Body className="text-white font-semibold text-lg">
                      {section.title}
                    </Body>
                    <Caption className="text-white/70">{section.subtitle}</Caption>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color="rgba(255,255,255,0.6)" />
                </LinearGradient>
              </AnimatedPressable>
            ))}
          </View>
        </FadeIn>

        {/* Downloads Section */}
        <Section title="Downloads">
          <View className="px-4">
            <FadeIn delay={300}>
              {downloadedItems.length > 0 ? (
                downloadedItems.map((item) => (
                  <MediaCard key={item.id} item={item} variant="vertical" />
                ))
              ) : (
                <Card variant="outlined" className="border-dashed">
                  <View className="items-center py-6">
                    <View className="w-16 h-16 rounded-full bg-surface dark:bg-surface-dark items-center justify-center mb-3">
                      <IconSymbol
                        name="arrow.down.circle"
                        size={32}
                        color={colors.textTertiary}
                      />
                    </View>
                    <Body className="text-secondary dark:text-secondary-dark font-medium">
                      No downloads yet
                    </Body>
                    <Caption className="text-center mt-1 px-8">
                      Download media to listen offline without using data
                    </Caption>
                    <TouchableOpacity className="mt-4 px-6 py-2.5 rounded-full bg-brand-primary">
                      <Body className="text-white font-semibold text-sm">
                        Browse Content
                      </Body>
                    </TouchableOpacity>
                  </View>
                </Card>
              )}
            </FadeIn>
          </View>
        </Section>

        {/* Queue Preview */}
        {queue.length > 0 && (
          <Section
            title="Up Next"
            action={
              <TouchableOpacity>
                <Caption className="text-brand-primary">
                  {queue.length} tracks
                </Caption>
              </TouchableOpacity>
            }
          >
            <View className="px-4">
              {queue.slice(0, 3).map((item, index) => (
                <FadeIn key={`queue-${item.id}`} delay={400 + index * 50}>
                  <MediaCard item={item} variant="vertical" />
                </FadeIn>
              ))}
            </View>
          </Section>
        )}

        {/* Saved Items */}
        <Section
          title="Added Recently"
          action={
            <TouchableOpacity>
              <Caption className="text-brand-primary">See all</Caption>
            </TouchableOpacity>
          }
        >
          <View className="px-4">
            {savedItems.map((item, index) => (
              <FadeIn key={item.id} delay={500 + index * 50}>
                <MediaCard item={item} variant="vertical" />
              </FadeIn>
            ))}
          </View>
        </Section>

        {/* Storage Info */}
        <FadeIn delay={700}>
          <View className="px-4 mt-2">
            <Card className="bg-surface dark:bg-surface-dark">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-lg bg-brand-primary/20 items-center justify-center">
                  <IconSymbol name="gear" size={20} color={BrandColors.primary} />
                </View>
                <View className="flex-1 ml-3">
                  <Body className="font-medium">Manage Storage</Body>
                  <Caption>0 MB used • Free up space</Caption>
                </View>
                <IconSymbol name="chevron.right" size={18} color={colors.textTertiary} />
              </View>
            </Card>
          </View>
        </FadeIn>
      </ScrollView>
    </View>
  );
}
