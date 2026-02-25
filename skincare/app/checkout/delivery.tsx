import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';

export default function DeliveryScreen() {
  const { cartItems, cartTotal } = useCart();
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const shipping = 5.00;
  const total = cartTotal + shipping;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone.trim() || form.phone.length < 8) e.phone = 'Valid phone required';
    if (!form.address.trim()) e.address = 'Delivery address required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    router.push({ pathname: '/checkout/payment', params: { ...form, cartTotal: String(cartTotal), shipping: String(shipping) } });
  };

  const fields = [
    { key: 'name', label: 'Full Name', placeholder: 'Jane Doe', icon: 'person-outline' },
    { key: 'email', label: 'Email Address', placeholder: 'jane@email.com', keyboard: 'email-address', icon: 'mail-outline' },
    { key: 'phone', label: 'Phone Number', placeholder: '+1 234 567 8900', keyboard: 'phone-pad', icon: 'call-outline' },
    { key: 'address', label: 'Delivery Address', placeholder: '123 Main St, City, Country', icon: 'location-outline', multiline: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with steps */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#C2185B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Details</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Step indicator */}
      <View style={styles.steps}>
        {['Delivery', 'Payment', 'Confirm'].map((s, i) => (
          <View key={s} style={styles.stepItem}>
            <View style={[styles.stepDot, i === 0 && styles.stepDotActive]}>
              <Text style={[styles.stepNum, i === 0 && styles.stepNumActive]}>{i + 1}</Text>
            </View>
            <Text style={[styles.stepLabel, i === 0 && styles.stepLabelActive]}>{s}</Text>
          </View>
        ))}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Form */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Where should we deliver?</Text>
            {fields.map(field => (
              <View style={styles.inputGroup} key={field.key}>
                <Text style={styles.label}>{field.label}</Text>
                <View style={[styles.inputRow, errors[field.key] && styles.inputError]}>
                  <Ionicons name={field.icon as any} size={18} color="#AD7FA0" style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.input, field.multiline && { height: 80, textAlignVertical: 'top' }]}
                    placeholder={field.placeholder}
                    placeholderTextColor="#C4A9BA"
                    keyboardType={field.keyboard as any || 'default'}
                    autoCapitalize={field.keyboard === 'email-address' ? 'none' : 'words'}
                    multiline={field.multiline}
                    value={(form as any)[field.key]}
                    onChangeText={v => setForm(prev => ({ ...prev, [field.key]: v }))}
                  />
                </View>
                {errors[field.key] && <Text style={styles.errorText}>{errors[field.key]}</Text>}
              </View>
            ))}
          </View>

          {/* Price Summary (always visible) */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Price Summary</Text>
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
          <Text style={styles.footerLabel}>Total</Text>
          <Text style={styles.footerTotal}>${total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>Continue to Payment</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
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
  formCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1.5, borderColor: '#F0D0E0', marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#333', marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFF5FA', borderWidth: 1.5, borderColor: '#F0D0E0', borderRadius: 12, padding: 12 },
  inputError: { borderColor: '#E53935' },
  input: { flex: 1, fontSize: 15, color: '#333' },
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
  nextBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#C2185B', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 14, shadowColor: '#C2185B', shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
