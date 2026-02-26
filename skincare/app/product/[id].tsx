import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert, Animated, Dimensions
} from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { getLocalImage, getLocalImageById } from '@/lib/images';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id, itemIndex } = useLocalSearchParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  
  // animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const imageScaleAnim = useRef(new Animated.Value(1.05)).current;

  const animateEntrance = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    imageScaleAnim.setValue(1.05);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 40, friction: 8, useNativeDriver: true }),
      Animated.timing(imageScaleAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim, imageScaleAnim]);

  useFocusEffect(
    useCallback(() => {
      if (!loading && product) {
        animateEntrance();
      }
    }, [animateEntrance, loading, product])
  );

  useEffect(() => {
    api.get(`/api/products/${id}`).then(r => {
      setProduct(r.data);
      animateEntrance();
    }).finally(() => setLoading(false));
  }, [id, animateEntrance]);

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
        {/* Image Hub */}
        <View style={styles.imgContainer}>
          <Animated.Image 
            source={getLocalImageById(product.id)} 
            style={[styles.img, { transform: [{ scale: imageScaleAnim }] }]} 
            resizeMode="cover" 
          />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#1A1A1A" />
          </TouchableOpacity>
          <View style={styles.catBadge}>
            <Text style={styles.catBadgeText}>{product.categories?.icon} {product.categories?.name}</Text>
          </View>
        </View>

        {/* Detailed Info */}
        <View style={styles.info}>
          <Text style={styles.brand}>{product.brand || 'ESSENTIALS'}</Text>
          <Text style={styles.name}>{product.name}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>${product.price?.toFixed(2)}</Text>
            {product.rating > 0 && (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color="#1A1A1A" />
                <Text style={styles.rating}>{product.rating} <Text style={{color: '#999'}}>({product.review_count} reviews)</Text></Text>
              </View>
            )}
          </View>

          {/* Skin Types */}
          {product.skin_types?.length > 0 && (
            <View style={styles.tagSection}>
              <Text style={styles.tagLabel}>Ideal for</Text>
              <View style={styles.tags}>
                {product.skin_types.map((t: string) => (
                  <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
                ))}
              </View>
            </View>
          )}

          {/* Skin Concerns */}
          {product.skin_concerns?.length > 0 && (
            <View style={styles.tagSection}>
              <Text style={styles.tagLabel}>Targets</Text>
              <View style={styles.tags}>
                {product.skin_concerns.map((c: string) => (
                  <View key={c} style={[styles.tag, styles.tagConcern]}><Text style={styles.tagTextConcern}>{c}</Text></View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.divider} />

          {/* Rich Content Blocks */}
          {product.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>The Details</Text>
              <Text style={styles.sectionText}>{product.description}</Text>
            </View>
          )}
          {product.how_to_use && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Application</Text>
              <Text style={styles.sectionText}>{product.how_to_use}</Text>
            </View>
          )}
          {product.ingredients && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Key Actives</Text>
              <Text style={styles.sectionText}>{product.ingredients}</Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.footer}>
        <View style={styles.footerInner}>
          <View>
            <Text style={styles.footerLabel}>Total Price</Text>
            <Text style={styles.footerPrice}>${product.price?.toFixed(2)}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.addBtn, added && styles.addBtnAdded]} 
            onPress={handleAdd} 
            disabled={adding || added}
            activeOpacity={0.8}
          >
            {adding ? <ActivityIndicator color="#fff" /> : 
             <Text style={styles.addBtnText}>{added ? 'Added to Bag' : 'Add to Bag'}</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCF8F8' }, // Rosy white
  scrollContent: { maxWidth: 800, alignSelf: 'center', width: '100%', paddingBottom: 40 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FCF8F8' },
  
  imgContainer: { position: 'relative', overflow: 'hidden', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, backgroundColor: '#fff', shadowColor: '#B47B84', shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
  img: { width: '100%', height: width > 600 ? 550 : 450, backgroundColor: '#FCF8F8' },
  
  backBtn: { position: 'absolute', top: 16, left: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', shadowColor: '#B47B84', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  
  catBadge: { position: 'absolute', bottom: 20, left: 20, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8, shadowColor: '#B47B84', shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  catBadgeText: { fontSize: 13, fontWeight: '700', color: '#B47B84', letterSpacing: 0.5 },
  
  info: { padding: 24 },
  brand: { fontSize: 12, color: '#A06D74', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2 },
  name: { fontSize: 28, fontWeight: '800', color: '#3A3435', marginTop: 8, lineHeight: 36, letterSpacing: -0.5 },
  
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 24 },
  price: { fontSize: 32, fontWeight: '800', color: '#3A3435' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#F2E6E8' },
  rating: { fontSize: 15, color: '#3A3435', fontWeight: '700' },
  
  tagSection: { marginBottom: 20 },
  tagLabel: { fontSize: 13, fontWeight: '700', color: '#B47B84', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: '#F2E6E8' },
  tagConcern: { backgroundColor: '#B47B84', borderColor: '#B47B84' },
  tagText: { fontSize: 13, color: '#3A3435', fontWeight: '600' },
  tagTextConcern: { fontSize: 13, color: '#fff', fontWeight: '600' },
  
  divider: { height: 1, backgroundColor: '#F2E6E8', marginVertical: 24 },
  
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#3A3435', marginBottom: 12, letterSpacing: -0.3 },
  sectionText: { fontSize: 16, color: '#8A8082', lineHeight: 26 },
  
  footer: {
    backgroundColor: 'rgba(255,255,255,0.95)', borderTopWidth: 1, borderTopColor: '#F2E6E8',
  },
  footerInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 20, maxWidth: 800, alignSelf: 'center', width: '100%'
  },
  footerLabel: { fontSize: 12, color: '#8A8082', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  footerPrice: { fontSize: 26, fontWeight: '800', color: '#3A3435', marginTop: 2 },
  
  addBtn: { backgroundColor: '#B47B84', borderRadius: 20, paddingHorizontal: 36, paddingVertical: 18, shadowColor: '#B47B84', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  addBtnAdded: { backgroundColor: '#2E7D32' },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});
