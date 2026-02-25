import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  SafeAreaView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import api from '@/lib/api';

export default function ProductFormScreen() {
  const params = useLocalSearchParams();
  const existing = params.product ? JSON.parse(params.product as string) : null;

  const [form, setForm] = useState({
    name: existing?.name || '',
    brand: existing?.brand || '',
    description: existing?.description || '',
    how_to_use: existing?.how_to_use || '',
    price: existing?.price?.toString() || '',
    image_url: existing?.image_url || '',
    stock: existing?.stock?.toString() || '100',
  });
  const [loading, setLoading] = useState(false);

  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!form.name || !form.price) { Alert.alert('Error', 'Name and price are required.'); return; }
    setLoading(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) || 100 };
      if (existing) await api.put(`/api/admin/products/${existing.id}`, payload);
      else await api.post('/api/admin/products', payload);
      Alert.alert('Success', existing ? 'Product updated!' : 'Product created!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Save failed.');
    } finally { setLoading(false); }
  };

  const fields = [
    { key: 'name', label: 'Product Name *', placeholder: 'e.g. Vitamin C Serum' },
    { key: 'brand', label: 'Brand', placeholder: 'e.g. The Ordinary' },
    { key: 'price', label: 'Price ($) *', placeholder: '19.99', keyboard: 'decimal-pad' },
    { key: 'stock', label: 'Stock', placeholder: '100', keyboard: 'numeric' },
    { key: 'image_url', label: 'Image URL', placeholder: 'https://...' },
    { key: 'description', label: 'Description', placeholder: 'Product description...', multiline: true },
    { key: 'how_to_use', label: 'How to Use', placeholder: 'Application instructions...', multiline: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>{existing ? 'Edit Product' : 'New Product'}</Text>
          {fields.map(field => (
            <View style={styles.inputGroup} key={field.key}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={[styles.input, field.multiline && styles.multiline]}
                placeholder={field.placeholder}
                placeholderTextColor="#C4A9BA"
                keyboardType={field.keyboard as any || 'default'}
                multiline={field.multiline}
                value={(form as any)[field.key]}
                onChangeText={v => update(field.key, v)}
              />
            </View>
          ))}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{existing ? 'Update Product' : 'Create Product'}</Text>}
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF0F5' },
  scroll: { padding: 20 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#2D2D2D', marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#F0D0E0', borderRadius: 12, padding: 14, fontSize: 15, color: '#333' },
  multiline: { height: 100, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: '#C2185B', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8, shadowColor: '#C2185B', shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
