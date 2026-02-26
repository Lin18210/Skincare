import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ConfirmationScreen() {
  const { orderId, total, name, email } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Success animation */}
        <View style={styles.successCircle}>
          <Text style={styles.successEmoji}>🎉</Text>
        </View>

        <Text style={styles.title}>Order Confirmed!</Text>
        <Text style={styles.subtitle}>Thank you, {name}! Your skincare goodies are on their way.</Text>

        {/* Order card */}
        <View style={styles.orderCard}>
          <View style={styles.orderRow}>
            <Ionicons name="receipt-outline" size={18} color="#666666" />
            <Text style={styles.orderLabel}>Order Number</Text>
          </View>
          <Text style={styles.orderId}>#{String(orderId).slice(0, 8).toUpperCase()}</Text>

          <View style={styles.divider} />

          <View style={styles.orderRow}>
            <Ionicons name="mail-outline" size={18} color="#666666" />
            <Text style={styles.orderLabel}>Confirmation sent to</Text>
          </View>
          <Text style={styles.orderValue}>{email}</Text>

          <View style={styles.divider} />

          <View style={styles.orderRow}>
            <Ionicons name="cash-outline" size={18} color="#666666" />
            <Text style={styles.orderLabel}>Amount Paid</Text>
          </View>
          <Text style={styles.orderPrice}>${parseFloat(total as string).toFixed(2)}</Text>
        </View>

        {/* Delivery steps */}
        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>What happens next?</Text>
          {[
            { icon: '✅', title: 'Order Received', sub: 'We\'ve got your order' },
            { icon: '📦', title: 'Processing', sub: 'Your items are being packed' },
            { icon: '🚚', title: 'Shipping', sub: 'On its way to you' },
            { icon: '🌸', title: 'Delivered', sub: 'Enjoy your skincare!' },
          ].map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.stepDot, i === 0 && styles.stepDotActive]}>
                <Text style={styles.stepIcon}>{step.icon}</Text>
              </View>
              <View style={styles.stepInfo}>
                <Text style={[styles.stepTitle, i === 0 && styles.stepTitleActive]}>{step.title}</Text>
                <Text style={styles.stepSub}>{step.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={styles.historyBtn}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Ionicons name="time-outline" size={18} color="#1A1A1A" />
          <Text style={styles.historyBtnText}>View Order History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shopBtn}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.shopBtnText}>Back to Home</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  scroll: { padding: 24, alignItems: 'center' },
  successCircle: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', marginTop: 20,
    shadowColor: '#1A1A1A', shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
    borderWidth: 3, borderColor: '#EAEAEA',
  },
  successEmoji: { fontSize: 56 },
  title: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', marginTop: 20, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#666', textAlign: 'center', marginTop: 8, lineHeight: 22, marginBottom: 28 },
  orderCard: { width: '100%', backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1.5, borderColor: '#EAEAEA', marginBottom: 16 },
  orderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  orderLabel: { fontSize: 13, color: '#666666', fontWeight: '600' },
  orderId: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 12 },
  orderValue: { fontSize: 16, color: '#333', fontWeight: '600', marginBottom: 12 },
  orderPrice: { fontSize: 24, fontWeight: '800', color: '#2D2D2D' },
  divider: { height: 1.5, backgroundColor: '#EAEAEA', marginVertical: 12 },
  stepsCard: { width: '100%', backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1.5, borderColor: '#EAEAEA', marginBottom: 20 },
  stepsTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  stepDot: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F5E6F0', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  stepDotActive: { backgroundColor: '#F0F0F0', borderWidth: 2, borderColor: '#1A1A1A' },
  stepIcon: { fontSize: 20 },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: '#666' },
  stepTitleActive: { color: '#1A1A1A' },
  stepSub: { fontSize: 13, color: '#999', marginTop: 2 },
  historyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, borderRadius: 14, borderWidth: 2, borderColor: '#1A1A1A', width: '100%', justifyContent: 'center', marginBottom: 12 },
  historyBtnText: { color: '#1A1A1A', fontSize: 16, fontWeight: '700' },
  shopBtn: { backgroundColor: '#1A1A1A', borderRadius: 14, padding: 16, width: '100%', alignItems: 'center', shadowColor: '#1A1A1A', shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  shopBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
