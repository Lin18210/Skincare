import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  SafeAreaView, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';
import { getLocalImageById } from '@/lib/images';

export default function CartScreen() {
  const { cartItems, cartTotal, fetchCart, updateCartItem, removeFromCart } = useCart();

  useEffect(() => { fetchCart(); }, []);

  const shipping = 5.00;
  const total = cartTotal + shipping;

  const handleCheckout = () => {
    if (cartItems.length === 0) { Alert.alert('Cart is empty', 'Add some products first.'); return; }
    router.push('/checkout/delivery');
  };

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}><Text style={styles.headerTitle}>My Cart</Text></View>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🛍️</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Take the quiz or browse products to get started</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(tabs)/products')}>
            <Text style={styles.shopBtnText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
        <Text style={styles.itemCount}>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        {cartItems.map(item => (
          <View key={item.id} style={styles.cartCard}>
            <Image source={getLocalImageById(item.product_id)} style={styles.productImg} resizeMode="cover" />
            <View style={styles.cardInfo}>
              <Text style={styles.brand}>{item.products?.brand}</Text>
              <Text style={styles.name} numberOfLines={2}>{item.products?.name}</Text>
              <Text style={styles.unitPrice}>${item.products?.price?.toFixed(2)} each</Text>
              {/* Qty controls */}
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => {
                    if (item.quantity <= 1) removeFromCart(item.id);
                    else updateCartItem(item.id, item.quantity - 1);
                  }}
                >
                  <Ionicons name={item.quantity <= 1 ? 'trash-outline' : 'remove'} size={16} color={item.quantity <= 1 ? '#E53935' : '#1A1A1A'} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateCartItem(item.id, item.quantity + 1)}>
                  <Ionicons name="add" size={16} color="#1A1A1A" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.lineTotal}>${(item.products?.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}

        {/* Price Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${cartTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>${shipping.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerTotal}>${total.toFixed(2)}</Text>
          <Text style={styles.footerLabel}>Total inc. shipping</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
          <Text style={styles.checkoutBtnText}>Checkout</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', padding: 20, paddingBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#2D2D2D' },
  itemCount: { fontSize: 14, color: '#666666', fontWeight: '600' },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 70 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 8 },
  shopBtn: { marginTop: 24, backgroundColor: '#1A1A1A', borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14 },
  shopBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cartCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, marginBottom: 12,
    overflow: 'hidden', borderWidth: 1.5, borderColor: '#EAEAEA',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  productImg: { width: 90, height: 100 },
  cardInfo: { flex: 1, padding: 12 },
  brand: { fontSize: 10, color: '#999', fontWeight: '700', textTransform: 'uppercase' },
  name: { fontSize: 14, fontWeight: '700', color: '#333', marginTop: 2, lineHeight: 20 },
  unitPrice: { fontSize: 12, color: '#666666', marginTop: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 },
  qtyBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 16, fontWeight: '700', color: '#333', minWidth: 20, textAlign: 'center' },
  lineTotal: { padding: 12, fontSize: 16, fontWeight: '800', color: '#1A1A1A', alignSelf: 'center' },
  summaryCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1.5, borderColor: '#EAEAEA', marginTop: 8 },
  summaryTitle: { fontSize: 17, fontWeight: '700', color: '#333', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { fontSize: 15, color: '#666' },
  summaryValue: { fontSize: 15, color: '#333', fontWeight: '600' },
  totalRow: { borderTopWidth: 1.5, borderTopColor: '#EAEAEA', paddingTop: 12, marginTop: 4 },
  totalLabel: { fontSize: 17, fontWeight: '800', color: '#2D2D2D' },
  totalValue: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', padding: 20, borderTopWidth: 1.5, borderTopColor: '#EAEAEA',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 10,
  },
  footerTotal: { fontSize: 22, fontWeight: '800', color: '#2D2D2D' },
  footerLabel: { fontSize: 12, color: '#999' },
  checkoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#1A1A1A', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14,
    shadowColor: '#1A1A1A', shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
