import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';

export default function AdminProductsScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    try { const r = await api.get('/api/admin/products'); setProducts(r.data); }
    catch { Alert.alert('Error', 'Failed to load products.'); }
    finally { setLoading(false); }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Product', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await api.delete(`/api/admin/products/${id}`);
        loadProducts();
      } },
    ]);
  };

  const renderProduct = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image_url }} style={styles.img} resizeMode="cover" />
      <View style={styles.info}>
        <Text style={styles.brand}>{item.brand}</Text>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.cat}>{item.categories?.name}</Text>
        <Text style={styles.price}>${item.price?.toFixed(2)}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push({ pathname: '/admin/product-form', params: { product: JSON.stringify(item) } })}
        >
          <Ionicons name="pencil" size={16} color="#C2185B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id, item.name)}>
          <Ionicons name="trash-outline" size={16} color="#E53935" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator color="#C2185B" size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/admin/product-form')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF0F5' },
  list: { padding: 16 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, overflow: 'hidden', borderWidth: 1.5, borderColor: '#F0D0E0' },
  img: { width: 80, height: 88 },
  info: { flex: 1, padding: 10, justifyContent: 'center' },
  brand: { fontSize: 10, color: '#999', fontWeight: '700', textTransform: 'uppercase' },
  name: { fontSize: 14, fontWeight: '700', color: '#333', marginTop: 2 },
  cat: { fontSize: 12, color: '#C2185B', fontWeight: '600', marginTop: 2 },
  price: { fontSize: 16, fontWeight: '800', color: '#2D2D2D', marginTop: 4 },
  actions: { padding: 10, justifyContent: 'space-around' },
  editBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFE4EE', alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFEBEE', alignItems: 'center', justifyContent: 'center' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#C2185B', alignItems: 'center', justifyContent: 'center', shadowColor: '#C2185B', shadowOpacity: 0.4, shadowRadius: 10, elevation: 10 },
});
