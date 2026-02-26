import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';

const STATUS_COLOR: Record<string, string> = {
  paid: '#4CAF50', processing: '#FF9800', shipped: '#2196F3', delivered: '#9C27B0', cancelled: '#E53935',
};

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/orders').then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await api.put(`/api/admin/orders/${id}/status`, { status });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const renderOrder = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.orderId}>#{item.id.slice(0, 8).toUpperCase()}</Text>
        <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] || '#999' }]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.customerName}>{item.profiles?.full_name || 'Unknown'}</Text>
      <Text style={styles.customerEmail}>{item.profiles?.email}</Text>
      <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
      <View style={styles.cardBottom}>
        <Text style={styles.total}>${parseFloat(item.total).toFixed(2)}</Text>
        <Text style={styles.itemCount}>{item.order_items?.length} items</Text>
      </View>
      {/* Quick status change */}
      <View style={styles.statusBtns}>
        {['processing', 'shipped', 'delivered'].map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.statusBtn, item.status === s && styles.statusBtnActive]}
            onPress={() => updateStatus(item.id, s)}
          >
            <Text style={[styles.statusBtnText, item.status === s && styles.statusBtnTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator color="#1A1A1A" size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<Text style={styles.count}>{orders.length} orders total</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  list: { padding: 16 },
  count: { fontSize: 14, color: '#666666', fontWeight: '600', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, padding: 16, borderWidth: 1.5, borderColor: '#EAEAEA', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 3 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  orderId: { fontSize: 16, fontWeight: '700', color: '#333' },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  customerName: { fontSize: 15, fontWeight: '700', color: '#333', marginTop: 4 },
  customerEmail: { fontSize: 13, color: '#999', marginTop: 2 },
  date: { fontSize: 12, color: '#666666', marginTop: 4 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  total: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  itemCount: { fontSize: 13, color: '#666' },
  statusBtns: { flexDirection: 'row', gap: 8, marginTop: 12 },
  statusBtn: { flex: 1, paddingVertical: 6, borderRadius: 8, borderWidth: 1.5, borderColor: '#EAEAEA', alignItems: 'center' },
  statusBtnActive: { backgroundColor: '#1A1A1A', borderColor: '#1A1A1A' },
  statusBtnText: { fontSize: 11, fontWeight: '700', color: '#666666' },
  statusBtnTextActive: { color: '#fff' },
});
