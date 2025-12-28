import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';

import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { FadeIn } from '@/components/ui/fade-in';
import { Body, Caption, Title } from '@/components/ui/typography';
import { BrandColors, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/auth-store';

export default function SignupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { register, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSignup = async () => {
    if (!email || !password || !displayName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      await register(email, password, displayName);
      Alert.alert('Success', 'Account created! Please log in.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message || 'Something went wrong');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background dark:bg-background-dark"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <FadeIn>
          <View className="items-center mb-8">
            <Image 
              source={require('@/assets/images/logo.png')} 
              style={{ width: 120, height: 120 }} 
              resizeMode="contain"
            />
            <Title className="text-3xl mt-4">Create Account</Title>
            <Body className="text-center text-secondary dark:text-secondary-dark mt-2">
              Join MediaCore today.
            </Body>
          </View>

          <View className="space-y-4">
            <View>
              <Caption className="mb-2 ml-1">Full Name</Caption>
              <TextInput
                placeholder="Enter your full name"
                placeholderTextColor={colors.textSecondary}
                value={displayName}
                onChangeText={setDisplayName}
                className="p-4 rounded-xl bg-surface dark:bg-surface-dark text-primary dark:text-primary-dark border border-border dark:border-border-dark"
                style={{ color: colors.text }}
              />
            </View>

            <View>
              <Caption className="mb-2 ml-1">Email</Caption>
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                className="p-4 rounded-xl bg-surface dark:bg-surface-dark text-primary dark:text-primary-dark border border-border dark:border-border-dark"
                style={{ color: colors.text }}
              />
            </View>

            <View>
              <Caption className="mb-2 ml-1">Password</Caption>
              <TextInput
                placeholder="Choose a password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="p-4 rounded-xl bg-surface dark:bg-surface-dark text-primary dark:text-primary-dark border border-border dark:border-border-dark"
                style={{ color: colors.text }}
              />
            </View>

            <AnimatedPressable
              onPress={handleSignup}
              disabled={isLoading}
              className="bg-brand-primary p-4 rounded-xl items-center justify-center mt-4"
              style={{ backgroundColor: BrandColors.primary }}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Body className="text-white font-bold">Sign Up</Body>
              )}
            </AnimatedPressable>

            <View className="flex-row justify-center mt-6">
              <Body className="text-secondary dark:text-secondary-dark">
                Already have an account?{' '}
              </Body>
              <TouchableOpacity onPress={() => router.back()}>
                <Body style={{ color: BrandColors.primary }}>Sign In</Body>
              </TouchableOpacity>
            </View>
          </View>
        </FadeIn>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
