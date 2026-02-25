import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    api.get(`/api/products/${id}`).then(r => setProduct(r.data)).finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    setAdding(true);
    try {
      await addToCart(product.id, 1);
      setAdded(true);
    } catch { Alert.alert('Error', 'Could not add to cart.'); }
    finally { setAdding(false); }
  };

  if (loading) return <View style={styles.loader}><ActivityIndicator color="#C2185B" size="large" /></View>;
  if (!product) return <View style={styles.loader}><Text>Product not found</Text></View>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={styles.imgContainer}>
          <Image source={{ uri: product.image_url }} style={styles.img} resizeMode="cover" />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#C2185B" />
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
                  <View key={c} style={[styles.tag, styles.tagConcern]}><Text style={[styles.tagText, { color: '#C2185B' }]}>{c}</Text></View>
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
      </ScrollView>

      {/* Sticky Add to Cart */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Price</Text>
          <Text style={styles.footerPrice}>${product.price?.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={[styles.addBtn, added && styles.addBtnAdded]} onPress={handleAdd} disabled={adding || added}>
          {adding ? <ActivityIndicator color="#fff" /> : <Text style={styles.addBtnText}>{added ? '✓ Added to Cart' : '+ Add to Cart'}</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF0F5' },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF0F5' },
  imgContainer: { position: 'relative' },
  img: { width: '100%', height: 300 },
  backBtn: { position: 'absolute', top: 16, left: 16, width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
  catBadge: { position: 'absolute', bottom: 12, right: 14, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  catBadgeText: { fontSize: 12, fontWeight: '700', color: '#C2185B' },
  info: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24, padding: 24 },
  brand: { fontSize: 12, color: '#999', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  name: { fontSize: 22, fontWeight: '800', color: '#2D2D2D', marginTop: 4, lineHeight: 30 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 12 },
  price: { fontSize: 28, fontWeight: '800', color: '#C2185B' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontSize: 13, color: '#666' },
  tagSection: { marginBottom: 12 },
  tagLabel: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 6 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#F5E6F0', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  tagConcern: { backgroundColor: '#FFE4EE' },
  tagText: { fontSize: 12, color: '#9B59B6', fontWeight: '600' },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 6 },
  sectionText: { fontSize: 14, color: '#666', lineHeight: 22 },
  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', padding: 20, borderTopWidth: 1.5, borderTopColor: '#F0D0E0',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 10,
  },
  footerLabel: { fontSize: 12, color: '#999', fontWeight: '600' },
  footerPrice: { fontSize: 22, fontWeight: '800', color: '#2D2D2D' },
  addBtn: { backgroundColor: '#C2185B', borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14, shadowColor: '#C2185B', shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  addBtnAdded: { backgroundColor: '#4CAF50' },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
