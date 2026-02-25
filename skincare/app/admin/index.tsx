import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import api from '@/lib/api';

const screenWidth = Dimensions.get('window').width - 40;

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/stats'),
      api.get('/api/admin/revenue?period=month'),
    ]).then(([s, r]) => {
      setStats(s.data);
      setRevenue(r.data.reverse());
    }).finally(() => setLoading(false));
  }, []);

  const chartLabels = revenue.slice(-6).map(r => r.month ? r.month.slice(5) : r.day?.slice(5) || '');
  const chartData = revenue.slice(-6).map(r => parseFloat(r.revenue || 0));

  const navCards = [
    { icon: 'cube-outline', label: 'Products', route: '/admin/products', color: '#9C27B0' },
    { icon: 'receipt-outline', label: 'Orders', route: '/admin/orders', color: '#FF9800' },
    { icon: 'people-outline', label: 'Users', route: '/admin/users', color: '#2196F3' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color="#C2185B" size="large" style={{ marginTop: 60 }} />
        ) : (
          <>
            {/* Stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="receipt-outline" size={22} color="#C2185B" />
                <Text style={styles.statNum}>{stats?.totalOrders || 0}</Text>
                <Text style={styles.statLabel}>Total Orders</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="people-outline" size={22} color="#9C27B0" />
                <Text style={styles.statNum}>{stats?.totalUsers || 0}</Text>
                <Text style={styles.statLabel}>Total Users</Text>
              </View>
              <View style={[styles.statCard, styles.statWide]}>
                <Ionicons name="trending-up-outline" size={22} color="#4CAF50" />
                <Text style={[styles.statNum, { color: '#4CAF50' }]}>${stats?.totalRevenue || '0.00'}</Text>
                <Text style={styles.statLabel}>Total Revenue</Text>
              </View>
            </View>

            {/* Revenue Chart */}
            {chartData.length > 0 && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Monthly Revenue</Text>
                <BarChart
                  data={{ labels: chartLabels, datasets: [{ data: chartData.length > 0 ? chartData : [0] }] }}
                  width={screenWidth}
                  height={200}
                  yAxisLabel="$"
                  yAxisSuffix=""
                  chartConfig={{
                    backgroundColor: '#fff',
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(194, 24, 91, ${opacity})`,
                    labelColor: () => '#999',
                    style: { borderRadius: 16 },
                    propsForBackgroundLines: { stroke: '#F0D0E0' },
                  }}
                  style={{ borderRadius: 12 }}
                />
              </View>
            )}

            {/* Navigation Cards */}
            <Text style={styles.sectionTitle}>Manage</Text>
            <View style={styles.navCards}>
              {navCards.map(card => (
                <TouchableOpacity
                  key={card.label}
                  style={styles.navCard}
                  onPress={() => router.push(card.route as any)}
                >
                  <View style={[styles.navIcon, { backgroundColor: card.color + '20' }]}>
                    <Ionicons name={card.icon as any} size={26} color={card.color} />
                  </View>
                  <Text style={styles.navLabel}>{card.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#ccc" />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF0F5' },
  scroll: { padding: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 18, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#F0D0E0', gap: 6 },
  statWide: { minWidth: '100%' },
  statNum: { fontSize: 26, fontWeight: '800', color: '#C2185B' },
  statLabel: { fontSize: 12, color: '#999', fontWeight: '600' },
  chartCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, borderWidth: 1.5, borderColor: '#F0D0E0', marginBottom: 24 },
  chartTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2D2D2D', marginBottom: 12 },
  navCards: { gap: 10 },
  navCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: '#F0D0E0', gap: 14 },
  navIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  navLabel: { flex: 1, fontSize: 16, fontWeight: '700', color: '#333' },
});
