import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
  Animated, FlatList, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '🍅',
    title: 'The Pomodoro\nTechnique',
    subtitle: 'Work in focused 25-minute sessions followed by short breaks to maximize your productivity.',
    gradient: ['#FF6B6B', '#FF4757'],
    bg: '#1A0A0A',
  },
  {
    id: '2',
    emoji: '🎯',
    title: 'Stay on\nTarget',
    subtitle: 'Add tasks and track which Pomodoros you dedicate to each goal. Stay organized effortlessly.',
    gradient: ['#7C4DFF', '#4A00E0'],
    bg: '#0A0A1A',
  },
  {
    id: '3',
    emoji: '📊',
    title: 'Track Your\nProgress',
    subtitle: 'View detailed statistics, streaks, and achievements as you build powerful work habits.',
    gradient: ['#4ECDC4', '#2EAD9E'],
    bg: '#0A1A1A',
  },
  {
    id: '4',
    emoji: '🏆',
    title: 'Earn\nAchievements',
    subtitle: 'Unlock badges and milestones as you stay consistent. Your dedication deserves recognition.',
    gradient: ['#FFD93D', '#FF9F1C'],
    bg: '#1A1400',
  },
];

export default function OnboardingScreen({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const renderSlide = ({ item, index }) => (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.slideContent, { backgroundColor: item.bg }]}>
        <View style={styles.emojiContainer}>
          <LinearGradient colors={item.gradient} style={styles.emojiGradient}>
            <Text style={styles.emoji}>{item.emoji}</Text>
          </LinearGradient>
          <View style={[styles.emojiGlow, { backgroundColor: item.gradient[0] + '30' }]} />
        </View>

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>

        <View style={styles.features}>
          {['Focus deeply', 'Rest smartly', 'Grow daily'].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <LinearGradient colors={item.gradient} style={styles.featureDot} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(idx);
        }}
        scrollEventThrottle={16}
      />

      <View style={styles.footer}>
        <View style={styles.indicators}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({ inputRange, outputRange: [8, 24, 8], extrapolate: 'clamp' });
            const opacity = scrollX.interpolate({ inputRange, outputRange: [0.4, 1, 0.4], extrapolate: 'clamp' });
            return (
              <Animated.View
                key={i}
                style={[styles.indicator, {
                  width: dotWidth,
                  opacity,
                  backgroundColor: SLIDES[currentIndex].gradient[0],
                }]}
              />
            );
          })}
        </View>

        <TouchableOpacity onPress={goNext} style={styles.buttonWrapper} activeOpacity={0.8}>
          <LinearGradient colors={SLIDES[currentIndex].gradient} style={styles.button}>
            <Text style={styles.buttonText}>
              {currentIndex === SLIDES.length - 1 ? "Let's Begin! 🚀" : 'Continue →'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {currentIndex < SLIDES.length - 1 && (
          <TouchableOpacity onPress={onComplete} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A1A' },
  slide: { flex: 1 },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 160,
  },
  emojiContainer: {
    position: 'relative',
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    zIndex: -1,
  },
  emoji: { fontSize: 60 },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  features: { gap: 12, width: '100%' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureDot: { width: 8, height: 8, borderRadius: 4 },
  featureText: { color: COLORS.textSecondary, fontSize: 14 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10,10,26,0.95)',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
  },
  buttonWrapper: { borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  button: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  skipButton: { alignItems: 'center', paddingVertical: 8 },
  skipText: { color: COLORS.textMuted, fontSize: 14 },
});
