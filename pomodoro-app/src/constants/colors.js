export const COLORS = {
  // Backgrounds
  background: '#0A0A1A',
  backgroundSecondary: '#12122A',
  card: '#1A1A35',
  cardLight: '#242448',

  // Primary Purple Theme
  primary: '#7C4DFF',
  primaryLight: '#9C6FFF',
  primaryDark: '#5C35CC',
  primaryGlow: 'rgba(124, 77, 255, 0.3)',

  // Timer States
  pomodoro: '#FF6B6B',
  pomodoroLight: '#FF8E8E',
  pomodoroGlow: 'rgba(255, 107, 107, 0.3)',

  shortBreak: '#4ECDC4',
  shortBreakLight: '#7EDDD7',
  shortBreakGlow: 'rgba(78, 205, 196, 0.3)',

  longBreak: '#45B7D1',
  longBreakLight: '#74CBE0',
  longBreakGlow: 'rgba(69, 183, 209, 0.3)',

  // Accent Colors
  accent: '#FFD93D',
  accentGlow: 'rgba(255, 217, 61, 0.3)',
  success: '#6BCB77',
  successGlow: 'rgba(107, 203, 119, 0.3)',
  warning: '#FF9F1C',
  error: '#FF4444',

  // Text
  text: '#FFFFFF',
  textSecondary: '#A0A0C8',
  textMuted: '#606090',
  textDark: '#0A0A1A',

  // UI Elements
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.2)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(124, 77, 255, 0.4)',

  // Gradients (arrays for LinearGradient)
  gradientPrimary: ['#7C4DFF', '#4A00E0'],
  gradientPomodoro: ['#FF6B6B', '#FF4757'],
  gradientShortBreak: ['#4ECDC4', '#2EAD9E'],
  gradientLongBreak: ['#45B7D1', '#2980B9'],
  gradientDark: ['#1A1A35', '#0A0A1A'],
  gradientCard: ['#242448', '#1A1A35'],
  gradientGold: ['#FFD93D', '#FF9F1C'],
  gradientSuccess: ['#6BCB77', '#4CAF50'],
};

export const TIMER_COLORS = {
  pomodoro: {
    primary: COLORS.pomodoro,
    light: COLORS.pomodoroLight,
    glow: COLORS.pomodoroGlow,
    gradient: COLORS.gradientPomodoro,
    label: 'Focus Time',
  },
  shortBreak: {
    primary: COLORS.shortBreak,
    light: COLORS.shortBreakLight,
    glow: COLORS.shortBreakGlow,
    gradient: COLORS.gradientShortBreak,
    label: 'Short Break',
  },
  longBreak: {
    primary: COLORS.longBreak,
    light: COLORS.longBreakLight,
    glow: COLORS.longBreakGlow,
    gradient: COLORS.gradientLongBreak,
    label: 'Long Break',
  },
};
