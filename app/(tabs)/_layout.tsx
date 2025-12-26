import { MiniPlayer } from '@/components/player/mini-player';
import { BottomNav } from '@/components/ui/bottom-nav';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Tabs
          tabBar={(props) => <BottomNav {...props} />}
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' }, // Hide default tab bar
          }}
        >
          <Tabs.Screen name="index" />
          <Tabs.Screen name="search" />
          <Tabs.Screen name="new" />
          <Tabs.Screen name="library" />
        </Tabs>
        <MiniPlayer />
    </View>
  );
}
