import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

function CartTabIcon({ color, size }: { color: string; size: number }) {
  const { cartCount } = useCart();
  return (
    <View>
      <Ionicons name="bag-outline" size={size} color={color} />
      {cartCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const { isAdmin } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#C2185B',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#F0D0E0',
          borderTopWidth: 1.5,
          paddingBottom: 8,
          paddingTop: 6,
          height: 64,
          shadowColor: '#C2185B',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 12,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Quiz',
          tabBarIcon: ({ color, size }) => <Ionicons name="sparkles-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size }) => <CartTabIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute', top: -4, right: -8,
    backgroundColor: '#C2185B', borderRadius: 10,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#fff',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
});
