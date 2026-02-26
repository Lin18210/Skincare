import { Stack, router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export default function AdminLayout() {
  const { isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAdmin) router.replace('/(tabs)');
  }, [isAdmin, isLoading]);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1A1A1A' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 4 }}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: '👑 Admin Dashboard' }} />
      <Stack.Screen name="products" options={{ title: 'Products' }} />
      <Stack.Screen name="product-form" options={{ title: 'Edit Product' }} />
      <Stack.Screen name="orders" options={{ title: 'All Orders' }} />
      <Stack.Screen name="users" options={{ title: 'Users' }} />
    </Stack>
  );
}
