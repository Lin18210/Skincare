import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert, Animated
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';

const getImageUrl = (url: string) => {
  if (!url) return 'https://via.placeholder.com/600';
  if (url.startsWith('/')) {
    return `${api.defaults.baseURL}${url}`;
  }
  return url;
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  
  // animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    api.get(`/api/products/${id}`).then(r => {
      setProduct(r.data);
      // start animation once data loads
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 40, friction: 7, useNativeDriver: true }),
      ]).start();
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    setAdding(true);
    try {
      await addToCart(product.id, 1);
      setAdded(true);
    } catch { Alert.alert('Error', 'Could not add to cart.'); }
    finally { setAdding(false); }
  };

  if (loading) return <View style={styles.loader}><ActivityIndicator color="#1A1A1A" size="large" /></View>;
  if (!product) return <View style={styles.loader}><Text>Product not found</Text></View>;

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        {/* Image */}
        <View style={styles.imgContainer}>
          <Image source={{ uri: getImageUrl(product.image_url) }} style={styles.img} resizeMode="cover" />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#1A1A1A" />
          </TouchableOpacity>
          <View style={styles.catBadge}>
            <Text style={styles.catBadgeText}>{product.categories?.icon} {product.categories?.name}</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.name}>{product.name}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>${product.price?.toFixed(2)}</Text>
            {product.rating > 0 && (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#FFB300" />
                <Text style={styles.rating}>{product.rating} ({product.review_count})</Text>
              </View>
            )}
          </View>

          {/* Skin labels */}
          {product.skin_types?.length > 0 && (
            <View style={styles.tagSection}>
              <Text style={styles.tagLabel}>For skin types:</Text>
              <View style={styles.tags}>
                {product.skin_types.map((t: string) => (
                  <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
                ))}
              </View>
            </View>
          )}

          {product.skin_concerns?.length > 0 && (
            <View style={styles.tagSection}>
              <Text style={styles.tagLabel}>Targets:</Text>
              <View style={styles.tags}>
                {product.skin_concerns.map((c: string) => (
                  <View key={c} style={[styles.tag, styles.tagConcern]}><Text style={[styles.tagText, { color: '#1A1A1A' }]}>{c}</Text></View>
                ))}
              </View>
            </View>
          )}

          {/* Description */}
          {product.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.sectionText}>{product.description}</Text>
            </View>
          )}
          {product.how_to_use && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How to Use</Text>
              <Text style={styles.sectionText}>{product.how_to_use}</Text>
            </View>
          )}
          {product.ingredients && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Key Ingredients</Text>
              <Text style={styles.sectionText}>{product.ingredients}</Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* Sticky Add to Cart */}
      <View style={styles.footer}>
        <View style={styles.footerInner}>
          <View>
            <Text style={styles.footerLabel}>Price</Text>
            <Text style={styles.footerPrice}>${product.price?.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={[styles.addBtn, added && styles.addBtnAdded]} onPress={handleAdd} disabled={adding || added}>
            {adding ? <ActivityIndicator color="#fff" /> : <Text style={styles.addBtnText}>{added ? '✓ Added to Cart' : '+ Add to Cart'}</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  scrollContent: { maxWidth: 800, alignSelf: 'center', width: '100%' },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9F9F9' },
  imgContainer: { position: 'relative' },
  img: { width: '100%', height: 350 },
  backBtn: { position: 'absolute', top: 16, left: 16, width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
  catBadge: { position: 'absolute', bottom: 12, right: 14, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  catBadgeText: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },
  info: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24, padding: 24 },
  brand: { fontSize: 13, color: '#999', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  name: { fontSize: 24, fontWeight: '800', color: '#2D2D2D', marginTop: 4, lineHeight: 32 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 14 },
  price: { fontSize: 30, fontWeight: '800', color: '#1A1A1A' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontSize: 14, color: '#666' },
  tagSection: { marginBottom: 16 },
  tagLabel: { fontSize: 14, fontWeight: '700', color: '#555', marginBottom: 8 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#F0F0F0', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  tagConcern: { backgroundColor: '#EAEAEA' },
  tagText: { fontSize: 13, color: '#666666', fontWeight: '600' },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 8 },
  sectionText: { fontSize: 15, color: '#666', lineHeight: 24 },
  footer: {
    backgroundColor: '#fff', borderTopWidth: 1.5, borderTopColor: '#EAEAEA',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 10,
  },
  footerInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, maxWidth: 800, alignSelf: 'center', width: '100%'
  },
  footerLabel: { fontSize: 13, color: '#999', fontWeight: '600' },
  footerPrice: { fontSize: 24, fontWeight: '800', color: '#2D2D2D' },
  addBtn: { backgroundColor: '#1A1A1A', borderRadius: 14, paddingHorizontal: 30, paddingVertical: 16, shadowColor: '#1A1A1A', shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  addBtnAdded: { backgroundColor: '#4CAF50' },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
