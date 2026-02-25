import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const { user, logout, isAdmin } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/orders').then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      // Alert.alert button callbacks are ignored on web
      if (!window.confirm('Are you sure you want to logout?')) return;
      await logout();
      router.replace('/login');
      return;
    }
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); router.replace('/login'); } },
    ]);
  };

  const statusColor: Record<string, string> = {
    paid: '#4CAF50', processing: '#FF9800', shipped: '#2196F3', delivered: '#9C27B0', cancelled: '#E53935',
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.full_name?.split(' ')[0]} 👋</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#C2185B" />
        </TouchableOpacity>
      </View>

      {/* Admin Button */}
      {isAdmin && (
        <TouchableOpacity style={styles.adminBanner} onPress={() => router.push('/admin')}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
          <Text style={styles.adminBannerText}>Open Admin Dashboard</Text>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{orders.length}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>${orders.reduce((s, o) => s + parseFloat(o.total || 0), 0).toFixed(0)}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{orders.filter(o => o.status === 'delivered').length}</Text>
            <Text style={styles.statLabel}>Delivered</Text>
          </View>
        </View>

        {/* Order History */}
        <Text style={styles.sectionTitle}>Order History</Text>

        {loading ? (
          <ActivityIndicator color="#C2185B" style={{ marginTop: 30 }} />
        ) : orders.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyText}>No orders yet</Text>
          </View>
        ) : (
          orders.map(order => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => router.push({ pathname: '/order/[id]', params: { id: order.id } })}
            >
              <View style={styles.orderTop}>
                <Text style={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor[order.status] || '#999' }]}>
                  <Text style={styles.statusText}>{order.status}</Text>
                </View>
              </View>
              <Text style={styles.orderDate}>{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
              <View style={styles.orderBottom}>
                <Text style={styles.orderItems}>{order.order_items?.length || 0} item(s)</Text>
                <Text style={styles.orderTotal}>${parseFloat(order.total).toFixed(2)}</Text>
              </View>
              <View style={styles.viewBtn}>
                <Text style={styles.viewBtnText}>View Details</Text>
                <Ionicons name="chevron-forward" size={14} color="#C2185B" />
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF0F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 16 },
  greeting: { fontSize: 22, fontWeight: '800', color: '#2D2D2D' },
  email: { fontSize: 13, color: '#AD7FA0', marginTop: 2 },
  logoutBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFE4EE', alignItems: 'center', justifyContent: 'center' },
  adminBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#C2185B', marginHorizontal: 16, borderRadius: 14, padding: 14, marginBottom: 6, shadowColor: '#C2185B', shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  adminBannerText: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '700' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginTop: 10, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#F0D0E0' },
  statNum: { fontSize: 22, fontWeight: '800', color: '#C2185B' },
  statLabel: { fontSize: 11, color: '#999', fontWeight: '600', marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2D2D2D', paddingHorizontal: 20, marginBottom: 12 },
  empty: { alignItems: 'center', marginTop: 40 },
  emptyEmoji: { fontSize: 50 },
  emptyText: { fontSize: 16, color: '#AD7FA0', marginTop: 12, fontWeight: '600' },
  orderCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: '#F0D0E0', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 3 },
  orderTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderId: { fontSize: 16, fontWeight: '700', color: '#333' },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  orderDate: { fontSize: 13, color: '#999', marginTop: 6 },
  orderBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  orderItems: { fontSize: 13, color: '#666' },
  orderTotal: { fontSize: 17, fontWeight: '800', color: '#C2185B' },
  viewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 8 },
  viewBtnText: { fontSize: 13, color: '#C2185B', fontWeight: '600' },
});
