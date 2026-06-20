import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import { storage } from '../utils/storage';
import { TIMER_PRESETS } from '../constants/theme';

const AppContext = createContext();

export const TIMER_MODES = {
  POMODORO: 'pomodoro',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak',
};

const DEFAULT_SETTINGS = {
  pomodoroTime: TIMER_PRESETS.pomodoro,
  shortBreakTime: TIMER_PRESETS.shortBreak,
  longBreakTime: TIMER_PRESETS.longBreak,
  longBreakInterval: TIMER_PRESETS.longBreakInterval,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true,
  vibrationEnabled: true,
  notificationsEnabled: true,
  theme: 'dark',
  tickingSound: false,
};

export const AppProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [timerMode, setTimerMode] = useState(TIMER_MODES.POMODORO);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.pomodoroTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [profile, setProfile] = useState({ name: 'Focuser', avatar: '🧠', goal: 8 });
  const [achievements, setAchievements] = useState([]);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [loading, setLoading] = useState(true);

  const intervalRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const backgroundTimeRef = useRef(null);

  useEffect(() => {
    initApp();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isRunning, timeLeft]);

  const handleAppStateChange = useCallback((nextState) => {
    if (appStateRef.current === 'active' && nextState.match(/inactive|background/)) {
      if (isRunning) {
        backgroundTimeRef.current = Date.now();
      }
    } else if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
      if (isRunning && backgroundTimeRef.current) {
        const elapsed = Math.floor((Date.now() - backgroundTimeRef.current) / 1000);
        setTimeLeft(prev => Math.max(0, prev - elapsed));
        backgroundTimeRef.current = null;
      }
    }
    appStateRef.current = nextState;
  }, [isRunning, timeLeft]);

  const initApp = async () => {
    try {
      const [savedSettings, savedStats, savedTasks, savedSessions, savedProfile, savedAchievements] =
        await Promise.all([
          storage.getSettings(),
          storage.getStats(),
          storage.getTasks(),
          storage.getSessions(),
          storage.getProfile(),
          storage.getAchievements(),
        ]);

      if (savedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...savedSettings });
        setTimeLeft((savedSettings.pomodoroTime || DEFAULT_SETTINGS.pomodoroTime) * 60);
      }
      if (savedStats) setStats(savedStats);
      if (savedTasks) setTasks(savedTasks);
      if (savedSessions) setSessions(savedSessions);
      if (savedProfile) setProfile(savedProfile);
      if (savedAchievements) setAchievements(savedAchievements);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const handleTimerComplete = useCallback(async () => {
    setIsRunning(false);

    if (timerMode === TIMER_MODES.POMODORO) {
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);

      const updatedStats = await storage.updateStats(settings.pomodoroTime);
      if (updatedStats) setStats(updatedStats);

      const session = {
        type: 'pomodoro',
        duration: settings.pomodoroTime,
        taskId: activeTaskId,
      };
      const updatedSessions = await storage.addSession(session);
      if (updatedSessions) setSessions(updatedSessions);

      if (activeTaskId) {
        const updatedTasks = tasks.map(t =>
          t.id === activeTaskId
            ? { ...t, completedPomodoros: (t.completedPomodoros || 0) + 1 }
            : t
        );
        setTasks(updatedTasks);
        await storage.saveTasks(updatedTasks);
      }

      checkAchievements(newCount, updatedStats);

      const isLongBreak = newCount % settings.longBreakInterval === 0;
      if (settings.autoStartBreaks) {
        switchMode(isLongBreak ? TIMER_MODES.LONG_BREAK : TIMER_MODES.SHORT_BREAK, true);
      } else {
        switchMode(isLongBreak ? TIMER_MODES.LONG_BREAK : TIMER_MODES.SHORT_BREAK, false);
      }
    } else {
      if (settings.autoStartPomodoros) {
        switchMode(TIMER_MODES.POMODORO, true);
      } else {
        switchMode(TIMER_MODES.POMODORO, false);
      }
    }
  }, [timerMode, completedPomodoros, settings, activeTaskId, tasks]);

  const checkAchievements = useCallback(async (count, stats) => {
    const newAchievements = [...achievements];
    const milestones = [
      { id: 'first', title: 'First Focus!', desc: 'Completed your first Pomodoro', icon: '🍅', count: 1 },
      { id: 'five', title: 'Getting Warmed Up', desc: '5 Pomodoros completed', icon: '🔥', count: 5 },
      { id: 'ten', title: 'Focused Mind', desc: '10 Pomodoros completed', icon: '🎯', count: 10 },
      { id: 'twentyfive', title: 'Productivity Pro', desc: '25 Pomodoros completed', icon: '⭐', count: 25 },
      { id: 'fifty', title: 'Flow Master', desc: '50 Pomodoros completed', icon: '💎', count: 50 },
      { id: 'hundred', title: 'Centurion', desc: '100 Pomodoros completed', icon: '🏆', count: 100 },
      { id: 'streak3', title: '3-Day Streak', desc: '3 days in a row', icon: '📅', streak: 3 },
      { id: 'streak7', title: 'Week Warrior', desc: '7-day streak', icon: '🌟', streak: 7 },
      { id: 'streak30', title: 'Iron Will', desc: '30-day streak', icon: '👑', streak: 30 },
    ];

    let updated = false;
    milestones.forEach(m => {
      const alreadyUnlocked = newAchievements.find(a => a.id === m.id);
      if (!alreadyUnlocked) {
        const condition = m.count
          ? (stats?.totalPomodoros || count) >= m.count
          : (stats?.currentStreak || 0) >= m.streak;
        if (condition) {
          newAchievements.push({ ...m, unlockedAt: new Date().toISOString() });
          updated = true;
        }
      }
    });

    if (updated) {
      setAchievements(newAchievements);
      await storage.saveAchievements(newAchievements);
    }
  }, [achievements]);

  const switchMode = useCallback((mode, autoStart = false) => {
    setTimerMode(mode);
    setIsRunning(autoStart);
    const times = {
      [TIMER_MODES.POMODORO]: settings.pomodoroTime * 60,
      [TIMER_MODES.SHORT_BREAK]: settings.shortBreakTime * 60,
      [TIMER_MODES.LONG_BREAK]: settings.longBreakTime * 60,
    };
    setTimeLeft(times[mode]);
  }, [settings]);

  const toggleTimer = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    const times = {
      [TIMER_MODES.POMODORO]: settings.pomodoroTime * 60,
      [TIMER_MODES.SHORT_BREAK]: settings.shortBreakTime * 60,
      [TIMER_MODES.LONG_BREAK]: settings.longBreakTime * 60,
    };
    setTimeLeft(times[timerMode]);
  }, [timerMode, settings]);

  const skipTimer = useCallback(() => {
    handleTimerComplete();
  }, [handleTimerComplete]);

  const updateSettings = useCallback(async (newSettings) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    await storage.saveSettings(merged);
    if (!isRunning) {
      const times = {
        [TIMER_MODES.POMODORO]: merged.pomodoroTime * 60,
        [TIMER_MODES.SHORT_BREAK]: merged.shortBreakTime * 60,
        [TIMER_MODES.LONG_BREAK]: merged.longBreakTime * 60,
      };
      setTimeLeft(times[timerMode]);
    }
  }, [settings, isRunning, timerMode]);

  const addTask = useCallback(async (task) => {
    const newTask = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completedPomodoros: 0,
      completed: false,
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    await storage.saveTasks(updated);
    return newTask;
  }, [tasks]);

  const updateTask = useCallback(async (id, updates) => {
    const updated = tasks.map(t => t.id === id ? { ...t, ...updates } : t);
    setTasks(updated);
    await storage.saveTasks(updated);
  }, [tasks]);

  const deleteTask = useCallback(async (id) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    await storage.saveTasks(updated);
    if (activeTaskId === id) setActiveTaskId(null);
  }, [tasks, activeTaskId]);

  const updateProfile = useCallback(async (updates) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    await storage.saveProfile(updated);
  }, [profile]);

  const getTotalTime = useCallback(() => {
    const times = {
      [TIMER_MODES.POMODORO]: settings.pomodoroTime * 60,
      [TIMER_MODES.SHORT_BREAK]: settings.shortBreakTime * 60,
      [TIMER_MODES.LONG_BREAK]: settings.longBreakTime * 60,
    };
    return times[timerMode];
  }, [timerMode, settings]);

  const getProgress = useCallback(() => {
    const total = getTotalTime();
    return total > 0 ? 1 - timeLeft / total : 0;
  }, [timeLeft, getTotalTime]);

  const formatTime = useCallback((seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, []);

  const value = {
    settings, updateSettings,
    timerMode, switchMode,
    timeLeft, isRunning, toggleTimer, resetTimer, skipTimer,
    completedPomodoros, getProgress, formatTime, getTotalTime,
    stats, tasks, sessions, profile, achievements,
    activeTaskId, setActiveTaskId,
    addTask, updateTask, deleteTask, updateProfile,
    loading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
