import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, SafeAreaView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/orders/${id}`).then(r => setOrder(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <View style={styles.loader}><ActivityIndicator color="#C2185B" size="large" /></View>;
  if (!order) return <View style={styles.loader}><Text>Order not found</Text></View>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#C2185B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Order ID + Status */}
        <View style={styles.orderBanner}>
          <Text style={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</Text>
          <View style={styles.statusBadge}><Text style={styles.statusText}>{order.status}</Text></View>
          <Text style={styles.orderDate}>{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
        </View>

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items Ordered</Text>
          {order.order_items?.map((item: any) => (
            <View key={item.id} style={styles.itemRow}>
              <Image source={{ uri: item.product_image }} style={styles.itemImg} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.product_name}</Text>
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>${(item.unit_price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Delivery */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery To</Text>
          <Text style={styles.deliveryName}>{order.delivery_name}</Text>
          <Text style={styles.deliveryDetail}>{order.delivery_email}</Text>
          <Text style={styles.deliveryDetail}>{order.delivery_phone}</Text>
          <Text style={styles.deliveryDetail}>{order.delivery_address}</Text>
        </View>

        {/* Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Summary</Text>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>${parseFloat(order.subtotal).toFixed(2)}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Shipping</Text><Text style={styles.summaryValue}>${parseFloat(order.shipping_fee).toFixed(2)}</Text></View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}><Text style={styles.totalLabel}>Total Paid</Text><Text style={styles.totalValue}>${parseFloat(order.total).toFixed(2)}</Text></View>
          {order.payment_last4 && <Text style={styles.paymentInfo}>Paid with card ending in ••••{order.payment_last4}</Text>}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF0F5' },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF0F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFE4EE', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#2D2D2D' },
  scroll: { padding: 16 },
  orderBanner: { backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1.5, borderColor: '#F0D0E0', marginBottom: 16 },
  orderId: { fontSize: 22, fontWeight: '800', color: '#2D2D2D' },
  statusBadge: { backgroundColor: '#4CAF50', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginTop: 8 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  orderDate: { fontSize: 13, color: '#999', marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1.5, borderColor: '#F0D0E0', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 14 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  itemImg: { width: 56, height: 56, borderRadius: 10, marginRight: 12 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#333' },
  itemQty: { fontSize: 12, color: '#999', marginTop: 2 },
  itemPrice: { fontSize: 15, fontWeight: '700', color: '#C2185B' },
  deliveryName: { fontSize: 16, fontWeight: '700', color: '#333' },
  deliveryDetail: { fontSize: 14, color: '#666', marginTop: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#666' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  divider: { height: 1.5, backgroundColor: '#F0D0E0', marginVertical: 8 },
  totalLabel: { fontSize: 16, fontWeight: '800', color: '#2D2D2D' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#C2185B' },
  paymentInfo: { fontSize: 13, color: '#999', marginTop: 8 },
});
