import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  SETTINGS: '@pomodoro_settings',
  SESSIONS: '@pomodoro_sessions',
  TASKS: '@pomodoro_tasks',
  STATS: '@pomodoro_stats',
  ONBOARDED: '@pomodoro_onboarded',
  PROFILE: '@pomodoro_profile',
  ACHIEVEMENTS: '@pomodoro_achievements',
};

export const storage = {
  async getSettings() {
    try {
      const data = await AsyncStorage.getItem(KEYS.SETTINGS);
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  },

  async saveSettings(settings) {
    try {
      await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch {}
  },

  async getSessions() {
    try {
      const data = await AsyncStorage.getItem(KEYS.SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },

  async addSession(session) {
    try {
      const sessions = await storage.getSessions();
      sessions.unshift({ ...session, id: Date.now().toString(), timestamp: new Date().toISOString() });
      await AsyncStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions.slice(0, 200)));
      return sessions;
    } catch { return []; }
  },

  async getTasks() {
    try {
      const data = await AsyncStorage.getItem(KEYS.TASKS);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },

  async saveTasks(tasks) {
    try {
      await AsyncStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
    } catch {}
  },

  async getStats() {
    try {
      const data = await AsyncStorage.getItem(KEYS.STATS);
      return data ? JSON.parse(data) : {
        totalPomodoros: 0,
        totalMinutes: 0,
        currentStreak: 0,
        longestStreak: 0,
        todayPomodoros: 0,
        weeklyData: [0, 0, 0, 0, 0, 0, 0],
        lastActiveDate: null,
      };
    } catch {
      return {
        totalPomodoros: 0,
        totalMinutes: 0,
        currentStreak: 0,
        longestStreak: 0,
        todayPomodoros: 0,
        weeklyData: [0, 0, 0, 0, 0, 0, 0],
        lastActiveDate: null,
      };
    }
  },

  async updateStats(pomodoroMinutes) {
    try {
      const stats = await storage.getStats();
      const today = new Date().toDateString();
      const lastDate = stats.lastActiveDate;

      stats.totalPomodoros += 1;
      stats.totalMinutes += pomodoroMinutes;

      if (lastDate === today) {
        stats.todayPomodoros += 1;
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate === yesterday.toDateString()) {
          stats.currentStreak += 1;
        } else {
          stats.currentStreak = 1;
        }
        stats.todayPomodoros = 1;
        stats.lastActiveDate = today;
      }

      if (stats.currentStreak > stats.longestStreak) {
        stats.longestStreak = stats.currentStreak;
      }

      const dayIndex = new Date().getDay();
      const weekly = [...(stats.weeklyData || [0, 0, 0, 0, 0, 0, 0])];
      weekly[dayIndex] = (weekly[dayIndex] || 0) + 1;
      stats.weeklyData = weekly;

      await AsyncStorage.setItem(KEYS.STATS, JSON.stringify(stats));
      return stats;
    } catch { return null; }
  },

  async isOnboarded() {
    try {
      const data = await AsyncStorage.getItem(KEYS.ONBOARDED);
      return data === 'true';
    } catch { return false; }
  },

  async setOnboarded() {
    try {
      await AsyncStorage.setItem(KEYS.ONBOARDED, 'true');
    } catch {}
  },

  async getProfile() {
    try {
      const data = await AsyncStorage.getItem(KEYS.PROFILE);
      return data ? JSON.parse(data) : { name: 'Focuser', avatar: '🧠', goal: 8 };
    } catch { return { name: 'Focuser', avatar: '🧠', goal: 8 }; }
  },

  async saveProfile(profile) {
    try {
      await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    } catch {}
  },

  async getAchievements() {
    try {
      const data = await AsyncStorage.getItem(KEYS.ACHIEVEMENTS);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },

  async saveAchievements(achievements) {
    try {
      await AsyncStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    } catch {}
  },

  async clearAll() {
    try {
      await AsyncStorage.multiRemove(Object.values(KEYS));
    } catch {}
  },
};
