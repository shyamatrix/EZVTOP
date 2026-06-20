import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  TextInput, Modal, ScrollView, Alert, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/colors';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

const PRIORITIES = [
  { key: 'low', label: 'Low', color: '#4ECDC4' },
  { key: 'medium', label: 'Medium', color: '#FFD93D' },
  { key: 'high', label: 'High', color: '#FF6B6B' },
];

const CATEGORIES = ['Work', 'Study', 'Personal', 'Health', 'Creative', 'Other'];

function TaskCard({ task, isActive, onPress, onComplete, onDelete, onSetActive, colors }) {
  const priorityColor = PRIORITIES.find(p => p.key === task.priority)?.color || COLORS.textMuted;
  const progress = task.estimatedPomodoros > 0
    ? (task.completedPomodoros / task.estimatedPomodoros) * 100
    : 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[
      styles.taskCard,
      isActive && { borderColor: COLORS.primary, borderWidth: 2 },
      task.completed && { opacity: 0.6 },
    ]}>
      <LinearGradient colors={[COLORS.card, COLORS.cardLight]} style={styles.taskCardInner}>
        <View style={styles.taskCardTop}>
          <TouchableOpacity onPress={onComplete} style={styles.checkbox}>
            {task.completed ? (
              <LinearGradient colors={COLORS.gradientPrimary} style={styles.checkboxFilled}>
                <Ionicons name="checkmark" size={14} color={COLORS.text} />
              </LinearGradient>
            ) : (
              <View style={styles.checkboxEmpty} />
            )}
          </TouchableOpacity>

          <View style={styles.taskCardContent}>
            <Text style={[styles.taskCardTitle, task.completed && styles.strikethrough]} numberOfLines={2}>
              {task.title}
            </Text>
            {task.description ? (
              <Text style={styles.taskCardDesc} numberOfLines={1}>{task.description}</Text>
            ) : null}

            <View style={styles.taskMeta}>
              <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20', borderColor: priorityColor }]}>
                <Text style={[styles.priorityText, { color: priorityColor }]}>
                  {task.priority || 'low'}
                </Text>
              </View>
              {task.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{task.category}</Text>
                </View>
              )}
              <View style={styles.pomodoroCount}>
                <Text style={styles.pomodoroCountText}>
                  🍅 {task.completedPomodoros}/{task.estimatedPomodoros}
                </Text>
              </View>
            </View>

            {!task.completed && (
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: COLORS.primary }]} />
              </View>
            )}
          </View>

          <View style={styles.taskActions}>
            {!task.completed && (
              <TouchableOpacity onPress={onSetActive} style={[
                styles.focusBtn,
                isActive && { backgroundColor: COLORS.primary + '20' },
              ]}>
                <Ionicons
                  name={isActive ? 'radio-button-on' : 'radio-button-off'}
                  size={18}
                  color={isActive ? COLORS.primary : COLORS.textMuted}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={16} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function AddTaskModal({ visible, onClose, onAdd }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('Work');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);

  const reset = () => {
    setTitle(''); setDescription(''); setPriority('medium');
    setCategory('Work'); setEstimatedPomodoros(1);
  };

  const handleAdd = () => {
    if (!title.trim()) return Alert.alert('Required', 'Please enter a task title');
    onAdd({ title: title.trim(), description, priority, category, estimatedPomodoros });
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <LinearGradient colors={[COLORS.backgroundSecondary, COLORS.background]} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Task</Text>
              <TouchableOpacity onPress={() => { reset(); onClose(); }}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Task Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="What do you need to do?"
                placeholderTextColor={COLORS.textMuted}
                returnKeyType="next"
                maxLength={100}
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add details (optional)"
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={3}
                maxLength={300}
              />

              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.optionRow}>
                {PRIORITIES.map(p => (
                  <TouchableOpacity
                    key={p.key}
                    onPress={() => setPriority(p.key)}
                    style={[styles.optionBtn, priority === p.key && { backgroundColor: p.color + '25', borderColor: p.color }]}
                  >
                    <Text style={[styles.optionText, priority === p.key && { color: p.color }]}>{p.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryRow}>
                  {CATEGORIES.map(c => (
                    <TouchableOpacity
                      key={c}
                      onPress={() => setCategory(c)}
                      style={[styles.categoryChip, category === c && { backgroundColor: COLORS.primary + '25', borderColor: COLORS.primary }]}
                    >
                      <Text style={[styles.categoryChipText, category === c && { color: COLORS.primary }]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={styles.inputLabel}>Estimated Pomodoros</Text>
              <View style={styles.pomodoroStepper}>
                <TouchableOpacity
                  onPress={() => setEstimatedPomodoros(Math.max(1, estimatedPomodoros - 1))}
                  style={styles.stepperBtn}
                >
                  <Ionicons name="remove" size={20} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.stepperValue}>🍅 {estimatedPomodoros}</Text>
                <TouchableOpacity
                  onPress={() => setEstimatedPomodoros(Math.min(20, estimatedPomodoros + 1))}
                  style={styles.stepperBtn}
                >
                  <Ionicons name="add" size={20} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={handleAdd} style={styles.addBtnWrapper} activeOpacity={0.8}>
                <LinearGradient colors={COLORS.gradientPrimary} style={styles.addBtn}>
                  <Text style={styles.addBtnText}>Add Task</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

export default function TasksScreen() {
  const { tasks, addTask, updateTask, deleteTask, activeTaskId, setActiveTaskId } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('active');

  const filteredTasks = tasks.filter(t =>
    filter === 'all' ? true :
    filter === 'active' ? !t.completed :
    t.completed
  );

  const handleComplete = async (task) => {
    await updateTask(task.id, { completed: !task.completed });
    if (task.id === activeTaskId) setActiveTaskId(null);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTask(id) },
    ]);
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const activeCount = tasks.filter(t => !t.completed).length;

  return (
    <LinearGradient colors={['#0A0A1A', '#12122A', '#0A0A1A']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Tasks</Text>
          <Text style={styles.headerSub}>{activeCount} active · {completedCount} done</Text>
        </View>
        <TouchableOpacity onPress={() => setShowModal(true)} style={styles.addFab} activeOpacity={0.8}>
          <LinearGradient colors={COLORS.gradientPrimary} style={styles.addFabInner}>
            <Ionicons name="add" size={24} color={COLORS.text} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {[
          { key: 'active', label: `Active (${activeCount})` },
          { key: 'completed', label: `Done (${completedCount})` },
          { key: 'all', label: 'All' },
        ].map(f => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
          >
            <Text style={[styles.filterTabText, filter === f.key && styles.filterTabTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📝</Text>
          <Text style={styles.emptyTitle}>No tasks yet</Text>
          <Text style={styles.emptyDesc}>Add tasks to organize your Pomodoro sessions</Text>
          <TouchableOpacity onPress={() => setShowModal(true)} style={styles.emptyBtn} activeOpacity={0.8}>
            <LinearGradient colors={COLORS.gradientPrimary} style={styles.emptyBtnInner}>
              <Text style={styles.emptyBtnText}>Add Your First Task</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              isActive={item.id === activeTaskId}
              onPress={() => {}}
              onComplete={() => handleComplete(item)}
              onDelete={() => handleDelete(item.id)}
              onSetActive={() => setActiveTaskId(item.id === activeTaskId ? null : item.id)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <AddTaskModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onAdd={addTask}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerTitle: { fontSize: FONT_SIZES.xxxl, fontWeight: '800', color: COLORS.text },
  headerSub: { fontSize: FONT_SIZES.md, color: COLORS.textMuted, marginTop: 2 },
  addFab: { width: 48, height: 48, borderRadius: 24, overflow: 'hidden' },
  addFabInner: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  filterTabText: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted },
  filterTabTextActive: { color: COLORS.primary, fontWeight: '600' },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
  taskCard: {
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  taskCardInner: { padding: SPACING.md },
  taskCardTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  checkbox: { width: 24, height: 24, marginTop: 2 },
  checkboxEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
  },
  checkboxFilled: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCardContent: { flex: 1 },
  taskCardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  strikethrough: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  taskCardDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginBottom: 8 },
  taskMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
  },
  priorityText: { fontSize: FONT_SIZES.xs, fontWeight: '600', textTransform: 'capitalize' },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.cardLight,
  },
  categoryText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  pomodoroCount: { flexDirection: 'row', alignItems: 'center' },
  pomodoroCountText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  progressBar: {
    height: 3,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  taskActions: { gap: 8 },
  focusBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptyDesc: { fontSize: FONT_SIZES.md, color: COLORS.textMuted, textAlign: 'center', marginBottom: 24 },
  emptyBtn: { borderRadius: BORDER_RADIUS.lg, overflow: 'hidden' },
  emptyBtnInner: { paddingHorizontal: 28, paddingVertical: 14 },
  emptyBtnText: { color: COLORS.text, fontSize: FONT_SIZES.lg, fontWeight: '700' },
  // Modal
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
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
  textArea: { height: 80, textAlignVertical: 'top' },
  optionRow: { flexDirection: 'row', gap: 8 },
  optionBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionText: { color: COLORS.textSecondary, fontWeight: '600' },
  categoryRow: { flexDirection: 'row', gap: 8 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm },
  pomodoroStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.text },
  addBtnWrapper: { marginTop: SPACING.lg, borderRadius: BORDER_RADIUS.lg, overflow: 'hidden' },
  addBtn: { height: 54, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: COLORS.text, fontSize: FONT_SIZES.lg, fontWeight: '700' },
});
