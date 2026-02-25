import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

function RootNavigator() {
  const { user, isLoading } = useAuth();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login');
      }
    }
  }, [user, isLoading]);

  if (isLoading) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="quiz-results" />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen name="checkout/delivery" />
        <Stack.Screen name="checkout/payment" />
        <Stack.Screen name="checkout/confirmation" />
        <Stack.Screen name="order/[id]" />
        <Stack.Screen name="admin" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <RootNavigator />
      </CartProvider>
    </AuthProvider>
  );
}
