import { useRouter } from 'expo-router';
import { Alert, Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { FadeIn } from '@/components/ui/fade-in';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Body, Caption, Subtitle, Title } from '@/components/ui/typography';
import { BrandColors, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/auth-store';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { user, logout } = useAuthStore();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // The _layout.tsx will handle redirection to login
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View 
          className="px-4 pb-4 border-b border-border dark:border-border-dark"
          style={{ paddingTop: insets.top + 8 }}
        >
          <View className="flex-row items-center justify-between">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center rounded-full active:bg-surface dark:active:bg-surface-dark"
            >
              <IconSymbol name="chevron.left" size={24} color={colors.text} />
            </TouchableOpacity>
            <Title className="text-xl">Profile</Title>
            <View className="w-10" /> 
          </View>
        </View>

        <FadeIn>
          <View className="p-6 items-center">
            <View className="w-24 h-24 rounded-full bg-surface dark:bg-surface-dark items-center justify-center mb-4 overflow-hidden border-2 border-brand-primary">
              {user?.photoURL ? (
                 <Image source={{ uri: user.photoURL }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <IconSymbol name="person.fill" size={48} color={BrandColors.primary} />
              )}
            </View>
            <Title className="text-2xl text-center">{user?.displayName || 'User'}</Title>
            <Body className="text-secondary dark:text-secondary-dark mt-1">{user?.email}</Body>
            {user?.role && (
                <View className="mt-2 px-3 py-1 bg-brand-primary/10 rounded-full">
                    <Caption className="text-brand-primary font-bold uppercase text-xs">{user.role}</Caption>
                </View>
            )}
          </View>

          <View className="px-4 mt-6 gap-4">
            <Subtitle className="ml-2 mb-2">Account</Subtitle>
            
            <AnimatedPressable className="flex-row items-center justify-between p-4 bg-surface dark:bg-surface-dark rounded-2xl">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-blue-500/20 items-center justify-center">
                    <IconSymbol name="person" size={18} color="#3B82F6" />
                </View>
                <Body>Edit Profile</Body>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
            </AnimatedPressable>

            <AnimatedPressable className="flex-row items-center justify-between p-4 bg-surface dark:bg-surface-dark rounded-2xl">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-purple-500/20 items-center justify-center">
                    <IconSymbol name="bell" size={18} color="#A855F7" />
                </View>
                <Body>Notifications</Body>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
            </AnimatedPressable>

            <AnimatedPressable className="flex-row items-center justify-between p-4 bg-surface dark:bg-surface-dark rounded-2xl">
               <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-orange-500/20 items-center justify-center">
                    <IconSymbol name="gear" size={18} color="#F97316" />
                </View>
                <Body>Settings</Body>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
            </AnimatedPressable>
          </View>

          <View className="px-4 mt-8">
            <AnimatedPressable 
              onPress={handleSignOut}
              className="flex-row items-center justify-center p-4 bg-red-500/10 rounded-2xl border border-red-500/20"
            >
              <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color={BrandColors.error} />
              <Body className="ml-2 font-semibold text-red-500">Sign Out</Body>
            </AnimatedPressable>
          </View>
          
           <View className="mt-8 items-center">
             <Caption className="text-tertiary dark:text-tertiary-dark">Version 1.0.0</Caption>
           </View>

        </FadeIn>
      </ScrollView>
    </View>
  );
}
