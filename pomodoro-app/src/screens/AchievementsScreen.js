import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/colors';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

const { width } = Dimensions.get('window');

const ALL_ACHIEVEMENTS = [
  { id: 'first', title: 'First Focus!', desc: 'Completed your first Pomodoro', icon: '🍅', rarity: 'common', category: 'Milestones', count: 1 },
  { id: 'five', title: 'Getting Warmed Up', desc: '5 Pomodoros completed', icon: '🔥', rarity: 'common', category: 'Milestones', count: 5 },
  { id: 'ten', title: 'Focused Mind', desc: '10 Pomodoros completed', icon: '🎯', rarity: 'uncommon', category: 'Milestones', count: 10 },
  { id: 'twentyfive', title: 'Productivity Pro', desc: '25 Pomodoros completed', icon: '⭐', rarity: 'uncommon', category: 'Milestones', count: 25 },
  { id: 'fifty', title: 'Flow Master', desc: '50 Pomodoros completed', icon: '💎', rarity: 'rare', category: 'Milestones', count: 50 },
  { id: 'hundred', title: 'Centurion', desc: '100 Pomodoros completed', icon: '🏆', rarity: 'epic', category: 'Milestones', count: 100 },
  { id: 'streak3', title: '3-Day Streak', desc: '3 days in a row', icon: '📅', rarity: 'common', category: 'Streaks', streak: 3 },
  { id: 'streak7', title: 'Week Warrior', desc: '7-day streak achieved', icon: '🌟', rarity: 'uncommon', category: 'Streaks', streak: 7 },
  { id: 'streak30', title: 'Iron Will', desc: '30-day streak', icon: '👑', rarity: 'legendary', category: 'Streaks', streak: 30 },
];

const RARITY_COLORS = {
  common: { color: '#A0A0C8', gradient: ['#A0A0C8', '#6060A8'] },
  uncommon: { color: '#4ECDC4', gradient: ['#4ECDC4', '#2EAD9E'] },
  rare: { color: '#7C4DFF', gradient: ['#7C4DFF', '#4A00E0'] },
  epic: { color: '#FF6B6B', gradient: ['#FF6B6B', '#FF4757'] },
  legendary: { color: '#FFD93D', gradient: ['#FFD93D', '#FF9F1C'] },
};

function AchievementCard({ achievement, unlocked, unlockedAt }) {
  const rarity = RARITY_COLORS[achievement.rarity] || RARITY_COLORS.common;

  return (
    <View style={[styles.card, !unlocked && styles.cardLocked]}>
      <LinearGradient
        colors={unlocked ? [rarity.color + '30', COLORS.card] : [COLORS.card, COLORS.backgroundSecondary]}
        style={styles.cardInner}
      >
        {unlocked && (
          <View style={[styles.rarityBadge, { backgroundColor: rarity.color + '30', borderColor: rarity.color }]}>
            <Text style={[styles.rarityText, { color: rarity.color }]}>
              {achievement.rarity.toUpperCase()}
            </Text>
          </View>
        )}

        <View style={[
          styles.iconContainer,
          { backgroundColor: unlocked ? rarity.color + '20' : COLORS.border + '30' },
        ]}>
          <Text style={[styles.icon, !unlocked && { opacity: 0.3 }]}>
            {unlocked ? achievement.icon : '🔒'}
          </Text>
        </View>

        <Text style={[styles.title, !unlocked && styles.lockedText]}>
          {unlocked ? achievement.title : '???'}
        </Text>
        <Text style={[styles.desc, !unlocked && styles.lockedDesc]} numberOfLines={2}>
          {unlocked ? achievement.desc : 'Keep going to unlock!'}
        </Text>

        {unlocked && unlockedAt && (
          <View style={styles.unlockedDate}>
            <Text style={styles.unlockedDateText}>
              ✓ {new Date(unlockedAt).toLocaleDateString()}
            </Text>
          </View>
        )}

        {!unlocked && (
          <View style={styles.progressHint}>
            <View style={styles.lockIcon}>
              <Text style={styles.lockEmoji}>🔐</Text>
            </View>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const CATEGORIES = ['All', 'Milestones', 'Streaks'];

export default function AchievementsScreen() {
  const { achievements, stats } = useApp();
  const [selectedCat, setSelectedCat] = React.useState('All');

  const filtered = ALL_ACHIEVEMENTS.filter(
    a => selectedCat === 'All' || a.category === selectedCat
  );

  const unlocked = achievements.length;
  const total = ALL_ACHIEVEMENTS.length;
  const pct = Math.round((unlocked / total) * 100);

  return (
    <LinearGradient colors={['#0A0A1A', '#12122A', '#0A0A1A']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Achievements</Text>
          <Text style={styles.headerSub}>{unlocked}/{total} unlocked</Text>
        </View>

        {/* Progress */}
        <View style={styles.progressCard}>
          <LinearGradient colors={COLORS.gradientPrimary} style={styles.progressCardInner}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>Your Progress</Text>
              <Text style={styles.progressPct}>{pct}%</Text>
            </View>
            <View style={styles.progressBarOuter}>
              <View style={[styles.progressBarFill, { width: `${pct}%` }]} />
            </View>
            <View style={styles.progressStats}>
              <View style={styles.progressStat}>
                <Text style={styles.progressStatVal}>{unlocked}</Text>
                <Text style={styles.progressStatLabel}>Unlocked</Text>
              </View>
              <View style={styles.progressStat}>
                <Text style={styles.progressStatVal}>{total - unlocked}</Text>
                <Text style={styles.progressStatLabel}>Remaining</Text>
              </View>
              <View style={styles.progressStat}>
                <Text style={styles.progressStatVal}>{stats?.totalPomodoros || 0}</Text>
                <Text style={styles.progressStatLabel}>Total 🍅</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Category Tabs */}
        <View style={styles.categoryRow}>
          {CATEGORIES.map(cat => (
            <View
              key={cat}
              style={[styles.categoryTab, selectedCat === cat && styles.categoryTabActive]}
            >
              <Text
                style={[styles.categoryText, selectedCat === cat && styles.categoryTextActive]}
                onPress={() => setSelectedCat(cat)}
              >
                {cat}
              </Text>
            </View>
          ))}
        </View>

        {/* Achievements Grid */}
        <View style={styles.grid}>
          {filtered.map(a => {
            const unlockedAch = achievements.find(ua => ua.id === a.id);
            return (
              <AchievementCard
                key={a.id}
                achievement={a}
                unlocked={!!unlockedAch}
                unlockedAt={unlockedAch?.unlockedAt}
              />
            );
          })}
        </View>

        {/* Recent Unlocks */}
        {achievements.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>🎉 Recently Unlocked</Text>
            {achievements.slice(0, 3).map(a => {
              const ach = ALL_ACHIEVEMENTS.find(x => x.id === a.id);
              if (!ach) return null;
              const rarity = RARITY_COLORS[ach.rarity];
              return (
                <View key={a.id} style={styles.recentItem}>
                  <View style={[styles.recentIcon, { backgroundColor: rarity.color + '20' }]}>
                    <Text style={{ fontSize: 24 }}>{ach.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recentName}>{ach.title}</Text>
                    <Text style={styles.recentDate}>{new Date(a.unlockedAt).toLocaleDateString()}</Text>
                  </View>
                  <Text style={[styles.recentRarity, { color: rarity.color }]}>
                    {ach.rarity}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>
    </LinearGradient>
  );
}

const CARD_W = (width - 48 - 10) / 2;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 100 },
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  headerTitle: { fontSize: FONT_SIZES.xxxl, fontWeight: '800', color: COLORS.text },
  headerSub: { fontSize: FONT_SIZES.md, color: COLORS.textMuted },
  progressCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  progressCardInner: { padding: SPACING.lg },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  progressTitle: { color: 'rgba(255,255,255,0.9)', fontSize: FONT_SIZES.lg, fontWeight: '700' },
  progressPct: { color: COLORS.text, fontSize: FONT_SIZES.xxxl, fontWeight: '800' },
  progressBarOuter: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: { height: '100%', backgroundColor: COLORS.text, borderRadius: 4 },
  progressStats: { flexDirection: 'row', justifyContent: 'space-around' },
  progressStat: { alignItems: 'center' },
  progressStatVal: { color: COLORS.text, fontSize: FONT_SIZES.xxl, fontWeight: '800' },
  progressStatLabel: { color: 'rgba(255,255,255,0.6)', fontSize: FONT_SIZES.xs, marginTop: 2 },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryTabActive: { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary },
  categoryText: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm },
  categoryTextActive: { color: COLORS.primary, fontWeight: '700' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: 10,
  },
  card: {
    width: CARD_W,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardLocked: { opacity: 0.7 },
  cardInner: { padding: SPACING.md, alignItems: 'center', minHeight: 160 },
  rarityBadge: {
    alignSelf: 'flex-end',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
    borderWidth: 1,
    marginBottom: 8,
  },
  rarityText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  icon: { fontSize: 30 },
  title: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginBottom: 4 },
  lockedText: { color: COLORS.textMuted },
  desc: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, textAlign: 'center' },
  lockedDesc: { color: COLORS.textMuted },
  unlockedDate: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.success + '20',
  },
  unlockedDateText: { fontSize: 10, color: COLORS.success },
  progressHint: { marginTop: 8 },
  lockIcon: { alignItems: 'center' },
  lockEmoji: { fontSize: 16 },
  recentSection: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recentTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  recentItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border + '40' },
  recentIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  recentName: { color: COLORS.text, fontWeight: '600', fontSize: FONT_SIZES.md },
  recentDate: { color: COLORS.textMuted, fontSize: FONT_SIZES.xs, marginTop: 2 },
  recentRarity: { fontSize: FONT_SIZES.xs, fontWeight: '700', textTransform: 'capitalize' },
});
