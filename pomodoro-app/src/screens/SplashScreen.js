import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.stagger(200, [
        Animated.timing(ring1, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(ring2, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(ring3, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    ]).start(() => {
      setTimeout(onFinish, 800);
    });
  }, []);

  const ringStyle = (anim) => ({
    opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.6, 0] }),
    transform: [{
      scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 2.5] }),
    }],
  });

  return (
    <LinearGradient colors={['#0A0A1A', '#1A0A3A', '#0A1A3A']} style={styles.container}>
      <View style={styles.logoContainer}>
        <Animated.View style={[styles.ring, ringStyle(ring3), { borderColor: COLORS.primary }]} />
        <Animated.View style={[styles.ring, ringStyle(ring2), { borderColor: COLORS.pomodoro }]} />
        <Animated.View style={[styles.ring, ringStyle(ring1), { borderColor: COLORS.shortBreak }]} />
        <Animated.View style={[styles.logoWrapper, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          <LinearGradient colors={COLORS.gradientPomodoro} style={styles.logoGradient}>
            <Text style={styles.logoEmoji}>🍅</Text>
          </LinearGradient>
        </Animated.View>
      </View>

      <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
        <Text style={styles.appName}>PomodoroFlow</Text>
        <Text style={styles.tagline}>Stay Focused. Get Things Done.</Text>
      </Animated.View>

      <View style={styles.dots}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    width: 180,
    height: 180,
  },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 52,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  dots: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textMuted,
  },
  dotActive: {
    width: 20,
    backgroundColor: COLORS.primary,
  },
});
