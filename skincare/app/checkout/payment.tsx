import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';

export default function PaymentScreen() {
  const params = useLocalSearchParams();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [card, setCard] = useState({ number: '', cvv: '', expiry: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const shipping = parseFloat(params.shipping as string) || 5.00;
  const total = cartTotal + shipping;

  const formatCard = (v: string) => v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '');
    if (d.length <= 2) return d;
    return `${d.slice(0, 2)}/${d.slice(2, 4)}`;
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (card.number.replace(/\s/g, '').length < 16) e.number = 'Enter a valid 16-digit card number';
    if (card.cvv.length < 3) e.cvv = 'Enter a valid CVV';
    if (!/^\d{2}\/\d{2}$/.test(card.expiry)) e.expiry = 'Enter expiry as MM/YY';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const items = cartItems.map(i => ({
        product_id: i.product_id,
        product_name: i.products?.name,
        product_image: i.products?.image_url,
        quantity: i.quantity,
        unit_price: i.products?.price,
      }));
      const orderRes = await api.post('/api/orders', {
        delivery_name: params.name,
        delivery_email: params.email,
        delivery_phone: params.phone,
        delivery_address: params.address,
        payment_last4: card.number.replace(/\s/g, '').slice(-4),
        payment_expiry: card.expiry,
        items,
      });
      await clearCart();
      router.replace({ pathname: '/checkout/confirmation', params: { orderId: orderRes.data.id, total: String(total), name: params.name as string, email: params.email as string } });
    } catch (err: any) {
      Alert.alert('Payment Failed', err?.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#C2185B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Step indicator */}
      <View style={styles.steps}>
        {['Delivery', 'Payment', 'Confirm'].map((s, i) => (
          <View key={s} style={styles.stepItem}>
            <View style={[styles.stepDot, i <= 1 && styles.stepDotActive]}>
              {i < 1 ? <Ionicons name="checkmark" size={16} color="#fff" /> : <Text style={[styles.stepNum, i === 1 && styles.stepNumActive]}>{i + 1}</Text>}
            </View>
            <Text style={[styles.stepLabel, i === 1 && styles.stepLabelActive]}>{s}</Text>
          </View>
        ))}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Delivery Summary */}
          <View style={styles.deliverySummary}>
            <Ionicons name="location-outline" size={18} color="#C2185B" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.deliveryName}>{params.name}</Text>
              <Text style={styles.deliveryAddr}>{params.address}</Text>
            </View>
          </View>

          {/* Card Form */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Card Details</Text>
            <View style={styles.cardPreview}>
              <Text style={styles.cardPreviewLabel}>CARD NUMBER</Text>
              <Text style={styles.cardPreviewNumber}>{card.number || '•••• •••• •••• ••••'}</Text>
              <View style={styles.cardPreviewBottom}>
                <View>
                  <Text style={styles.cardPreviewLabel}>EXPIRY</Text>
                  <Text style={styles.cardPreviewValue}>{card.expiry || 'MM/YY'}</Text>
                </View>
                <View>
                  <Text style={styles.cardPreviewLabel}>CVV</Text>
                  <Text style={styles.cardPreviewValue}>{'•'.repeat(card.cvv.length || 3)}</Text>
                </View>
              </View>
            </View>

            {/* Card Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Card Number</Text>
              <View style={[styles.inputRow, errors.number && styles.inputError]}>
                <Ionicons name="card-outline" size={18} color="#AD7FA0" style={{ marginRight: 8 }} />
                <TextInput style={styles.input} placeholder="1234 5678 9012 3456" placeholderTextColor="#C4A9BA"
                  keyboardType="numeric" value={card.number} onChangeText={v => setCard(prev => ({ ...prev, number: formatCard(v) }))} maxLength={19} />
              </View>
              {errors.number && <Text style={styles.errorText}>{errors.number}</Text>}
            </View>

            <View style={styles.rowFields}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Expiry Date</Text>
                <View style={[styles.inputRow, errors.expiry && styles.inputError]}>
                  <TextInput style={styles.input} placeholder="MM/YY" placeholderTextColor="#C4A9BA"
                    keyboardType="numeric" value={card.expiry} onChangeText={v => setCard(prev => ({ ...prev, expiry: formatExpiry(v) }))} maxLength={5} />
                </View>
                {errors.expiry && <Text style={styles.errorText}>{errors.expiry}</Text>}
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>CVV</Text>
                <View style={[styles.inputRow, errors.cvv && styles.inputError]}>
                  <TextInput style={styles.input} placeholder="•••" placeholderTextColor="#C4A9BA"
                    keyboardType="numeric" secureTextEntry value={card.cvv} onChangeText={v => setCard(prev => ({ ...prev, cvv: v.replace(/\D/g, '') }))} maxLength={4} />
                </View>
                {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
              </View>
            </View>
          </View>

          {/* Price Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Total</Text>
            {cartItems.map(item => (
              <View style={styles.summaryRow} key={item.id}>
                <Text style={styles.summaryLabel} numberOfLines={1}>{item.products?.name} × {item.quantity}</Text>
                <Text style={styles.summaryValue}>${(item.products?.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>${shipping.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, { marginTop: 4 }]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>You'll pay</Text>
          <Text style={styles.footerTotal}>${total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.payBtn} onPress={handlePay} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Ionicons name="lock-closed" size={16} color="#fff" />
              <Text style={styles.payBtnText}>Pay Now</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF0F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFE4EE', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#2D2D2D' },
  steps: { flexDirection: 'row', justifyContent: 'center', gap: 40, paddingBottom: 20, borderBottomWidth: 1.5, borderBottomColor: '#F0D0E0' },
  stepItem: { alignItems: 'center', gap: 4 },
  stepDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0D0E0', alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: '#C2185B' },
  stepNum: { fontSize: 14, fontWeight: '700', color: '#AD7FA0' },
  stepNumActive: { color: '#fff' },
  stepLabel: { fontSize: 11, color: '#AD7FA0', fontWeight: '600' },
  stepLabelActive: { color: '#C2185B' },
  scroll: { padding: 20 },
  deliverySummary: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFE4EE', borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1.5, borderColor: '#F0D0E0' },
  deliveryName: { fontSize: 14, fontWeight: '700', color: '#333' },
  deliveryAddr: { fontSize: 13, color: '#666', marginTop: 2 },
  formCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1.5, borderColor: '#F0D0E0', marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#333', marginBottom: 14 },
  cardPreview: { backgroundColor: '#C2185B', borderRadius: 16, padding: 20, marginBottom: 20 },
  cardPreviewLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '700', letterSpacing: 1 },
  cardPreviewNumber: { fontSize: 20, color: '#fff', fontWeight: '700', letterSpacing: 3, marginTop: 8, marginBottom: 20 },
  cardPreviewBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  cardPreviewValue: { fontSize: 16, color: '#fff', fontWeight: '700', marginTop: 4 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5FA', borderWidth: 1.5, borderColor: '#F0D0E0', borderRadius: 12, padding: 12 },
  inputError: { borderColor: '#E53935' },
  input: { flex: 1, fontSize: 15, color: '#333' },
  rowFields: { flexDirection: 'row' },
  errorText: { color: '#E53935', fontSize: 12, marginTop: 4 },
  summaryCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1.5, borderColor: '#F0D0E0' },
  summaryTitle: { fontSize: 17, fontWeight: '700', color: '#333', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 13, color: '#666', flex: 1, marginRight: 8 },
  summaryValue: { fontSize: 13, fontWeight: '600', color: '#333' },
  divider: { height: 1.5, backgroundColor: '#F0D0E0', marginVertical: 8 },
  totalLabel: { fontSize: 16, fontWeight: '800', color: '#2D2D2D' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#C2185B' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 20, borderTopWidth: 1.5, borderTopColor: '#F0D0E0', elevation: 10 },
  footerLabel: { fontSize: 12, color: '#999' },
  footerTotal: { fontSize: 22, fontWeight: '800', color: '#2D2D2D' },
  payBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#C2185B', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 14, shadowColor: '#C2185B', shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  payBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
