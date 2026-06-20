import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, TIMER_COLORS } from '../constants/colors';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

const SESSION_ICONS = {
  pomodoro: '🍅',
  shortBreak: '☕',
  longBreak: '🌟',
};

const SESSION_LABELS = {
  pomodoro: 'Focus Session',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

function groupByDate(sessions) {
  const groups = {};
  sessions.forEach(s => {
    const date = new Date(s.timestamp).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(s);
  });
  return Object.entries(groups).map(([date, items]) => ({ date, items }));
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const today = new Date().toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === today) return 'Today';
  if (dateStr === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function SessionItem({ session, tasks }) {
  const colors = TIMER_COLORS[session.type] || TIMER_COLORS.pomodoro;
  const task = tasks.find(t => t.id === session.taskId);

  return (
    <View style={styles.sessionItem}>
      <View style={[styles.sessionIcon, { backgroundColor: colors.primary + '20' }]}>
        <Text style={styles.sessionEmoji}>{SESSION_ICONS[session.type] || '🍅'}</Text>
      </View>
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionLabel}>{SESSION_LABELS[session.type]}</Text>
        {task && <Text style={styles.sessionTask} numberOfLines={1}>📌 {task.title}</Text>}
        <Text style={styles.sessionTime}>{formatTime(session.timestamp)}</Text>
      </View>
      <View style={styles.sessionDuration}>
        <Text style={[styles.sessionDur, { color: colors.primary }]}>{session.duration}m</Text>
        <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const { sessions, tasks, stats } = useApp();
  const [view, setView] = useState('list');

  const grouped = groupByDate(sessions);
  const pomodoroSessions = sessions.filter(s => s.type === 'pomodoro');

  const totalToday = sessions.filter(s => {
    const sDate = new Date(s.timestamp).toDateString();
    return sDate === new Date().toDateString() && s.type === 'pomodoro';
  }).length;

  if (sessions.length === 0) {
    return (
      <LinearGradient colors={['#0A0A1A', '#12122A', '#0A0A1A']} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>History</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📜</Text>
          <Text style={styles.emptyTitle}>No sessions yet</Text>
          <Text style={styles.emptyDesc}>Complete your first Pomodoro to see your history</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0A0A1A', '#12122A', '#0A0A1A']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>History</Text>
          <Text style={styles.headerSub}>{sessions.length} sessions total</Text>
        </View>
      </View>

      {/* Summary strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{totalToday}</Text>
          <Text style={styles.summaryLabel}>Today</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{pomodoroSessions.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{stats?.currentStreak || 0}🔥</Text>
          <Text style={styles.summaryLabel}>Streak</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{stats?.totalMinutes || 0}m</Text>
          <Text style={styles.summaryLabel}>Focus</Text>
        </View>
      </View>

      {/* Session List */}
      <FlatList
        data={grouped}
        keyExtractor={item => item.date}
        renderItem={({ item }) => {
          const dayPomodoros = item.items.filter(s => s.type === 'pomodoro').length;
          const dayMinutes = item.items.reduce((acc, s) => acc + (s.duration || 0), 0);
          return (
            <View style={styles.dateGroup}>
              <View style={styles.dateHeader}>
                <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                <View style={styles.dateMeta}>
                  <Text style={styles.dateMetaText}>🍅 {dayPomodoros} · ⏱️ {dayMinutes}m</Text>
                </View>
              </View>
              {item.items.map(session => (
                <SessionItem key={session.id} session={session} tasks={tasks} />
              ))}
            </View>
          );
        }}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  headerTitle: { fontSize: FONT_SIZES.xxxl, fontWeight: '800', color: COLORS.text },
  headerSub: { fontSize: FONT_SIZES.md, color: COLORS.textMuted },
  summaryStrip: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text },
  summaryLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 4 },
  summaryDivider: { width: 1, backgroundColor: COLORS.border },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
  dateGroup: { marginBottom: SPACING.lg },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dateText: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  dateMeta: {},
  dateMetaText: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '40',
  },
  sessionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionEmoji: { fontSize: 22 },
  sessionInfo: { flex: 1 },
  sessionLabel: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text },
  sessionTask: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  sessionTime: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  sessionDuration: { alignItems: 'center', gap: 4 },
  sessionDur: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptyDesc: { fontSize: FONT_SIZES.md, color: COLORS.textMuted, textAlign: 'center' },
});
