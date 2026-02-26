import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Alert, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// ─── Quiz Questions ─────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 'skin_type',
    question: 'How does your skin feel by midday without any products?',
    subtitle: 'This helps identify your base skin type.',
    options: [
      { label: '✨ Shiny all over', value: 'oily', sub: 'Excess sebum throughout' },
      { label: '🌵 Tight & flaky', value: 'dry', sub: 'Lacks moisture' },
      { label: '🌗 Oily T-zone, dry cheeks', value: 'combination', sub: 'Mixed skin type' },
      { label: '🌸 Balanced', value: 'normal', sub: 'Comfortable & even' },
      { label: '🔴 Easily irritated', value: 'sensitive', sub: 'Reacts to products' },
    ],
  },
  {
    id: 'primary_concern',
    question: 'What is your #1 skin concern right now?',
    subtitle: 'We\'ll prioritize this in your recommendations.',
    options: [
      { label: '🧴 Acne & breakouts', value: 'acne' },
      { label: '⏳ Fine lines & aging', value: 'aging' },
      { label: '☁️ Dull, tired skin', value: 'dullness' },
      { label: '🔍 Large pores', value: 'pores' },
      { label: '🌹 Redness & sensitivity', value: 'redness' },
    ],
  },
  {
    id: 'secondary_concern',
    question: 'Do you have any secondary skin concern?',
    subtitle: 'Optional — for fine-tuned results.',
    options: [
      { label: '🧴 Acne & breakouts', value: 'acne' },
      { label: '⏳ Fine lines & aging', value: 'aging' },
      { label: '☁️ Dull, tired skin', value: 'dullness' },
      { label: '🔍 Large pores', value: 'pores' },
      { label: '⏭️ No secondary concern', value: 'none' },
    ],
  },
  {
    id: 'sensitivity',
    question: 'How does your skin react to new products?',
    subtitle: 'Determines your sensitivity level.',
    options: [
      { label: '😌 Never reacts', value: 'low', sub: 'Tolerates most ingredients' },
      { label: '😐 Occasionally reacts', value: 'medium', sub: 'Some redness or tingling' },
      { label: '😣 Very easily irritated', value: 'high', sub: 'Frequent reactions' },
    ],
  },
  {
    id: 'sun_exposure',
    question: 'How often are you exposed to sunlight?',
    subtitle: 'UV is the #1 cause of premature aging.',
    options: [
      { label: '🏠 Rarely outdoors', value: 'rarely' },
      { label: '🚶 Sometimes outdoors', value: 'sometimes' },
      { label: '☀️ Outdoors most of the day', value: 'often' },
    ],
  },
  {
    id: 'moisturizer_use',
    question: 'Do you currently use a moisturizer?',
    subtitle: 'Tells us your current routine status.',
    options: [
      { label: '✅ Yes, every day', value: 'daily' },
      { label: '🔁 Yes, occasionally', value: 'sometimes' },
      { label: '❌ No, I skip it', value: 'never' },
    ],
  },
  {
    id: 'acne_freq',
    question: 'How frequently do you experience breakouts?',
    subtitle: "Even if acne isn't your main concern.",
    options: [
      { label: '🌙 Rarely (1–2 per month)', value: 'rare' },
      { label: '📅 Sometimes (weekly)', value: 'sometimes' },
      { label: '🔥 Often (constant breakouts)', value: 'often' },
      { label: '✨ Almost never', value: 'never' },
    ],
  },
  {
    id: 'skin_texture',
    question: 'How would you describe your skin texture?',
    subtitle: 'This helps with targeted treatments.',
    options: [
      { label: '🪞 Smooth & even', value: 'smooth' },
      { label: '🌾 Rough or bumpy', value: 'rough' },
      { label: '🗺️ Uneven tone', value: 'uneven' },
      { label: '🔴 Red, blotchy patches', value: 'blotchy' },
    ],
  },
  {
    id: 'eye_concern',
    question: 'Are you concerned about your under-eye area?',
    subtitle: 'The eye area needs specialized care.',
    options: [
      { label: '🌑 Dark circles', value: 'dark_circles' },
      { label: '💦 Puffiness', value: 'puffiness' },
      { label: '➰ Fine lines around eyes', value: 'fine_lines' },
      { label: '✨ No specific concern', value: 'none' },
    ],
  },
  {
    id: 'budget',
    question: 'What\'s your skincare budget range per product?',
    subtitle: 'We\'ll show products within your range.',
    options: [
      { label: '💚 Budget-friendly (under $15)', value: 'budget' },
      { label: '💛 Mid-range ($15–$40)', value: 'mid-range' },
      { label: '💜 Premium ($40+)', value: 'premium' },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function QuizScreen() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Card entry animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const startAnim = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Trigger animation on step change
  useEffect(() => {
    startAnim();
  }, [step, startAnim]);

  // Trigger animation on tab focus
  useFocusEffect(
    useCallback(() => {
      startAnim();
    }, [startAnim])
  );

  const q = QUESTIONS[step];
  const totalSteps = QUESTIONS.length;
  const progress = ((step) / totalSteps) * 100;

  const selectOption = (value: string) => {
    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);

    Animated.spring(progressAnim, {
      toValue: ((step + 1) / totalSteps) * 100,
      useNativeDriver: false,
    }).start();

    if (step < totalSteps - 1) {
      setTimeout(() => setStep(step + 1), 280);
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers: Record<string, string>) => {
    setLoading(true);
    try {
      const concerns: string[] = [];
      if (finalAnswers.primary_concern && finalAnswers.primary_concern !== 'none')
        concerns.push(finalAnswers.primary_concern);
      if (finalAnswers.secondary_concern && finalAnswers.secondary_concern !== 'none')
        concerns.push(finalAnswers.secondary_concern);

      const res = await api.post('/api/quiz/recommend', {
        skin_type: finalAnswers.skin_type,
        skin_concerns: concerns,
        sensitivity: finalAnswers.sensitivity,
        sun_exposure: finalAnswers.sun_exposure,
        budget: finalAnswers.budget,
        answers: finalAnswers,
      });

      router.push({
        pathname: '/quiz-results',
        params: {
          products: JSON.stringify(res.data.products),
          routine: JSON.stringify(res.data.routine),
          skin_type: res.data.skin_type || finalAnswers.skin_type,
        },
      });

    } catch (err: any) {
      Alert.alert('Error', 'Could not get recommendations. Please try again.');
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => { if (step > 0) setStep(step - 1); };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingEmoji}>🧴</Text>
        <Text style={styles.loadingText}>Analyzing your skin profile...</Text>
        <ActivityIndicator color="#1A1A1A" size="large" style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {step > 0 ? (
            <TouchableOpacity onPress={goBack} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color="#1A1A1A" />
            </TouchableOpacity>
          ) : <View style={{ width: 36 }} />}
          <Text style={styles.stepText}>{step + 1} / {totalSteps}</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[styles.progressBar, {
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            }]}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={styles.question}>{q.question}</Text>
          {q.subtitle && <Text style={styles.subtitle}>{q.subtitle}</Text>}

          <View style={styles.options}>
            {q.options.map((opt) => {
              const selected = answers[q.id] === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => selectOption(opt.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{opt.label}</Text>
                  {(opt as any).sub && (
                    <Text style={[styles.optionSub, selected && styles.optionSubSelected]}>{(opt as any).sub}</Text>
                  )}
                  {selected && (
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark-circle" size={22} color="#B47B84" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCF8F8' }, // Soft rosy white
  header: { paddingHorizontal: 20, paddingTop: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F2E6E8', alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 14, fontWeight: '700', color: '#B47B84', letterSpacing: 1 },
  progressTrack: { height: 6, backgroundColor: '#F2E6E8', borderRadius: 3 },
  progressBar: { height: 6, backgroundColor: '#B47B84', borderRadius: 3 }, // Dusty rose
  content: { padding: 24, paddingBottom: 60 },
  question: { fontSize: 24, fontWeight: '800', color: '#3A3435', marginTop: 8, lineHeight: 34, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#8A8082', marginTop: 6, marginBottom: 28 },
  options: { gap: 14 },
  option: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18, borderWidth: 2, borderColor: '#F2E6E8',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#B47B84', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },
  optionSelected: { borderColor: '#B47B84', backgroundColor: '#FFF5F6' },
  optionLabel: { fontSize: 16, color: '#3A3435', fontWeight: '600', flex: 1 },
  optionLabelSelected: { color: '#B47B84', fontWeight: '700' },
  optionSub: { fontSize: 12, color: '#8A8082', marginTop: 3 },
  optionSubSelected: { color: '#A06D74' },
  checkmark: { marginLeft: 8 },
  loadingContainer: { flex: 1, backgroundColor: '#FCF8F8', alignItems: 'center', justifyContent: 'center' },
  loadingEmoji: { fontSize: 60 },
  loadingText: { fontSize: 18, color: '#B47B84', fontWeight: '700', marginTop: 16 },
});
