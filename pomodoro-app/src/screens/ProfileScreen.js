import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/colors';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

const { width } = Dimensions.get('window');

const AVATARS = ['🧠', '🚀', '🦁', '🐉', '⚡', '🎯', '🔥', '💎', '🌟', '🏆', '🦊', '🐺', '🦅', '🌊', '🎪'];

const GOALS = [4, 6, 8, 10, 12, 16];

function EditModal({ visible, profile, onSave, onClose }) {
  const [name, setName] = useState(profile.name || '');
  const [avatar, setAvatar] = useState(profile.avatar || '🧠');
  const [goal, setGoal] = useState(profile.goal || 8);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <LinearGradient colors={[COLORS.backgroundSecondary, COLORS.background]} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Your Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.textMuted}
                maxLength={20}
              />

              <Text style={styles.inputLabel}>Choose Avatar</Text>
              <View style={styles.avatarGrid}>
                {AVATARS.map(a => (
                  <TouchableOpacity
                    key={a}
                    onPress={() => setAvatar(a)}
                    style={[styles.avatarOption, avatar === a && styles.avatarSelected]}
                  >
                    <Text style={styles.avatarEmoji}>{a}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Daily Pomodoro Goal</Text>
              <View style={styles.goalRow}>
                {GOALS.map(g => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setGoal(g)}
                    style={[styles.goalChip, goal === g && styles.goalChipActive]}
                  >
                    <Text style={[styles.goalText, goal === g && styles.goalTextActive]}>
                      🍅 {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => { onSave({ name: name || 'Focuser', avatar, goal }); onClose(); }}
                style={styles.saveWrapper}
                activeOpacity={0.8}
              >
                <LinearGradient colors={COLORS.gradientPrimary} style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>Save Profile</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

export default function ProfileScreen({ navigation }) {
  const { profile, updateProfile, stats, achievements, tasks } = useApp();
  const [showEdit, setShowEdit] = useState(false);

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalHours = stats ? Math.floor(stats.totalMinutes / 60) : 0;
  const goalProgress = stats
    ? Math.min((stats.todayPomodoros / (profile.goal || 8)) * 100, 100)
    : 0;

  const level = Math.floor((stats?.totalPomodoros || 0) / 10) + 1;
  const levelProgress = ((stats?.totalPomodoros || 0) % 10) / 10;
  const xp = (stats?.totalPomodoros || 0) * 10;

  const levelTitles = [
    'Beginner', 'Apprentice', 'Focused', 'Achiever',
    'Expert', 'Master', 'Guru', 'Legend', 'Grandmaster', 'Enlightened'
  ];
  const levelTitle = levelTitles[Math.min(level - 1, levelTitles.length - 1)] || 'Master';

  return (
    <LinearGradient colors={['#0A0A1A', '#12122A', '#0A0A1A']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile Hero */}
        <LinearGradient colors={['#1A0A3A', '#0A0A1A']} style={styles.heroSection}>
          <View style={styles.avatarContainer}>
            <LinearGradient colors={COLORS.gradientPrimary} style={styles.avatarRing}>
              <Text style={styles.avatarText}>{profile.avatar || '🧠'}</Text>
            </LinearGradient>
            <TouchableOpacity onPress={() => setShowEdit(true)} style={styles.editAvatarBtn}>
              <Ionicons name="pencil" size={14} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <Text style={styles.profileName}>{profile.name || 'Focuser'}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lv.{level} {levelTitle}</Text>
          </View>

          {/* XP Bar */}
          <View style={styles.xpSection}>
            <View style={styles.xpRow}>
              <Text style={styles.xpLabel}>⚡ {xp} XP</Text>
              <Text style={styles.xpNext}>{(level) * 100} XP to Lv.{level + 1}</Text>
            </View>
            <View style={styles.xpBar}>
              <LinearGradient
                colors={COLORS.gradientPrimary}
                style={[styles.xpFill, { width: `${levelProgress * 100}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>

          <TouchableOpacity onPress={() => setShowEdit(true)} style={styles.editProfileBtn} activeOpacity={0.8}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Today's Goal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Goal</Text>
          <View style={styles.goalCard}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalCurrent}>{stats?.todayPomodoros || 0}</Text>
              <Text style={styles.goalSep}>/</Text>
              <Text style={styles.goalTarget}>{profile.goal || 8}</Text>
              <Text style={styles.goalUnit}>🍅 sessions</Text>
            </View>
            <View style={styles.goalBarOuter}>
              <LinearGradient
                colors={goalProgress >= 100 ? COLORS.gradientSuccess : COLORS.gradientPrimary}
                style={[styles.goalBarFill, { width: `${goalProgress}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
            <Text style={styles.goalPct}>
              {goalProgress >= 100 ? '🎉 Goal achieved!' : `${Math.round(goalProgress)}% complete`}
            </Text>
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lifetime Stats</Text>
          <View style={styles.statsGrid}>
            {[
              { label: 'Total Focus', value: `${totalHours}h`, emoji: '⏱️' },
              { label: 'Pomodoros', value: stats?.totalPomodoros || 0, emoji: '🍅' },
              { label: 'Best Streak', value: `${stats?.longestStreak || 0}d`, emoji: '🔥' },
              { label: 'Tasks Done', value: completedTasks, emoji: '✅' },
              { label: 'Achievements', value: achievements.length, emoji: '🏆' },
              { label: 'Current Streak', value: `${stats?.currentStreak || 0}d`, emoji: '📅' },
            ].map((s, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={styles.statEmoji}>{s.emoji}</Text>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Nav */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          {[
            { icon: 'trophy-outline', label: 'Achievements', desc: `${achievements.length} unlocked`, onPress: () => navigation.navigate('Achievements') },
            { icon: 'stats-chart-outline', label: 'Statistics', desc: 'Detailed analytics', onPress: () => navigation.navigate('Statistics') },
            { icon: 'time-outline', label: 'History', desc: `${(achievements.length ? stats?.totalPomodoros : 0) || 0} sessions`, onPress: () => navigation.navigate('History') },
          ].map((item, i) => (
            <TouchableOpacity key={i} onPress={item.onPress} style={styles.navItem} activeOpacity={0.7}>
              <View style={styles.navIconWrap}>
                <Ionicons name={item.icon} size={22} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.navLabel}>{item.label}</Text>
                <Text style={styles.navDesc}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      <EditModal
        visible={showEdit}
        profile={profile}
        onSave={updateProfile}
        onClose={() => setShowEdit(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 100 },
  heroSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  avatarText: { fontSize: 52 },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  profileName: { fontSize: FONT_SIZES.xxxl, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  levelBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primary + '30',
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 20,
  },
  levelText: { color: COLORS.primary, fontWeight: '700', fontSize: FONT_SIZES.md },
  xpSection: { width: '100%', marginBottom: 20 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  xpLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm },
  xpNext: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm },
  xpBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpFill: { height: '100%', borderRadius: 4 },
  editProfileBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  },
  editProfileText: { color: COLORS.primary, fontWeight: '600' },
  section: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  goalCard: {},
  goalInfo: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 12 },
  goalCurrent: { fontSize: FONT_SIZES.hero, fontWeight: '800', color: COLORS.primary },
  goalSep: { fontSize: FONT_SIZES.xxl, color: COLORS.textMuted },
  goalTarget: { fontSize: FONT_SIZES.xxxl, fontWeight: '700', color: COLORS.textSecondary },
  goalUnit: { fontSize: FONT_SIZES.md, color: COLORS.textMuted, marginLeft: 8 },
  goalBarOuter: {
    height: 10,
    backgroundColor: COLORS.border,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  goalBarFill: { height: '100%', borderRadius: 5 },
  goalPct: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statItem: {
    width: (width - 48 - 2 * SPACING.md - 2 * SPACING.sm) / 3,
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statEmoji: { fontSize: 24, marginBottom: 6 },
  statValue: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, textAlign: 'center', marginTop: 2 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '60',
  },
  navIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text },
  navDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: { maxHeight: '90%' },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  modalTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text },
  inputLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginBottom: 8, marginTop: SPACING.md },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  avatarOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '20' },
  avatarEmoji: { fontSize: 28 },
  goalRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  goalChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  goalChipActive: { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary },
  goalText: { color: COLORS.textSecondary },
  goalTextActive: { color: COLORS.primary, fontWeight: '700' },
  saveWrapper: { marginTop: SPACING.lg, borderRadius: BORDER_RADIUS.lg, overflow: 'hidden' },
  saveBtn: { height: 54, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: COLORS.text, fontSize: FONT_SIZES.lg, fontWeight: '700' },
});
