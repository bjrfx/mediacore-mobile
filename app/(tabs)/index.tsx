/**
 * Home Screen
 * Inspired by: Spotify's personalized home, Apple Music's editorial approach
 * 
 * Features:
 * - Hero featured content
 * - Horizontal carousels for different categories
 * - Quick actions
 * - Personalized sections
 */

import { MediaCard } from '@/components/media/media-card';
import { FadeIn } from '@/components/ui/fade-in';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Section } from '@/components/ui/section';
import { Body, Caption, Title } from '@/components/ui/typography';
import { BrandColors, Colors } from '@/constants/theme';
import { CATEGORIES, MOCK_DATA } from '@/data/mock';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { Dimensions, FlatList, ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

Dimensions.get('window');

// Quick action buttons for common actions
const QUICK_ACTIONS = [
  { id: 'liked', icon: 'heart.fill', label: 'Liked', color: BrandColors.tertiary },
  { id: 'recent', icon: 'clock.fill', label: 'Recent', color: BrandColors.secondary },
  { id: 'downloads', icon: 'arrow.down.circle.fill', label: 'Downloads', color: BrandColors.primary },
  { id: 'playlists', icon: 'music.note', label: 'Playlists', color: BrandColors.warning },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  
  const featuredItem = MOCK_DATA[3];
  const trendingItems = MOCK_DATA.slice(0, 4);
  const recentItems = MOCK_DATA.slice(2, 6);
  const forYouItems = [...MOCK_DATA].reverse().slice(0, 4);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

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
              <View>
                <Caption className="text-secondary dark:text-secondary-dark mb-1">
                  {getGreeting()}
                </Caption>
                <Title className="text-3xl">Discover</Title>
              </View>
              
              <View className="flex-row items-center gap-3">
                <TouchableOpacity className="w-10 h-10 rounded-full bg-surface dark:bg-surface-dark items-center justify-center">
                  <IconSymbol name="bell" size={22} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => router.push('/profile')}
                  className="w-10 h-10 rounded-full bg-surface dark:bg-surface-dark items-center justify-center"
                >
                  <IconSymbol name="person.crop.circle" size={22} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          </FadeIn>
        </View>

        {/* Quick Actions */}
        <FadeIn delay={150}>
          <View className="px-4 mb-6">
            <View className="flex-row gap-3">
              {QUICK_ACTIONS.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  className="flex-1 bg-surface dark:bg-surface-dark rounded-xl p-4 items-center justify-center overflow-hidden"
                  activeOpacity={0.9}
                >
                  <View
                    className="w-10 h-10 rounded-lg items-center justify-center"
                    style={{ backgroundColor: action.color + '20' }}
                  >
                    <IconSymbol name={action.icon} size={20} color={action.color} />
                  </View>
                  <Body className="text-xs font-medium text-center mt-2" numberOfLines={1}>
                    {action.label}
                  </Body>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </FadeIn>

        {/* Featured Hero */}
        <FadeIn delay={200}>
          <View className="px-4 mb-6">
            <TouchableOpacity
              className="rounded-3xl overflow-hidden"
              activeOpacity={0.9}
            >
              <MediaCard item={featuredItem} variant="featured" />
            </TouchableOpacity>
          </View>
        </FadeIn>

        {/* Trending Now */}
        <Section
          title="Trending Now"
          action={
            <TouchableOpacity>
              <Caption className="text-brand-primary">See all</Caption>
            </TouchableOpacity>
          }
        >
          <FadeIn delay={300}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={trendingItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <MediaCard item={item} variant="horizontal" />
              )}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            />
          </FadeIn>
        </Section>

        {/* Categories Pills */}
        <FadeIn delay={350}>
          <View className="mb-6">
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={CATEGORIES.slice(0, 6)}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity className="px-4 py-2 rounded-full bg-surface dark:bg-surface-dark mr-2">
                  <Body className="text-sm font-medium">{item}</Body>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            />
          </View>
        </FadeIn>

        {/* For You */}
        <Section
          title="Made for You"
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
              data={forYouItems}
              keyExtractor={(item) => `foryou-${item.id}`}
              renderItem={({ item }) => (
                <MediaCard item={item} variant="horizontal" />
              )}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            />
          </FadeIn>
        </Section>

        {/* Recently Played */}
        <Section title="Recently Played">
          <View className="px-4">
            {recentItems.map((item, index) => (
              <FadeIn key={item.id} delay={500 + index * 50}>
                <MediaCard item={item} variant="vertical" />
              </FadeIn>
            ))}
          </View>
        </Section>
      </ScrollView>
    </View>
  );
}
