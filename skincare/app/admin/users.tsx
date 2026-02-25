import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/users').then(r => setUsers(r.data)).finally(() => setLoading(false));
  }, []);

  const renderUser = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{(item.full_name || item.email || 'U')[0].toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.full_name || '—'}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <Text style={styles.date}>Joined {new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
      <View style={[styles.roleBadge, item.role === 'admin' && styles.adminBadge]}>
        <Text style={[styles.roleText, item.role === 'admin' && styles.adminRoleText]}>{item.role}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator color="#C2185B" size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<Text style={styles.count}>{users.length} registered users</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF0F5' },
  list: { padding: 16 },
  count: { fontSize: 14, color: '#AD7FA0', fontWeight: '600', marginBottom: 12 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, marginBottom: 10, padding: 14, borderWidth: 1.5, borderColor: '#F0D0E0', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFE4EE', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '800', color: '#C2185B' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#333' },
  email: { fontSize: 13, color: '#999', marginTop: 2 },
  date: { fontSize: 11, color: '#AD7FA0', marginTop: 2 },
  roleBadge: { backgroundColor: '#F5E6F0', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  adminBadge: { backgroundColor: '#FFE4EE' },
  roleText: { fontSize: 11, fontWeight: '700', color: '#AD7FA0', textTransform: 'uppercase' },
  adminRoleText: { color: '#C2185B' },
});
