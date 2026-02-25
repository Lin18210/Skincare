import React from 'react';
import { Tabs, useRouter, usePathname } from 'expo-router';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';

// ── Tab definitions ────────────────────────────────────────
const TABS = [
  { id: 'index',    icon: 'sparkles-outline', label: 'Quiz',     route: '/(tabs)' },
  { id: 'products', icon: 'grid-outline',     label: 'Products', route: '/products' },
  { id: 'cart',     icon: 'bag-outline',      label: 'Cart',     route: '/cart' },
  { id: 'profile',  icon: 'person-outline',   label: 'Profile',  route: '/profile' },
];

// ── Custom top navigation bar ──────────────────────────────
function TopNavBar() {
  const { cartCount } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  
  const statusBarH = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;

  return (
    <View style={[styles.bar, { paddingTop: statusBarH + 8 }]}>
      {/* Logo */}
      <TouchableOpacity onPress={() => router.push('/(tabs)')} activeOpacity={0.7}>
        <Text style={styles.logo}>✨ CutieSkin</Text>
      </TouchableOpacity>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map(tab => {
          // Robust pathname check
          const isFocused = (tab.id === 'index' && pathname === '/') || 
                            (tab.id !== 'index' && pathname.includes(tab.id));

          return (
            <TouchableOpacity 
              key={tab.id} 
              style={styles.tab} 
              onPress={() => router.push(tab.route as any)} 
              activeOpacity={0.7}
            >
              <View>
                <Ionicons
                  name={tab.icon as any}
                  size={20}
                  color={isFocused ? '#C2185B' : '#AD7FA0'}
                />
                {tab.id === 'cart' && cartCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ── Layout ─────────────────────────────────────────────────
export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <TopNavBar />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // Keep bottom bar hidden
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="products" />
        <Tabs.Screen name="cart" />
        <Tabs.Screen name="profile" />
        <Tabs.Screen name="explore" options={{ href: null } as any} />
      </Tabs>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: '#F0D0E0',
    shadowColor: '#C2185B',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
    gap: 8,
    zIndex: 100, // Ensure it stays on top
  },
  logo: {
    fontSize: 17,
    fontWeight: '800',
    color: '#C2185B',
    letterSpacing: 0.5,
    marginRight: 4,
  },
  tabs: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 4,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#AD7FA0',
  },
  tabLabelActive: {
    color: '#C2185B',
  },
  badge: {
    position: 'absolute', top: -4, right: -8,
    backgroundColor: '#C2185B', borderRadius: 10,
    minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#fff',
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
});
