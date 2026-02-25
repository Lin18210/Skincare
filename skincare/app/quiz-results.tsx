import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  SafeAreaView, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';

const SKIN_TYPE_LABEL: Record<string, { label: string; emoji: string; color: string }> = {
  oily:        { label: 'Oily Skin',        emoji: '💧', color: '#2196F3' },
  dry:         { label: 'Dry Skin',         emoji: '🌵', color: '#FF9800' },
  combination: { label: 'Combination Skin', emoji: '⚖️', color: '#9C27B0' },
  normal:      { label: 'Normal Skin',      emoji: '✨', color: '#4CAF50' },
  sensitive:   { label: 'Sensitive Skin',   emoji: '🌸', color: '#E91E63' },
};

export default function QuizResults() {
  const params = useLocalSearchParams();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<'routine' | 'products'>('routine');
  const [routineTab, setRoutineTab] = useState<'morning' | 'evening'>('morning');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  let products: any[] = [];
  let routine: { morning: any[]; evening: any[]; skincareTips: string[] } | null = null;
  let skin_type = '';
  try {
    products = JSON.parse(params.products as string || '[]');
    routine = JSON.parse(params.routine as string || 'null');
    skin_type = (params.skin_type as string) || '';
  } catch {}

  const skinInfo = SKIN_TYPE_LABEL[skin_type] || { label: 'Your Skin', emoji: '✨', color: '#C2185B' };

  const handleAddToCart = async (product: any) => {
    try {
      await addToCart(product.id, 1);
      setAddedIds(prev => new Set([...prev, product.id]));
    } catch {
      Alert.alert('Error', 'Please login to add items to cart.');
    }
  };

  const routineSteps = routine ? (routineTab === 'morning' ? routine.morning : routine.evening) : [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: skinInfo.color }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerEmoji}>{skinInfo.emoji}</Text>
          <Text style={styles.headerTitle}>{skinInfo.label}</Text>
          <Text style={styles.headerSub}>Your Personalized Skincare Plan</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Main Tab Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'routine' && styles.tabBtnActive]}
          onPress={() => setActiveTab('routine')}
        >
          <Ionicons name="list-outline" size={16} color={activeTab === 'routine' ? '#C2185B' : '#AD7FA0'} />
          <Text style={[styles.tabBtnText, activeTab === 'routine' && styles.tabBtnTextActive]}>
            My Routine
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'products' && styles.tabBtnActive]}
          onPress={() => setActiveTab('products')}
        >
          <Ionicons name="cube-outline" size={16} color={activeTab === 'products' ? '#C2185B' : '#AD7FA0'} />
          <Text style={[styles.tabBtnText, activeTab === 'products' && styles.tabBtnTextActive]}>
            Recommended ({products.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ─── ROUTINE TAB ─────────────────────────────────────── */}
        {activeTab === 'routine' && routine && (
          <>
            {/* Morning / Evening switcher */}
            <View style={styles.routineToggle}>
              <TouchableOpacity
                style={[styles.toggleBtn, routineTab === 'morning' && styles.toggleBtnActive]}
                onPress={() => setRoutineTab('morning')}
              >
                <Text style={styles.toggleIcon}>☀️</Text>
                <Text style={[styles.toggleText, routineTab === 'morning' && styles.toggleTextActive]}>
                  Morning
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, routineTab === 'evening' && styles.toggleBtnActive]}
                onPress={() => setRoutineTab('evening')}
              >
                <Text style={styles.toggleIcon}>🌙</Text>
                <Text style={[styles.toggleText, routineTab === 'evening' && styles.toggleTextActive]}>
                  Evening
                </Text>
              </TouchableOpacity>
            </View>

            {/* Routine Steps */}
            {routineSteps.map((step: any, idx: number) => (
              <View key={idx} style={styles.stepCard}>
                <View style={styles.stepLeft}>
                  <View style={styles.stepNumCircle}>
                    <Text style={styles.stepNumText}>{step.step}</Text>
                  </View>
                  {idx < routineSteps.length - 1 && <View style={styles.stepLine} />}
                </View>
                <View style={styles.stepRight}>
                  <View style={styles.stepHeader}>
                    <Text style={styles.stepIcon}>{step.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.stepName}>{step.name}</Text>
                      {step.frequency && (
                        <View style={styles.freqBadge}>
                          <Text style={styles.freqText}>{step.frequency}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Text style={styles.stepTip}>{step.tip}</Text>
                </View>
              </View>
            ))}

            {/* Skincare Tips */}
            {routine.skincareTips && routine.skincareTips.length > 0 && (
              <View style={styles.tipsCard}>
                <Text style={styles.tipsTitle}>💡 Pro Tips for Your Skin</Text>
                {routine.skincareTips.map((tip: string, i: number) => (
                  <View key={i} style={styles.tipRow}>
                    <View style={styles.tipDot} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* CTA to see products */}
            <TouchableOpacity style={styles.seeProductsBtn} onPress={() => setActiveTab('products')}>
              <Text style={styles.seeProductsBtnText}>View Recommended Products</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </>
        )}

        {/* ─── PRODUCTS TAB ────────────────────────────────────── */}
        {activeTab === 'products' && (
          <>
            <Text style={styles.productsIntro}>
              Curated for your {skinInfo.label.toLowerCase()} — sorted by best match
            </Text>
            {products.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={styles.emptyText}>No products matched your profile.</Text>
              </View>
            ) : (
              products.map((product: any) => (
                <View key={product.id} style={styles.productCard}>
                  <TouchableOpacity
                    style={styles.productLeft}
                    onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
                  >
                    <Image source={{ uri: product.image_url }} style={styles.productImg} resizeMode="cover" />
                  </TouchableOpacity>
                  <View style={styles.productInfo}>
                    <View style={styles.productCatBadge}>
                      <Text style={styles.productCat}>{product.categories?.name}</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}>
                      <Text style={styles.productBrand}>{product.brand}</Text>
                      <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                    </TouchableOpacity>
                    <View style={styles.productBottom}>
                      <Text style={styles.productPrice}>${product.price?.toFixed(2)}</Text>
                      <TouchableOpacity
                        style={[styles.addBtn, addedIds.has(product.id) && styles.addBtnDone]}
                        onPress={() => handleAddToCart(product)}
                        disabled={addedIds.has(product.id)}
                      >
                        <Ionicons
                          name={addedIds.has(product.id) ? 'checkmark' : 'bag-add-outline'}
                          size={16}
                          color="#fff"
                        />
                        <Text style={styles.addBtnText}>
                          {addedIds.has(product.id) ? 'Added' : 'Add'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF0F5' },

  // Header
  header: { padding: 20, paddingTop: 16, flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerEmoji: { fontSize: 36 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginTop: 4 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  // Tab bar
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1.5, borderBottomColor: '#F0D0E0' },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 6 },
  tabBtnActive: { borderBottomWidth: 3, borderBottomColor: '#C2185B' },
  tabBtnText: { fontSize: 14, fontWeight: '700', color: '#AD7FA0' },
  tabBtnTextActive: { color: '#C2185B' },

  scroll: { padding: 16 },

  // Routine toggle
  routineToggle: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 4, marginBottom: 16, borderWidth: 1.5, borderColor: '#F0D0E0' },
  toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12 },
  toggleBtnActive: { backgroundColor: '#FFE4EE' },
  toggleIcon: { fontSize: 16 },
  toggleText: { fontSize: 14, fontWeight: '700', color: '#AD7FA0' },
  toggleTextActive: { color: '#C2185B' },

  // Routine steps
  stepCard: { flexDirection: 'row', marginBottom: 0 },
  stepLeft: { alignItems: 'center', width: 40 },
  stepNumCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#C2185B', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  stepNumText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  stepLine: { width: 2, flex: 1, backgroundColor: '#F0D0E0', marginVertical: 4 },
  stepRight: { flex: 1, marginLeft: 12, backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: '#F0D0E0' },
  stepHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  stepIcon: { fontSize: 20 },
  stepName: { fontSize: 15, fontWeight: '700', color: '#333', flex: 1 },
  freqBadge: { backgroundColor: '#FFE4EE', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 4 },
  freqText: { fontSize: 11, color: '#C2185B', fontWeight: '700' },
  stepTip: { fontSize: 13, color: '#666', lineHeight: 19 },

  // Tips
  tipsCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginTop: 8, marginBottom: 16, borderWidth: 1.5, borderColor: '#F0D0E0' },
  tipsTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#C2185B', marginTop: 5 },
  tipText: { flex: 1, fontSize: 13, color: '#555', lineHeight: 19 },

  // See products CTA
  seeProductsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#C2185B', borderRadius: 14, paddingVertical: 16, marginTop: 4, shadowColor: '#C2185B', shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  seeProductsBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Products tab
  productsIntro: { fontSize: 14, color: '#AD7FA0', fontWeight: '600', marginBottom: 14, textAlign: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 50 },
  emptyText: { fontSize: 16, color: '#AD7FA0', marginTop: 12, fontWeight: '600' },
  productCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, marginBottom: 12,
    borderWidth: 1.5, borderColor: '#F0D0E0', overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  productLeft: {},
  productImg: { width: 100, height: 115 },
  productInfo: { flex: 1, padding: 12, justifyContent: 'space-between' },
  productCatBadge: { backgroundColor: '#FFE4EE', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 4 },
  productCat: { fontSize: 10, color: '#C2185B', fontWeight: '700', textTransform: 'uppercase' },
  productBrand: { fontSize: 11, color: '#999', fontWeight: '700', textTransform: 'uppercase' },
  productName: { fontSize: 14, fontWeight: '700', color: '#333', lineHeight: 20, marginTop: 2 },
  productBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  productPrice: { fontSize: 18, fontWeight: '800', color: '#C2185B' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#C2185B', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
  addBtnDone: { backgroundColor: '#4CAF50' },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
