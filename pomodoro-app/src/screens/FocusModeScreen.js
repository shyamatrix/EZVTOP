import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions, StatusBar, Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp, TIMER_MODES } from '../context/AppContext';
import CircularTimer from '../components/CircularTimer';
import { COLORS, TIMER_COLORS } from '../constants/colors';

const { width, height } = Dimensions.get('window');

export default function FocusModeScreen({ navigation }) {
  const { timerMode, timeLeft, isRunning, toggleTimer, resetTimer, skipTimer,
    getProgress, formatTime, settings, tasks, activeTaskId } = useApp();

  const colors = TIMER_COLORS[timerMode];
  const progress = getProgress();
  const activeTask = tasks.find(t => t.id === activeTaskId);
  const bgAnim = useRef(new Animated.Value(0)).current;
  const breatheAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, { toValue: 1.02, duration: 4000, useNativeDriver: true }),
          Animated.timing(breatheAnim, { toValue: 1, duration: 4000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      breatheAnim.stopAnimation();
    }
  }, [isRunning]);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <LinearGradient
        colors={['#000000', '#0A0A1A', '#000000']}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient glow */}
      <Animated.View style={[styles.ambientGlow, {
        backgroundColor: colors.glow,
        transform: [{ scale: breatheAnim }],
      }]} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-down" size={26} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.modeLabel}>{colors.label}</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Timer */}
      <View style={styles.timerContainer}>
        <Animated.View style={{ transform: [{ scale: breatheAnim }] }}>
          <CircularTimer
            progress={progress}
            size={width * 0.82}
            strokeWidth={16}
            color={colors.primary}
            glowColor={colors.light}
          >
            <Text style={[styles.timeDisplay, { color: colors.primary }]}>
              {formatTime(timeLeft)}
            </Text>
            {isRunning && (
              <Text style={styles.breathText}>
                {timerMode === TIMER_MODES.POMODORO ? '💪 Stay focused' : '😌 Rest & recharge'}
              </Text>
            )}
          </CircularTimer>
        </Animated.View>
      </View>

      {/* Active task */}
      {activeTask && (
        <View style={styles.taskDisplay}>
          <Text style={styles.taskLabel}>Working on</Text>
          <Text style={styles.taskName} numberOfLines={2}>{activeTask.title}</Text>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={resetTimer} style={styles.sideBtn}>
          <Ionicons name="refresh" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {
          if (settings.vibrationEnabled) Vibration.vibrate(50);
          toggleTimer();
        }} style={styles.playBtn} activeOpacity={0.8}>
          <LinearGradient colors={colors.gradient} style={styles.playBtnGrad}>
            <Ionicons name={isRunning ? 'pause' : 'play'} size={40} color={COLORS.text} />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={skipTimer} style={styles.sideBtn}>
          <Ionicons name="play-skip-forward" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Timer states hint */}
      <View style={styles.stateHints}>
        {[TIMER_MODES.POMODORO, TIMER_MODES.SHORT_BREAK, TIMER_MODES.LONG_BREAK].map(mode => {
          const tc = TIMER_COLORS[mode];
          const active = timerMode === mode;
          return (
            <View key={mode} style={[styles.stateHint, active && { borderColor: tc.primary }]}>
              <View style={[styles.stateHintDot, { backgroundColor: active ? tc.primary : COLORS.textMuted }]} />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  ambientGlow: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width,
    top: -width * 0.3,
    left: -width * 0.25,
    opacity: 0.15,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 24,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  modeLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeDisplay: {
    fontSize: 72,
    fontWeight: '800',
    letterSpacing: -3,
  },
  breathText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 12,
    letterSpacing: 0.5,
  },
  taskDisplay: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  taskLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  taskName: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  sideBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  playBtnGrad: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateHints: {
    flexDirection: 'row',
    gap: 12,
  },
  stateHint: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateHintDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
