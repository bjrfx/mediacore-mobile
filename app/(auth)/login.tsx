import * as Google from 'expo-auth-session/providers/google';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';

import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { FadeIn } from '@/components/ui/fade-in';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Body, Caption, Title } from '@/components/ui/typography';
import { BrandColors, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/auth-store';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { login, googleLogin, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '818159728878-udbotiht850dorm5boqkm9tbr8tejukm.apps.googleusercontent.com', // Web Client ID
    iosClientId: '818159728878-udbotiht850dorm5boqkm9tbr8tejukm.apps.googleusercontent.com', // Fallback to Web ID for Expo Go
    androidClientId: '818159728878-udbotiht850dorm5boqkm9tbr8tejukm.apps.googleusercontent.com', // Fallback to Web ID for Expo Go
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.idToken) {
        // If we get an idToken directly (implicit flow)
        handleGoogleAuthSuccess(authentication.idToken);
      } else if (authentication?.accessToken) {
        // If we only get an accessToken, we might need to fetch the idToken or user info
        // However, useAuthRequest typically returns idToken if configured correctly or if using OpenID
        // For now, let's assume we might need to fetch user info if idToken is missing
        // But our backend expects idToken. 
        // Google's discovery doc usually includes id_token in response_type for implicit flow.
        // The default responseType for expo-auth-session/providers/google is 'token' (accessToken).
        // We might need to adjust it if we want id_token.
        // Actually, for Google provider, it tries to get id_token if scopes include 'openid' (default).
        // Let's check if idToken is present.
        if (authentication.idToken) {
           handleGoogleAuthSuccess(authentication.idToken);
        } else {
           // Fallback: use accessToken to get user info, but our backend needs idToken to verify.
           // We'll trust that idToken is returned for now as we are using the default scopes.
           Alert.alert('Error', 'No ID token received from Google');
        }
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
            <IconSymbol name="waveform" size={64} color={BrandColors.primary} />
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
                Don't have an account?{' '}
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
