import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';
import api from '@/lib/api';

const W = Dimensions.get('window').width - 40;

const CHART_CFG = {
  backgroundColor: '#fff',
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  color: (o = 1) => `rgba(194, 24, 91, ${o})`,
  labelColor: () => '#999',
  propsForBackgroundLines: { stroke: '#F0D0E0' },
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#FF9800', processing: '#2196F3',
  shipped: '#9C27B0', delivered: '#4CAF50', cancelled: '#E53935',
};

export default function AdminDashboard() {
  const [stats, setStats]         = useState<any>(null);
  const [revenue, setRevenue]     = useState<any[]>([]);
  const [productStats, setProductStats] = useState<any>(null);
  const [period, setPeriod]       = useState<'month' | 'day'>('month');
  const [loading, setLoading]     = useState(true);

  const fetchRevenue = async (p: 'month' | 'day') => {
    const r = await api.get(`/api/admin/revenue?period=${p}`);
    setRevenue(r.data);
  };

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/stats'),
      api.get('/api/admin/revenue?period=month'),
      api.get('/api/admin/product-stats'),
    ]).then(([s, r, ps]) => {
      setStats(s.data);
      setRevenue(r.data);
      setProductStats(ps.data);
    }).finally(() => setLoading(false));
  }, []);

  const handlePeriod = (p: 'month' | 'day') => {
    setPeriod(p);
    fetchRevenue(p);
  };

  const revenueSlice   = revenue.slice(-7);
  const chartLabels    = revenueSlice.map(r => r.month ? r.month.slice(5) : r.day?.slice(5) || '');
  const chartData      = revenueSlice.map(r => parseFloat(r.revenue || 0));

  const topProducts    = productStats?.topProducts || [];
  const prodLabels     = topProducts.map((p: any) => p.name);
  const prodData       = topProducts.map((p: any) => p.units);
  const statusCounts   = productStats?.statusCounts || {};

  const navCards = [
    { icon: 'cube-outline',    label: 'Products', route: '/admin/products', color: '#9C27B0' },
    { icon: 'receipt-outline', label: 'Orders',   route: '/admin/orders',   color: '#FF9800' },
    { icon: 'people-outline',  label: 'Users',    route: '/admin/users',    color: '#2196F3' },
  ];

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color="#C2185B" size="large" style={{ marginTop: 60 }} />
        ) : (<>

          {/* ── KPI Stats ── */}
          <Text style={s.sectionTitle}>Overview</Text>
          <View style={s.statsGrid}>
            <View style={s.statCard}>
              <Ionicons name="receipt-outline" size={22} color="#C2185B" />
              <Text style={s.statNum}>{stats?.totalOrders || 0}</Text>
              <Text style={s.statLabel}>Total Orders</Text>
            </View>
            <View style={s.statCard}>
              <Ionicons name="people-outline" size={22} color="#9C27B0" />
              <Text style={s.statNum}>{stats?.totalUsers || 0}</Text>
              <Text style={s.statLabel}>Total Users</Text>
            </View>
            <View style={[s.statCard, s.statWide]}>
              <Ionicons name="trending-up-outline" size={22} color="#4CAF50" />
              <Text style={[s.statNum, { color: '#4CAF50' }]}>${stats?.totalRevenue || '0.00'}</Text>
              <Text style={s.statLabel}>Total Revenue</Text>
            </View>
          </View>

          {/* ── Revenue Chart ── */}
          <View style={s.chartCard}>
            <View style={s.chartHeader}>
              <Text style={s.chartTitle}>Revenue</Text>
              <View style={s.toggle}>
                {(['month', 'day'] as const).map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[s.toggleBtn, period === p && s.toggleActive]}
                    onPress={() => handlePeriod(p)}
                  >
                    <Text style={[s.toggleText, period === p && s.toggleTextActive]}>
                      {p === 'month' ? 'Monthly' : 'Daily'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {chartData.length > 0 ? (
              <BarChart
                data={{ labels: chartLabels, datasets: [{ data: chartData.length ? chartData : [0] }] }}
                width={W - 32} height={190}
                yAxisLabel="$" yAxisSuffix=""
                chartConfig={CHART_CFG}
                style={{ borderRadius: 10, marginTop: 8 }}
              />
            ) : (
              <Text style={s.noData}>No {period === 'month' ? 'monthly' : 'daily'} revenue data yet</Text>
            )}
          </View>

          {/* ── Top Products Chart ── */}
          <View style={s.chartCard}>
            <Text style={s.chartTitle}>Top Products (Units Sold)</Text>
            {prodData.length > 0 ? (
              <BarChart
                data={{ labels: prodLabels, datasets: [{ data: prodData }] }}
                width={W - 32} height={200}
                yAxisLabel="" yAxisSuffix=""
                chartConfig={{ ...CHART_CFG, color: (o = 1) => `rgba(103, 58, 183, ${o})` }}
                style={{ borderRadius: 10, marginTop: 8 }}
                showValuesOnTopOfBars
              />
            ) : (
              <Text style={s.noData}>No product orders yet</Text>
            )}
          </View>

          {/* ── Purchase Stats (Order Status) ── */}
          <View style={s.chartCard}>
            <Text style={s.chartTitle}>Purchase Status Breakdown</Text>
            <View style={s.statusGrid}>
              {Object.entries(statusCounts).map(([status, count]) => (
                <View key={status} style={s.statusPill}>
                  <View style={[s.statusDot, { backgroundColor: STATUS_COLORS[status] || '#999' }]} />
                  <Text style={s.statusLabel}>{status}</Text>
                  <Text style={[s.statusCount, { color: STATUS_COLORS[status] || '#999' }]}>
                    {count as number}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Navigation Cards ── */}
          <Text style={[s.sectionTitle, { marginTop: 8 }]}>Manage</Text>
          <View style={s.navCards}>
            {navCards.map(card => (
              <TouchableOpacity
                key={card.label}
                style={s.navCard}
                onPress={() => router.push(card.route as any)}
              >
                <View style={[s.navIcon, { backgroundColor: card.color + '20' }]}>
                  <Ionicons name={card.icon as any} size={26} color={card.color} />
                </View>
                <Text style={s.navLabel}>{card.label}</Text>
                <Ionicons name="chevron-forward" size={16} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>

        </>)}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#FFF0F5' },
  scroll:          { padding: 20, paddingBottom: 40 },
  sectionTitle:    { fontSize: 18, fontWeight: '700', color: '#2D2D2D', marginBottom: 12 },

  // KPI
  statsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statCard:   { flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 18, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#F0D0E0', gap: 6 },
  statWide:   { minWidth: '100%' },
  statNum:    { fontSize: 26, fontWeight: '800', color: '#C2185B' },
  statLabel:  { fontSize: 12, color: '#999', fontWeight: '600' },

  // Charts
  chartCard:   { backgroundColor: '#fff', borderRadius: 20, padding: 16, borderWidth: 1.5, borderColor: '#F0D0E0', marginBottom: 16 },
  chartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chartTitle:  { fontSize: 15, fontWeight: '700', color: '#333' },
  noData:      { textAlign: 'center', color: '#AD7FA0', paddingVertical: 24, fontSize: 13 },

  // Toggle
  toggle:          { flexDirection: 'row', backgroundColor: '#F5E6EF', borderRadius: 10, padding: 3, gap: 3 },
  toggleBtn:       { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  toggleActive:    { backgroundColor: '#C2185B' },
  toggleText:      { fontSize: 12, fontWeight: '600', color: '#AD7FA0' },
  toggleTextActive:{ color: '#fff' },

  // Status breakdown
  statusGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  statusPill:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5FA', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, gap: 6, borderWidth: 1, borderColor: '#F0D0E0' },
  statusDot:   { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: 12, fontWeight: '600', color: '#555', textTransform: 'capitalize' },
  statusCount: { fontSize: 14, fontWeight: '800' },

  // Nav
  navCards: { gap: 10 },
  navCard:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: '#F0D0E0', gap: 14 },
  navIcon:  { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  navLabel: { flex: 1, fontSize: 16, fontWeight: '700', color: '#333' },
});
