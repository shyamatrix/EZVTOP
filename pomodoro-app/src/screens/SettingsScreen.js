import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Alert, TextInput, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/colors';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { storage } from '../utils/storage';

function SettingRow({ icon, label, desc, children, danger }) {
  return (
    <View style={styles.settingRow}>
      <View style={[styles.settingIcon, danger && { backgroundColor: COLORS.error + '20' }]}>
        <Ionicons name={icon} size={20} color={danger ? COLORS.error : COLORS.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, danger && { color: COLORS.error }]}>{label}</Text>
        {desc && <Text style={styles.settingDesc}>{desc}</Text>}
      </View>
      {children}
    </View>
  );
}

function TimerModal({ visible, onClose, title, value, min, max, onSave }) {
  const [val, setVal] = useState(value.toString());

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.timerModal}>
          <LinearGradient colors={[COLORS.backgroundSecondary, COLORS.background]} style={styles.timerModalContent}>
            <Text style={styles.timerModalTitle}>{title}</Text>
            <Text style={styles.timerModalSub}>Enter duration in minutes ({min}–{max})</Text>
            <TextInput
              style={styles.timerInput}
              value={val}
              onChangeText={setVal}
              keyboardType="number-pad"
              maxLength={3}
              selectTextOnFocus
            />
            <View style={styles.timerModalBtns}>
              <TouchableOpacity onPress={onClose} style={styles.timerModalCancel}>
                <Text style={styles.timerModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const n = parseInt(val);
                  if (!isNaN(n) && n >= min && n <= max) {
                    onSave(n);
                    onClose();
                  } else {
                    Alert.alert('Invalid', `Please enter a number between ${min} and ${max}`);
                  }
                }}
                style={styles.timerModalSave}
              >
                <LinearGradient colors={COLORS.gradientPrimary} style={styles.timerModalSaveInner}>
                  <Text style={styles.timerModalSaveText}>Save</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

export default function SettingsScreen() {
  const { settings, updateSettings } = useApp();
  const [editingTimer, setEditingTimer] = useState(null);
  const appVersion = '1.0.0';

  const timerConfigs = [
    { key: 'pomodoroTime', label: 'Focus Duration', min: 1, max: 60 },
    { key: 'shortBreakTime', label: 'Short Break', min: 1, max: 30 },
    { key: 'longBreakTime', label: 'Long Break', min: 5, max: 60 },
    { key: 'longBreakInterval', label: 'Long Break After', min: 2, max: 8 },
  ];

  const handleReset = () => {
    Alert.alert(
      'Reset All Data',
      'This will clear all your sessions, tasks, and statistics. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset', style: 'destructive',
          onPress: async () => {
            await storage.clearAll();
            Alert.alert('Done', 'All data has been cleared. Please restart the app.');
          }
        },
      ]
    );
  };

  return (
    <LinearGradient colors={['#0A0A1A', '#12122A', '#0A0A1A']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSub}>Customize your experience</Text>
        </View>

        {/* Timer Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏱️ Timer Durations</Text>

          {timerConfigs.map(cfg => (
            <SettingRow
              key={cfg.key}
              icon="time-outline"
              label={cfg.label}
              desc={`${settings[cfg.key]} ${cfg.key === 'longBreakInterval' ? 'pomodoros' : 'minutes'}`}
            >
              <TouchableOpacity
                onPress={() => setEditingTimer(cfg)}
                style={styles.editBadge}
              >
                <Text style={styles.editBadgeText}>{settings[cfg.key]}</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
              </TouchableOpacity>
            </SettingRow>
          ))}
        </View>

        {/* Auto Start */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤖 Automation</Text>

          <SettingRow icon="play-skip-forward-outline" label="Auto-start Breaks" desc="Breaks start automatically after focus">
            <Switch
              value={settings.autoStartBreaks}
              onValueChange={v => updateSettings({ autoStartBreaks: v })}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.text}
            />
          </SettingRow>

          <SettingRow icon="repeat-outline" label="Auto-start Pomodoros" desc="Next focus session starts automatically">
            <Switch
              value={settings.autoStartPomodoros}
              onValueChange={v => updateSettings({ autoStartPomodoros: v })}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.text}
            />
          </SettingRow>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Notifications & Sound</Text>

          <SettingRow icon="notifications-outline" label="Notifications" desc="Get alerted when timer ends">
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={v => updateSettings({ notificationsEnabled: v })}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.text}
            />
          </SettingRow>

          <SettingRow icon="volume-high-outline" label="Sound Effects" desc="Play sound on timer end">
            <Switch
              value={settings.soundEnabled}
              onValueChange={v => updateSettings({ soundEnabled: v })}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.text}
            />
          </SettingRow>

          <SettingRow icon="phone-portrait-outline" label="Vibration" desc="Vibrate on timer events">
            <Switch
              value={settings.vibrationEnabled}
              onValueChange={v => updateSettings({ vibrationEnabled: v })}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.text}
            />
          </SettingRow>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ About</Text>

          <SettingRow icon="information-circle-outline" label="Version" desc="Current app version">
            <Text style={styles.versionText}>{appVersion}</Text>
          </SettingRow>

          <SettingRow icon="heart-outline" label="Based On" desc="The Pomodoro Technique by Francesco Cirillo">
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </SettingRow>
        </View>

        {/* Danger Zone */}
        <View style={[styles.section, styles.dangerSection]}>
          <Text style={[styles.sectionTitle, { color: COLORS.error }]}>⚠️ Danger Zone</Text>

          <TouchableOpacity onPress={handleReset} activeOpacity={0.7}>
            <SettingRow icon="trash-outline" label="Reset All Data" desc="Clear all sessions, tasks & stats" danger>
              <Ionicons name="chevron-forward" size={16} color={COLORS.error} />
            </SettingRow>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ for focused minds</Text>
          <Text style={styles.footerSub}>PomodoroFlow v{appVersion}</Text>
        </View>

      </ScrollView>

      {editingTimer && (
        <TimerModal
          visible
          title={editingTimer.label}
          value={settings[editingTimer.key]}
          min={editingTimer.min}
          max={editingTimer.max}
          onClose={() => setEditingTimer(null)}
          onSave={val => updateSettings({ [editingTimer.key]: val })}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 100 },
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  headerTitle: { fontSize: FONT_SIZES.xxxl, fontWeight: '800', color: COLORS.text },
  headerSub: { fontSize: FONT_SIZES.md, color: COLORS.textMuted },
  section: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dangerSection: {
    borderColor: COLORS.error + '40',
    backgroundColor: COLORS.error + '08',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '60',
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: { flex: 1 },
  settingLabel: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text },
  settingDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  editBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.cardLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm,
  },
  editBadgeText: { color: COLORS.text, fontWeight: '700', fontSize: FONT_SIZES.md },
  versionText: { color: COLORS.textMuted, fontSize: FONT_SIZES.md },
  footer: { alignItems: 'center', paddingVertical: SPACING.xl },
  footerText: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm },
  footerSub: { color: COLORS.textMuted + '80', fontSize: FONT_SIZES.xs, marginTop: 4 },
  // Timer Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerModal: { width: '85%', borderRadius: BORDER_RADIUS.xl, overflow: 'hidden' },
  timerModalContent: { padding: SPACING.lg },
  timerModalTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  timerModalSub: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, marginBottom: SPACING.lg },
  timerInput: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: FONT_SIZES.hero,
    fontWeight: '800',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  timerModalBtns: { flexDirection: 'row', gap: SPACING.sm },
  timerModalCancel: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timerModalCancelText: { color: COLORS.textSecondary, fontWeight: '600' },
  timerModalSave: { flex: 1, borderRadius: BORDER_RADIUS.md, overflow: 'hidden' },
  timerModalSaveInner: { height: 48, alignItems: 'center', justifyContent: 'center' },
  timerModalSaveText: { color: COLORS.text, fontWeight: '700' },
});
