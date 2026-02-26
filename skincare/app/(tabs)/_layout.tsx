import React, { useState, useEffect, useRef } from 'react';
import { Tabs, useRouter, usePathname } from 'expo-router';
import {
  View, Text, StyleSheet, Platform, StatusBar, Pressable, useWindowDimensions, Animated
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

// ── Tab Item Component ─────────────────────────────────────
function TabItem({ tab, isFocused, cartCount, onPress, isMobile }: any) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable 
      style={[
        isMobile ? styles.mobileTab : styles.tab, 
        isHovered && Platform.OS === 'web' && { transform: [{ scale: isMobile ? 1.02 : 1.08 }], opacity: 0.8 }
      ]} 
      onPress={onPress} 
      // @ts-ignore
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
    >
      <View>
        <Ionicons
          name={tab.icon as any}
          size={isMobile ? 24 : 26}
          color={isFocused ? '#1A1A1A' : isHovered && Platform.OS === 'web' ? '#333333' : '#666666'}
        />
        {tab.id === 'cart' && cartCount > 0 && (
          <View style={[styles.badge, isMobile && { top: -4, right: -6 }]}>
            <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
          </View>
        )}
      </View>
      <Text style={[
        isMobile ? styles.mobileTabLabel : styles.tabLabel, 
        isFocused && styles.tabLabelActive,
        isHovered && !isFocused && Platform.OS === 'web' && { color: '#333333' }
      ]}>
        {tab.label}
      </Text>
    </Pressable>
  );
}

// ── Custom top navigation bar ──────────────────────────────
function TopNavBar() {
  const { cartCount } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isMobile = width < 768; // Mobile breakpoint
  
  const statusBarH = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;
  
  const [logoHovered, setLogoHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;

  // Close menu when switching from mobile to desktop
  useEffect(() => {
    if (!isMobile) setMenuOpen(false);
  }, [isMobile]);

  useEffect(() => {
    Animated.timing(menuAnim, {
      toValue: menuOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [menuOpen, menuAnim]);

  return (
    <View style={{ zIndex: 100 }}>
      <View style={[styles.bar, { paddingTop: statusBarH + 12 }]}>
        {/* Logo */}
        <Pressable 
          onPress={() => router.push('/(tabs)')} 
          // @ts-ignore
          onHoverIn={() => setLogoHovered(true)}
          onHoverOut={() => setLogoHovered(false)}
          style={[
            logoHovered && Platform.OS === 'web' && { transform: [{ scale: 1.05 }], opacity: 0.9 }
          ]}
        >
          <Text style={styles.logo}>✨ CutieSkin</Text>
        </Pressable>

        {/* Tabs or Hamburger */}
        {isMobile ? (
          <Pressable onPress={() => setMenuOpen(!menuOpen)} style={styles.hamburgerBtn}>
            <Ionicons name={menuOpen ? "close" : "menu"} size={32} color="#1A1A1A" />
          </Pressable>
        ) : (
          <View style={styles.tabs}>
            {TABS.map(tab => {
              const isFocused = (tab.id === 'index' && pathname === '/') || 
                                (tab.id !== 'index' && pathname.includes(tab.id));
              return (
                <TabItem 
                  key={tab.id} 
                  tab={tab} 
                  isFocused={isFocused} 
                  cartCount={cartCount} 
                  onPress={() => router.push(tab.route as any)} 
                />
              );
            })}
          </View>
        )}
      </View>

      {/* Mobile Menu Dropdown */}
      {isMobile && (
        <Animated.View 
          style={[
            styles.mobileMenu,
            { 
              opacity: menuAnim,
              transform: [
                { translateY: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }
              ]
            }
          ]}
          pointerEvents={menuOpen ? 'auto' : 'none'}
        >
          {TABS.map(tab => {
            const isFocused = (tab.id === 'index' && pathname === '/') || 
                              (tab.id !== 'index' && pathname.includes(tab.id));
            return (
              <TabItem 
                key={tab.id} 
                tab={tab} 
                isFocused={isFocused} 
                cartCount={cartCount} 
                onPress={() => {
                  setMenuOpen(false);
                  router.push(tab.route as any);
                }} 
                isMobile={true}
              />
            );
          })}
        </Animated.View>
      )}
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
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: '#EAEAEA',
    shadowColor: '#1A1A1A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 100, // Ensure it stays on top
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 4,
  },
  mobileTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
  },
  mobileTabLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666666',
  },
  tabLabelActive: {
    color: '#1A1A1A',
  },
  badge: {
    position: 'absolute', top: -6, right: -10,
    backgroundColor: '#1A1A1A', borderRadius: 10,
    minWidth: 18, height: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#fff',
    zIndex: 10,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  hamburgerBtn: {
    padding: 6,
    marginRight: -6,
  },
  mobileMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingBottom: 16, // Extra padding at bottom
    borderBottomWidth: 1.5,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomColor: '#EAEAEA',
    shadowColor: '#1A1A1A',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 90,
  },
});
