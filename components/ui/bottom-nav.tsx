/**
 * Custom Bottom Navigation Bar
 * Inspired by: Spotify's floating design, Apple Music's blur, YouTube Music's dynamic indicator
 * 
 * Features:
 * - Glassmorphic background with blur
 * - Animated active indicator with glow
 * - Haptic feedback
 * - Integrated mini-player awareness
 */

import { BrandColors, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePlayerStore } from '@/store/player-store';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from './icon-symbol';
import { Caption } from './typography';

const TAB_ICONS: Record<string, { default: any; active: any }> = {
  index: { default: 'house', active: 'house.fill' },
  search: { default: 'magnifyingglass', active: 'magnifyingglass' },
  new: { default: 'plus.circle', active: 'plus.circle.fill' },
  library: { default: 'square.stack', active: 'square.stack.fill' },
};

const TAB_LABELS: Record<string, string> = {
  index: 'Home',
  search: 'Search',
  new: 'New',
  library: 'Library',
};

interface TabItemProps {
  route: any;
  index: number;
  state: any;
  navigation: any;
  descriptors: any;
}

function TabItem({ route, index, state, navigation, descriptors }: TabItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const isFocused = state.index === index;
  
  const scale = useSharedValue(1);
  const opacity = useSharedValue(isFocused ? 1 : 0.6);

  const { options } = descriptors[route.key];
  const label = TAB_LABELS[route.name] || options.title || route.name;
  const icons = TAB_ICONS[route.name] || { default: 'circle', active: 'circle.fill' };

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isFocused ? 1 : 0, { duration: 200 }),
    transform: [{ scale: withSpring(isFocused ? 1 : 0.5, { damping: 15, stiffness: 150 }) }],
  }));

  const handlePress = () => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      // Haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      navigation.navigate(route.name, route.params);
    }
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    opacity.value = withTiming(isFocused ? 1 : 0.6, { duration: 150 });
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      testID={options.tabBarTestID}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className="flex-1 items-center justify-center py-2"
    >
      <Animated.View style={animatedContainerStyle} className="items-center">
        {/* Glow indicator behind icon */}
        <Animated.View
          style={animatedIndicatorStyle}
          className="absolute -top-1 w-10 h-10 rounded-full bg-brand-primary/20"
        />
        
        <IconSymbol
          name={isFocused ? icons.active : icons.default}
          size={24}
          color={isFocused ? BrandColors.primary : colors.tabIconDefault}
        />
        
        <Caption
          className={`text-2xs mt-1 ${
            isFocused ? 'text-brand-primary font-semibold' : 'text-secondary dark:text-secondary-dark'
          }`}
        >
          {label}
        </Caption>
      </Animated.View>
    </Pressable>
  );
}

export function BottomNav({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  
  // Add extra padding when mini-player is visible
  const miniPlayerOffset = currentTrack ? 72 : 0;

  return (
    <View
      className="absolute bottom-0 left-0 right-0"
      style={{ paddingBottom: insets.bottom }}
    >
      {/* Glass background */}
      <View className="mx-3 mb-2 rounded-2xl overflow-hidden border border-white/10 dark:border-white/5">
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={80}
            tint={colorScheme === 'dark' ? 'dark' : 'light'}
            className="absolute inset-0"
          />
        ) : (
          <View className="absolute inset-0 bg-background/95 dark:bg-background-dark/95" />
        )}
        
        {/* Tab items container */}
        <View className="flex-row h-16">
          {state.routes.map((route: any, index: number) => (
            <TabItem
              key={route.key}
              route={route}
              index={index}
              state={state}
              navigation={navigation}
              descriptors={descriptors}
            />
          ))}
        </View>
        
        {/* Active indicator line */}
        <ActiveIndicator state={state} />
      </View>
    </View>
  );
}

function ActiveIndicator({ state }: { state: any }) {
  const tabWidth = 100 / state.routes.length;
  const translateX = useSharedValue(state.index * tabWidth);

  // Animate when tab changes
  translateX.value = withSpring(state.index * tabWidth, {
    damping: 20,
    stiffness: 200,
  });

  const animatedStyle = useAnimatedStyle(() => ({
    left: `${translateX.value}%`,
    width: `${tabWidth}%`,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="absolute top-0 h-0.5 items-center"
    >
      <View className="w-8 h-full rounded-full bg-brand-primary" />
    </Animated.View>
  );
}
