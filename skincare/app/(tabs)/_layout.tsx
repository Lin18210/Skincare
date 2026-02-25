import React from 'react';
import { Tabs } from 'expo-router';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

// ── Tab definitions ────────────────────────────────────────
const TAB_ICONS: Record<string, { icon: string; label: string }> = {
  index:    { icon: 'sparkles-outline', label: 'Quiz' },
  products: { icon: 'grid-outline',     label: 'Products' },
  cart:     { icon: 'bag-outline',      label: 'Cart' },
  profile:  { icon: 'person-outline',   label: 'Profile' },
};

// ── Custom top navigation bar ──────────────────────────────
function TopNavBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { cartCount } = useCart();
  const statusBarH = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;

  const visibleRoutes = state.routes.filter(r => {
    const opts = descriptors[r.key]?.options as any;
    return opts?.href !== null;
  });

  return (
    <View style={[styles.bar, { paddingTop: statusBarH + 8 }]}>
      {/* Logo */}
      <Text style={styles.logo}>✨ CutieSkin</Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        {visibleRoutes.map(route => {
          const isFocused = state.routes[state.index]?.name === route.name;
          const meta = TAB_ICONS[route.name];
          if (!meta) return null;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <TouchableOpacity key={route.key} style={styles.tab} onPress={onPress} activeOpacity={0.7}>
              <View>
                <Ionicons
                  name={meta.icon as any}
                  size={22}
                  color={isFocused ? '#C2185B' : '#AD7FA0'}
                />
                {route.name === 'cart' && cartCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {meta.label}
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
    <Tabs
      tabBar={(props) => <TopNavBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="products" />
      <Tabs.Screen name="cart" />
      <Tabs.Screen name="profile" />
      {/* Hide explore from tab bar */}
      <Tabs.Screen name="explore" options={{ href: null } as any} />
    </Tabs>
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
