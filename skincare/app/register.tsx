import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { router, Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), password, fullName.trim());
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Registration Failed', err?.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>✨ CutieSkin</Text>
          <Text style={styles.tagline}>Create your skincare profile</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start your glow journey today</Text>

          {([
            { label: 'Full Name', value: fullName, set: setFullName, placeholder: 'Jane Doe' },
            { label: 'Email', value: email, set: setEmail, placeholder: 'you@example.com', keyboard: 'email-address' as const },
            { label: 'Password', value: password, set: setPassword, placeholder: '••••••••', secure: true },
            { label: 'Confirm Password', value: confirm, set: setConfirm, placeholder: '••••••••', secure: true },
          ] as any[]).map((field) => (
            <View style={styles.inputGroup} key={field.label}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={field.placeholder}
                placeholderTextColor="#C4A9BA"
                keyboardType={field.keyboard || 'default'}
                autoCapitalize={field.keyboard === 'email-address' ? 'none' : 'words'}
                secureTextEntry={field.secure}
                value={field.value}
                onChangeText={field.set}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
          </TouchableOpacity>

          <Link href="/login" asChild>
            <TouchableOpacity style={styles.linkRow}>
              <Text style={styles.linkText}>Already have an account? <Text style={styles.link}>Sign In</Text></Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF0F5' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 36, fontWeight: '800', color: '#C2185B', letterSpacing: 1 },
  tagline: { fontSize: 14, color: '#AD7FA0', marginTop: 6 },
  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 28,
    shadowColor: '#C2185B', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1, shadowRadius: 20, elevation: 8,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#2D2D2D', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 24 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  input: {
    backgroundColor: '#FFF5FA', borderWidth: 1.5, borderColor: '#F0D0E0',
    borderRadius: 12, padding: 14, fontSize: 15, color: '#333',
  },
  btn: {
    backgroundColor: '#C2185B', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
    shadowColor: '#C2185B', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkRow: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#888', fontSize: 14 },
  link: { color: '#C2185B', fontWeight: '700' },
});
