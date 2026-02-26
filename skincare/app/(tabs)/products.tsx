import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  TextInput, FlatList, ActivityIndicator, SafeAreaView, Alert,
  useWindowDimensions, Animated
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { getLocalImage } from '@/lib/images';

const CATEGORY_ALL = 'All';

// Animated Card Component for a professional feel
function ProductCard({ item, index, isInCart, adding, handleAdd, cardWidth }: any) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={[styles.card, { width: cardWidth, transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id, itemIndex: index } })}
      >
        <Image source={getLocalImage(index)} style={styles.productImg} resizeMode="cover" />
        <View style={styles.cardBadge}>
          <Text style={styles.cardBadgeText}>{item.categories?.icon} {item.categories?.name}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.brand} numberOfLines={1}>{item.brand || 'ESSENTIALS'}</Text>
          <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          <View style={styles.cardBottom}>
            <Text style={styles.price}>${item.price?.toFixed(2)}</Text>
            <TouchableOpacity
              style={[styles.addBtn, isInCart(item.id) && styles.addBtnIn]}
              onPress={() => handleAdd(item.id)}
              disabled={adding === item.id}
            >
              {adding === item.id
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name={isInCart(item.id) ? 'checkmark' : 'add'} size={18} color="#fff" />}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function ProductsScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_ALL);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart, cartItems } = useCart();
  const [adding, setAdding] = useState<string | null>(null);
  const { width } = useWindowDimensions();

  const numColumns = width >= 1024 ? 4 : width >= 768 ? 3 : 2;
  const cardGap = 16;
  const paddingHorizontal = 16;
  const cardWidth = (width - (paddingHorizontal * 2) - ((numColumns - 1) * cardGap)) / numColumns;

  // Entrance animation for list
  const listOpacity = useRef(new Animated.Value(0)).current;
  const listTranslateY = useRef(new Animated.Value(20)).current;

  const animateList = useCallback(() => {
    listOpacity.setValue(0);
    listTranslateY.setValue(20);
    Animated.parallel([
      Animated.timing(listOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(listTranslateY, { toValue: 0, tension: 40, friction: 8, useNativeDriver: true })
    ]).start();
  }, [listOpacity, listTranslateY]);

  useFocusEffect(
    useCallback(() => {
      // Re-trigger animation on returning to the tab
      if (!loading && products.length > 0) {
        animateList();
      }
    }, [animateList, loading, products.length])
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    listOpacity.setValue(0);
    listTranslateY.setValue(20);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/api/products'),
        api.get('/api/categories'),
      ]);

      const productMap = new Map();
      prodRes.data.forEach((p: any) => {
        if (!productMap.has(p.name)) {
          productMap.set(p.name, p);
        }
      });

      setProducts(Array.from(productMap.values()));
      setCategories(catRes.data);
      animateList();
      
    } catch { Alert.alert('Error', 'Failed to load products.'); }
    finally { setLoading(false); }
  };

  const filtered = products.filter(p => {
    const matchCat = selectedCategory === CATEGORY_ALL || p.categories?.name === selectedCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAdd = async (id: string) => {
    setAdding(id);
    try { await addToCart(id, 1); } catch { Alert.alert('Error', 'Could not add to cart.'); }
    finally { setAdding(null); }
  };

  const isInCart = (id: string) => cartItems.some(i => i.product_id === id);

  const renderProduct = ({ item, index }: { item: any, index: number }) => (
    <ProductCard 
      item={item} 
      index={index}
      isInCart={isInCart} 
      adding={adding} 
      handleAdd={handleAdd} 
      cardWidth={cardWidth} 
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Collection</Text>
        <Text style={styles.count}>{filtered.length} products</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#666666" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search minimalist routines..."
          placeholderTextColor="#999999"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#666666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category pills */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {[CATEGORY_ALL, ...categories.map(c => c.name)].map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.catChipText, selectedCategory === cat && styles.catChipTextActive]}>
                {cat === CATEGORY_ALL ? '✨ All' : `${categories.find(c => c.name === cat)?.icon || ''} ${cat}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loader}><ActivityIndicator color="#1A1A1A" size="large" /></View>
      ) : (
        <Animated.View style={{ flex: 1, opacity: listOpacity, transform: [{ translateY: listTranslateY }] }}>
          <FlatList
            key={numColumns}
            data={filtered}
            renderItem={renderProduct}
            keyExtractor={item => item.id}
            numColumns={numColumns}
            columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={styles.emptyText}>No products found</Text>
              </View>
            }
          />
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCF8F8' }, // Rosy white
  header: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: '#B47B84', letterSpacing: -0.5 }, // Dusty Rose Title
  count: { fontSize: 13, color: '#8A8082', fontWeight: '500' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#F2E6E8',
    shadowColor: '#B47B84', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#3A3435' },
  categoryRow: { paddingHorizontal: 20, paddingVertical: 18, gap: 10 },
  catChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#F2E6E8',
  },
  catChipActive: { backgroundColor: '#B47B84', borderColor: '#B47B84' },
  catChipText: { fontSize: 13, color: '#8A8082', fontWeight: '600', letterSpacing: 0.3 },
  catChipTextActive: { color: '#fff' },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  grid: { paddingHorizontal: 16, paddingBottom: 40 },
  row: { justifyContent: 'space-between' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 16,
    overflow: 'hidden', borderWidth: 1, borderColor: '#F2E6E8',
    shadowColor: '#B47B84', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  productImg: { width: '100%', height: 220, backgroundColor: '#FCF8F8' },
  cardBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  cardBadgeText: { fontSize: 10, fontWeight: '700', color: '#B47B84', letterSpacing: 0.5 },
  cardInfo: { padding: 16 },
  brand: { fontSize: 11, color: '#A06D74', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.2 },
  name: { fontSize: 15, fontWeight: '700', color: '#3A3435', marginVertical: 6, lineHeight: 20 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  price: { fontSize: 18, fontWeight: '700', color: '#3A3435' },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#B47B84', alignItems: 'center', justifyContent: 'center', shadowColor: '#B47B84', shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 }, // Rose add button
  addBtnIn: { backgroundColor: '#A06D74' }, // Darker rose for active
  empty: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 50 },
  emptyText: { fontSize: 16, color: '#8A8082', marginTop: 12, fontWeight: '500' },
});
