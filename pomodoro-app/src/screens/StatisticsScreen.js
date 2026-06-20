import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/colors';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

const { width } = Dimensions.get('window');
const CHART_W = width - 48;
const CHART_H = 140;
const BAR_W = (CHART_W - 48) / 7;
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function WeeklyChart({ data }) {
  const max = Math.max(...data, 1);
  const today = new Date().getDay();

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.sectionTitle}>This Week</Text>
      <Svg width={CHART_W} height={CHART_H + 40} style={{ marginTop: 8 }}>
        {data.map((val, i) => {
          const barH = Math.max((val / max) * CHART_H, val > 0 ? 8 : 2);
          const x = 24 + i * BAR_W;
          const y = CHART_H - barH + 8;
          const isToday = i === today;

          return (
            <React.Fragment key={i}>
              <Rect
                x={x + BAR_W * 0.15}
                y={y}
                width={BAR_W * 0.7}
                height={barH}
                rx={4}
                fill={isToday ? COLORS.primary : (val > 0 ? COLORS.primaryDark : COLORS.border)}
                opacity={isToday ? 1 : 0.7}
              />
              <SvgText
                x={x + BAR_W / 2}
                y={CHART_H + 24}
                fill={isToday ? COLORS.primary : COLORS.textMuted}
                fontSize="11"
                textAnchor="middle"
                fontWeight={isToday ? '700' : '400'}
              >
                {DAYS[i]}
              </SvgText>
              {val > 0 && (
                <SvgText
                  x={x + BAR_W / 2}
                  y={y - 4}
                  fill={COLORS.textSecondary}
                  fontSize="10"
                  textAnchor="middle"
                >
                  {val}
                </SvgText>
              )}
            </React.Fragment>
          );
        })}
        <Line
          x1={20}
          y1={CHART_H + 8}
          x2={CHART_W}
          y2={CHART_H + 8}
          stroke={COLORS.border}
          strokeWidth={1}
        />
      </Svg>
    </View>
  );
}

function StatCard({ icon, label, value, sub, gradient, emoji }) {
  return (
    <LinearGradient colors={gradient || [COLORS.card, COLORS.cardLight]} style={styles.statCard}>
      <View style={styles.statCardTop}>
        <Text style={styles.statEmoji}>{emoji}</Text>
        <View style={styles.statCardRight}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statLabel}>{label}</Text>
        </View>
      </View>
      {sub && <Text style={styles.statSub}>{sub}</Text>}
    </LinearGradient>
  );
}

function HeatmapRow({ sessions }) {
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    const dateStr = d.toDateString();
    const count = sessions.filter(s => {
      const sDate = new Date(s.timestamp);
      return sDate.toDateString() === dateStr && s.type === 'pomodoro';
    }).length;
    return { count, day: d.getDay() };
  });

  const getColor = (count) => {
    if (count === 0) return COLORS.card;
    if (count <= 2) return COLORS.primary + '40';
    if (count <= 4) return COLORS.primary + '70';
    if (count <= 6) return COLORS.primary + 'A0';
    return COLORS.primary;
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Last 28 Days</Text>
      <View style={styles.heatmap}>
        {days.map((d, i) => (
          <View key={i} style={[styles.heatCell, { backgroundColor: getColor(d.count) }]} />
        ))}
      </View>
    </View>
  );
}

export default function StatisticsScreen() {
  const { stats, sessions, tasks } = useApp();
  const [period, setPeriod] = useState('week');

  const totalHours = stats ? Math.floor(stats.totalMinutes / 60) : 0;
  const totalMins = stats ? stats.totalMinutes % 60 : 0;
  const completedTasks = tasks.filter(t => t.completed).length;
  const avgPerDay = stats && stats.currentStreak > 0
    ? (stats.totalPomodoros / Math.max(stats.currentStreak, 1)).toFixed(1)
    : '0';

  return (
    <LinearGradient colors={['#0A0A1A', '#12122A', '#0A0A1A']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Statistics</Text>
          <Text style={styles.headerSub}>Your productivity insights</Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.statsGrid}>
          <StatCard
            emoji="🍅"
            label="Total Pomodoros"
            value={stats?.totalPomodoros || 0}
            sub={`${avgPerDay}/day avg`}
            gradient={[COLORS.pomodoro + '20', COLORS.card]}
          />
          <StatCard
            emoji="⏱️"
            label="Focus Time"
            value={`${totalHours}h ${totalMins}m`}
            sub="total focus"
            gradient={[COLORS.primary + '20', COLORS.card]}
          />
          <StatCard
            emoji="🔥"
            label="Current Streak"
            value={`${stats?.currentStreak || 0} days`}
            sub={`Best: ${stats?.longestStreak || 0} days`}
            gradient={[COLORS.warning + '20', COLORS.card]}
          />
          <StatCard
            emoji="✅"
            label="Tasks Done"
            value={completedTasks}
            sub={`${tasks.length} total`}
            gradient={[COLORS.success + '20', COLORS.card]}
          />
          <StatCard
            emoji="📅"
            label="Today"
            value={stats?.todayPomodoros || 0}
            sub="sessions"
            gradient={[COLORS.shortBreak + '20', COLORS.card]}
          />
          <StatCard
            emoji="🎯"
            label="Best Day"
            value={Math.max(...(stats?.weeklyData || [0]))}
            sub="sessions"
            gradient={[COLORS.accent + '20', COLORS.card]}
          />
        </View>

        {/* Weekly Chart */}
        {stats?.weeklyData && (
          <View style={styles.section}>
            <WeeklyChart data={stats.weeklyData} />
          </View>
        )}

        {/* Heatmap */}
        <View style={styles.section}>
          <HeatmapRow sessions={sessions} />
        </View>

        {/* Session Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Types</Text>
          {[
            { label: 'Focus Sessions', count: sessions.filter(s => s.type === 'pomodoro').length, color: COLORS.pomodoro },
            { label: 'Short Breaks', count: sessions.filter(s => s.type === 'shortBreak').length, color: COLORS.shortBreak },
            { label: 'Long Breaks', count: sessions.filter(s => s.type === 'longBreak').length, color: COLORS.longBreak },
          ].map((item, i) => {
            const total = sessions.length || 1;
            const pct = Math.round((item.count / total) * 100);
            return (
              <View key={i} style={styles.breakdownRow}>
                <View style={[styles.breakdownDot, { backgroundColor: item.color }]} />
                <Text style={styles.breakdownLabel}>{item.label}</Text>
                <View style={styles.breakdownBarWrap}>
                  <View style={[styles.breakdownBar, { width: `${pct}%`, backgroundColor: item.color }]} />
                </View>
                <Text style={styles.breakdownCount}>{item.count}</Text>
              </View>
            );
          })}
        </View>

        {/* Productivity Score */}
        <View style={styles.section}>
          <LinearGradient colors={COLORS.gradientPrimary} style={styles.scoreCard}>
            <Text style={styles.scoreEmoji}>⚡</Text>
            <View>
              <Text style={styles.scoreTitle}>Productivity Score</Text>
              <Text style={styles.scoreValue}>
                {Math.min(100, Math.round(((stats?.totalPomodoros || 0) * 2 + (stats?.currentStreak || 0) * 5)))}
              </Text>
            </View>
            <Text style={styles.scoreSubtitle}>Keep going!</Text>
          </LinearGradient>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 100 },
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  headerTitle: { fontSize: FONT_SIZES.xxxl, fontWeight: '800', color: COLORS.text },
  headerSub: { fontSize: FONT_SIZES.md, color: COLORS.textMuted },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCard: {
    width: (width - 48 - 8) / 2,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statCardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statEmoji: { fontSize: 28 },
  statCardRight: {},
  statValue: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  statSub: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 6 },
  section: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  chartContainer: {},
  heatmap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  heatCell: {
    width: (CHART_W - 27 * 4) / 28,
    height: (CHART_W - 27 * 4) / 28,
    borderRadius: 3,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  breakdownDot: { width: 10, height: 10, borderRadius: 5 },
  breakdownLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, width: 100 },
  breakdownBarWrap: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  breakdownBar: { height: '100%', borderRadius: 3 },
  breakdownCount: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '700', width: 24, textAlign: 'right' },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  scoreEmoji: { fontSize: 36 },
  scoreTitle: { color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZES.sm },
  scoreValue: { color: COLORS.text, fontSize: FONT_SIZES.hero, fontWeight: '800' },
  scoreSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: FONT_SIZES.sm, marginLeft: 'auto' },
});
