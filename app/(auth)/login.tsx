import * as Google from 'expo-auth-session/providers/google';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';

import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { FadeIn } from '@/components/ui/fade-in';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Body, Caption, Title } from '@/components/ui/typography';
import { BrandColors, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/auth-store';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { login, googleLogin, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [, response, promptAsync] = Google.useAuthRequest({
    iosClientId: '818159728878-3l0ka1bpsk2ib1u1emvpt0ssp8e52d9k.apps.googleusercontent.com',
    androidClientId: '818159728878-2u54a7cvordkurbvqgfcvgcspu2907p4.apps.googleusercontent.com',
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken;
      if (idToken) {
        handleGoogleAuthSuccess(idToken);
      } else {
        Alert.alert('Error', 'No ID token received from Google');
      }
    } else if (response?.type === 'error') {
      Alert.alert('Google Login Error', response.error?.message || 'Something went wrong');
    }
  }, [response]);

  const handleGoogleAuthSuccess = async (idToken: string) => {
    try {
      await googleLogin(idToken);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Google Login Failed', error.message || 'Something went wrong');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Something went wrong');
    }
  };

  const handleGoogleLogin = () => {
    promptAsync();
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
            <Title className="text-3xl mt-4">MediaCore</Title>
            <Body className="text-center text-secondary dark:text-secondary-dark mt-2">
              Welcome back! Please sign in to continue.
            </Body>
          </View>

          <View className="space-y-4">
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
                placeholder="Enter your password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="p-4 rounded-xl bg-surface dark:bg-surface-dark text-primary dark:text-primary-dark border border-border dark:border-border-dark"
                style={{ color: colors.text }}
              />
            </View>

            <AnimatedPressable
              onPress={handleLogin}
              disabled={isLoading}
              className="bg-brand-primary p-4 rounded-xl items-center justify-center mt-4"
              style={{ backgroundColor: BrandColors.primary }}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Body className="text-white font-bold">Sign In</Body>
              )}
            </AnimatedPressable>

            <View className="flex-row items-center justify-center my-4">
              <View className="h-px flex-1 bg-border dark:bg-border-dark" />
              <Caption className="mx-4">OR</Caption>
              <View className="h-px flex-1 bg-border dark:bg-border-dark" />
            </View>

            <AnimatedPressable
              onPress={handleGoogleLogin}
              disabled={isLoading}
              className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark p-4 rounded-xl flex-row items-center justify-center"
            >
               <IconSymbol name="g.circle.fill" size={24} color={colors.text} />
               <Body className="ml-3 font-semibold">Sign in with Google</Body>
            </AnimatedPressable>

            <View className="flex-row justify-center mt-6">
              <Body className="text-secondary dark:text-secondary-dark">
                Don’t have an account?{' '}
              </Body>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                  <Body style={{ color: BrandColors.primary }}>Sign Up</Body>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </FadeIn>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
