import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Vibration, Platform, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp, TIMER_MODES } from '../context/AppContext';
import CircularTimer from '../components/CircularTimer';
import { COLORS, TIMER_COLORS } from '../constants/colors';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

const { width } = Dimensions.get('window');

const MODE_TABS = [
  { key: TIMER_MODES.POMODORO, label: 'Focus' },
  { key: TIMER_MODES.SHORT_BREAK, label: 'Short' },
  { key: TIMER_MODES.LONG_BREAK, label: 'Long' },
];

export default function HomeScreen({ navigation }) {
  const {
    timerMode, switchMode, timeLeft, isRunning, toggleTimer,
    resetTimer, skipTimer, completedPomodoros, getProgress,
    formatTime, settings, tasks, activeTaskId, setActiveTaskId,
  } = useApp();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const colors = TIMER_COLORS[timerMode];
  const progress = getProgress();
  const activeTask = tasks.find(t => t.id === activeTaskId);

  useEffect(() => {
    if (isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 1500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }
  }, [isRunning]);

  const handleToggle = () => {
    if (settings.vibrationEnabled) Vibration.vibrate(50);
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.spring(buttonScale, { toValue: 1, tension: 200, useNativeDriver: true }),
    ]).start();
    toggleTimer();
  };

  const pomodoroCount = Array.from({ length: settings.longBreakInterval }, (_, i) => i);

  return (
    <LinearGradient colors={['#0A0A1A', '#12122A', '#0A0A1A']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Focus! 🧠</Text>
            <Text style={styles.headerSub}>Stay in the zone</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('FocusMode')} style={styles.focusBtn}>
            <Ionicons name="scan-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Mode Tabs */}
        <View style={styles.tabContainer}>
          {MODE_TABS.map(tab => {
            const active = timerMode === tab.key;
            const tColor = TIMER_COLORS[tab.key];
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => switchMode(tab.key)}
                style={[styles.tab, active && { backgroundColor: tColor.primary + '20', borderColor: tColor.primary }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, active && { color: tColor.primary, fontWeight: '700' }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Timer Circle */}
        <View style={styles.timerSection}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <CircularTimer
              progress={progress}
              size={width * 0.72}
              strokeWidth={14}
              color={colors.primary}
              glowColor={colors.light}
            >
              <Text style={styles.timerModeLabel}>{colors.label}</Text>
              <Text style={[styles.timerText, { color: colors.primary }]}>
                {formatTime(timeLeft)}
              </Text>
              <View style={styles.pomoDots}>
                {pomodoroCount.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.pomoDot, i < (completedPomodoros % settings.longBreakInterval) && {
                      backgroundColor: colors.primary,
                    }]}
                  />
                ))}
              </View>
            </CircularTimer>
          </Animated.View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={resetTimer} style={styles.controlBtn} activeOpacity={0.7}>
            <LinearGradient colors={[COLORS.card, COLORS.cardLight]} style={styles.controlBtnInner}>
              <Ionicons name="refresh" size={22} color={COLORS.textSecondary} />
            </LinearGradient>
          </TouchableOpacity>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity onPress={handleToggle} activeOpacity={0.8} style={styles.mainBtnWrapper}>
              <LinearGradient colors={colors.gradient} style={styles.mainBtn}>
                <Ionicons
                  name={isRunning ? 'pause' : 'play'}
                  size={34}
                  color={COLORS.text}
                />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity onPress={skipTimer} style={styles.controlBtn} activeOpacity={0.7}>
            <LinearGradient colors={[COLORS.card, COLORS.cardLight]} style={styles.controlBtnInner}>
              <Ionicons name="play-skip-forward" size={22} color={COLORS.textSecondary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Session Counter */}
        <View style={styles.sessionRow}>
          <View style={styles.sessionCard}>
            <Text style={styles.sessionNumber}>{completedPomodoros}</Text>
            <Text style={styles.sessionLabel}>Today's Focus</Text>
          </View>
          <View style={styles.sessionDivider} />
          <View style={styles.sessionCard}>
            <Text style={styles.sessionNumber}>{completedPomodoros * settings.pomodoroTime}</Text>
            <Text style={styles.sessionLabel}>Minutes</Text>
          </View>
          <View style={styles.sessionDivider} />
          <View style={styles.sessionCard}>
            <Text style={styles.sessionNumber}>{settings.longBreakInterval - (completedPomodoros % settings.longBreakInterval)}</Text>
            <Text style={styles.sessionLabel}>Until Long Break</Text>
          </View>
        </View>

        {/* Active Task */}
        <View style={styles.taskSection}>
          <View style={styles.taskSectionHeader}>
            <Text style={styles.sectionTitle}>Current Task</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
              <Text style={[styles.sectionLink, { color: colors.primary }]}>Change →</Text>
            </TouchableOpacity>
          </View>

          {activeTask ? (
            <LinearGradient colors={[COLORS.card, COLORS.cardLight]} style={styles.activeTaskCard}>
              <View style={[styles.taskPriority, { backgroundColor: colors.primary }]} />
              <View style={styles.taskInfo}>
                <Text style={styles.taskTitle} numberOfLines={1}>{activeTask.title}</Text>
                <Text style={styles.taskSubs}>
                  🍅 {activeTask.completedPomodoros}/{activeTask.estimatedPomodoros} sessions
                </Text>
              </View>
              <TouchableOpacity onPress={() => setActiveTaskId(null)}>
                <Ionicons name="close-circle" size={22} color={COLORS.textMuted} />
              </TouchableOpacity>
            </LinearGradient>
          ) : (
            <TouchableOpacity
              onPress={() => navigation.navigate('Tasks')}
              style={styles.noTaskCard}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={24} color={COLORS.textMuted} />
              <Text style={styles.noTaskText}>Select a task to focus on</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Tasks */}
        {tasks.length > 0 && (
          <View style={styles.quickTasks}>
            <Text style={styles.sectionTitle}>Quick Select</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll}>
              {tasks.filter(t => !t.completed).slice(0, 5).map(task => (
                <TouchableOpacity
                  key={task.id}
                  onPress={() => setActiveTaskId(task.id)}
                  style={[styles.quickTask, task.id === activeTaskId && {
                    borderColor: colors.primary,
                    backgroundColor: colors.primary + '20',
                  }]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickTaskTitle} numberOfLines={1}>{task.title}</Text>
                  <Text style={styles.quickTaskSub}>🍅 {task.estimatedPomodoros || 1}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  greeting: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.text },
  headerSub: { fontSize: FONT_SIZES.md, color: COLORS.textMuted, marginTop: 2 },
  focusBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.xl,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabText: { fontSize: FONT_SIZES.md, color: COLORS.textMuted, fontWeight: '500' },
  timerSection: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  timerModeLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  timerText: {
    fontSize: FONT_SIZES.giant,
    fontWeight: '800',
    letterSpacing: -2,
  },
  pomoDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  pomoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.border,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: SPACING.lg,
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  controlBtnInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mainBtnWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  mainBtn: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
  },
  sessionRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sessionCard: { flex: 1, alignItems: 'center' },
  sessionNumber: { fontSize: FONT_SIZES.xxxl, fontWeight: '800', color: COLORS.text },
  sessionLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, textAlign: 'center', marginTop: 4 },
  sessionDivider: { width: 1, backgroundColor: COLORS.border },
  taskSection: { marginHorizontal: SPACING.lg, marginTop: SPACING.lg },
  taskSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  sectionLink: { fontSize: FONT_SIZES.md },
  activeTaskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  taskPriority: { width: 4, height: '80%', borderRadius: 2 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text },
  taskSubs: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, marginTop: 4 },
  noTaskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  noTaskText: { color: COLORS.textMuted, fontSize: FONT_SIZES.md },
  quickTasks: { marginTop: SPACING.lg, paddingHorizontal: SPACING.lg },
  quickScroll: { marginTop: SPACING.sm },
  quickTask: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginRight: SPACING.sm,
    minWidth: 120,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickTaskTitle: { color: COLORS.text, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  quickTaskSub: { color: COLORS.textMuted, fontSize: FONT_SIZES.xs, marginTop: 4 },
});
