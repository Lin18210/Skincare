import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  TextInput, FlatList, ActivityIndicator, SafeAreaView, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';

const CATEGORY_ALL = 'All';

export default function ProductsScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_ALL);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart, cartItems } = useCart();
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/api/products'),
        api.get('/api/categories'),
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
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

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.image_url }} style={styles.productImg} resizeMode="cover" />
      <View style={styles.cardBadge}>
        <Text style={styles.cardBadgeText}>{item.categories?.icon} {item.categories?.name}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.brand} numberOfLines={1}>{item.brand}</Text>
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
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Skincare Shop</Text>
        <Text style={styles.count}>{filtered.length} products</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#AD7FA0" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products or brands..."
          placeholderTextColor="#C4A9BA"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#AD7FA0" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
        {[CATEGORY_ALL, ...categories.map(c => c.name)].map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.catChipText, selectedCategory === cat && styles.catChipTextActive]}>
              {cat === CATEGORY_ALL ? '🌸 All' : `${categories.find(c => c.name === cat)?.icon || ''} ${cat}`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loader}><ActivityIndicator color="#C2185B" size="large" /></View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderProduct}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF0F5' },
  header: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#2D2D2D' },
  count: { fontSize: 13, color: '#AD7FA0', fontWeight: '600' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 14, padding: 12,
    borderWidth: 1.5, borderColor: '#F0D0E0',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#333' },
  categoryRow: { paddingHorizontal: 20, paddingVertical: 14, gap: 8 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#F0D0E0',
  },
  catChipActive: { backgroundColor: '#C2185B', borderColor: '#C2185B' },
  catChipText: { fontSize: 13, color: '#AD7FA0', fontWeight: '600' },
  catChipTextActive: { color: '#fff' },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  grid: { paddingHorizontal: 12, paddingBottom: 40 },
  row: { justifyContent: 'space-between' },
  card: {
    width: '48%', backgroundColor: '#fff', borderRadius: 18, marginBottom: 14,
    overflow: 'hidden', borderWidth: 1.5, borderColor: '#F0D0E0',
    shadowColor: '#C2185B', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  productImg: { width: '100%', height: 150 },
  cardBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  cardBadgeText: { fontSize: 10, fontWeight: '700', color: '#C2185B' },
  cardInfo: { padding: 12 },
  brand: { fontSize: 10, color: '#999', fontWeight: '700', textTransform: 'uppercase' },
  name: { fontSize: 13, fontWeight: '700', color: '#333', marginVertical: 4, lineHeight: 18 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  price: { fontSize: 16, fontWeight: '800', color: '#C2185B' },
  addBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#C2185B', alignItems: 'center', justifyContent: 'center', shadowColor: '#C2185B', shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
  addBtnIn: { backgroundColor: '#4CAF50' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 50 },
  emptyText: { fontSize: 16, color: '#AD7FA0', marginTop: 12, fontWeight: '600' },
});
