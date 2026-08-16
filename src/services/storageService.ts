import type { DayLog, FoodItem, LoggedFoodItem, MealType, UserProfile, NotificationItem } from '../types';
import { INITIAL_FOOD_DATABASE } from '../data/foodDatabase';
import { calculateItemNutrition, getTodayDateString } from './nutritionCalculator';

const PROFILE_KEY = 'nutritrack_user_profile_v1';
const USERS_KEY = 'nutritrack_users_registry_v1';
const DAY_LOGS_KEY = 'nutritrack_day_logs_v1';
const FOOD_DB_KEY = 'nutritrack_custom_food_db_v1';
const NOTIFICATIONS_KEY = 'nutritrack_notifications_v1';

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'usr_default_1',
  name: 'דני כהן',
  email: 'dani@example.com',
  isLoggedIn: true,
  hasBiometrics: false,
  gender: 'male',
  age: 28,
  height: 178,
  currentWeight: 76,
  targetWeight: 72,
  activityLevel: 'moderate',
  goal: 'lose_weight',
  dailyCalorieTarget: 2000,
  dailyProteinTarget: 140,
  dailyCarbsTarget: 200,
  dailyFatTarget: 65,
  dailyWaterTargetGlasses: 8,
  theme: 'light',
  pushNotificationsEnabled: false,
  waterReminderEnabled: true,
  waterReminderIntervalMinutes: 120,
  mealReminderBreakfast: '08:30',
  mealReminderLunch: '13:30',
  mealReminderDinner: '19:30',
};

export const INITIAL_TODAY_LOG: DayLog = {
  date: getTodayDateString(),
  waterGlasses: 3,
  meals: {
    breakfast: [
      {
        ...INITIAL_FOOD_DATABASE[1], // ביצה L
        logId: 'log_init_1',
        amount: 2,
        unit: 'ביצה (60 גרם)',
        totalGrams: 120,
        ...calculateItemNutrition(INITIAL_FOOD_DATABASE[1], 120),
        timestamp: '08:15',
      },
      {
        ...INITIAL_FOOD_DATABASE[14], // לחם שיפון קל
        logId: 'log_init_2',
        amount: 2,
        unit: 'פרוסה (30 גרם)',
        totalGrams: 60,
        ...calculateItemNutrition(INITIAL_FOOD_DATABASE[14], 60),
        timestamp: '08:20',
      },
      {
        ...INITIAL_FOOD_DATABASE[23], // סלט ירקות ישראלי
        logId: 'log_init_3',
        amount: 1,
        unit: 'קערה (200 גרם)',
        totalGrams: 200,
        ...calculateItemNutrition(INITIAL_FOOD_DATABASE[23], 200),
        timestamp: '08:25',
      },
    ],
    lunch: [
      {
        ...INITIAL_FOOD_DATABASE[0], // חזה עוף צלוי
        logId: 'log_init_4',
        amount: 1,
        unit: 'נתח (150 גרם)',
        totalGrams: 150,
        ...calculateItemNutrition(INITIAL_FOOD_DATABASE[0], 150),
        timestamp: '13:15',
      },
      {
        ...INITIAL_FOOD_DATABASE[10], // אורז בסמטי מבושל
        logId: 'log_init_5',
        amount: 1,
        unit: 'כוס (150 גרם)',
        totalGrams: 150,
        ...calculateItemNutrition(INITIAL_FOOD_DATABASE[10], 150),
        timestamp: '13:15',
      },
      {
        ...INITIAL_FOOD_DATABASE[20], // שמן זית
        logId: 'log_init_6',
        amount: 1,
        unit: 'כף (10 גרם)',
        totalGrams: 10,
        ...calculateItemNutrition(INITIAL_FOOD_DATABASE[20], 10),
        timestamp: '13:15',
      },
    ],
    dinner: [
      {
        ...INITIAL_FOOD_DATABASE[4], // יוגורט PRO 20g חלבון
        logId: 'log_init_7',
        amount: 1,
        unit: 'גביע (200 גרם)',
        totalGrams: 200,
        ...calculateItemNutrition(INITIAL_FOOD_DATABASE[4], 200),
        timestamp: '19:40',
      },
      {
        ...INITIAL_FOOD_DATABASE[21], // שקדים טבעיים
        logId: 'log_init_8',
        amount: 1,
        unit: 'חופן (30 גרם)',
        totalGrams: 30,
        ...calculateItemNutrition(INITIAL_FOOD_DATABASE[21], 30),
        timestamp: '19:45',
      },
    ],
    snack: [
      {
        ...INITIAL_FOOD_DATABASE[24], // תפוח עץ בינוני
        logId: 'log_init_9',
        amount: 1,
        unit: 'יחידה (150 גרם)',
        totalGrams: 150,
        ...calculateItemNutrition(INITIAL_FOOD_DATABASE[24], 150),
        timestamp: '16:30',
      },
    ],
  },
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'זמן לשתות מים! 💧',
    body: 'הגיע הזמן לשתות עוד כוס מים כדי לשמור על רעננות וריכוז!',
    time: 'לפני 15 דקות',
    type: 'water',
    read: false,
  },
  {
    id: 'notif_2',
    title: 'הגעת ל-60% מיעד החלבון היומי! 🎯',
    body: 'נשאר לך עוד 55 גרם חלבון להשלמת היעד להיום.',
    time: 'לפני שעה',
    type: 'goal',
    read: false,
  },
  {
    id: 'notif_3',
    title: 'תזכורת ארוחת ערב 🥗',
    body: 'אל תשכח לתעד את ארוחת הערב שלך בסיום.',
    time: '19:00',
    type: 'meal',
    read: true,
  },
];

export const StorageService = {
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      return data ? { ...DEFAULT_USER_PROFILE, ...JSON.parse(data) } : DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  },

  saveProfile(profile: UserProfile): void {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    // Also sync to registered users registry if email exists
    if (profile.email) {
      this.syncUserToRegistry(profile);
    }
  },

  // Multi-user & Auth management
  getUsersRegistry(): UserProfile[] {
    try {
      const data = localStorage.getItem(USERS_KEY);
      return data ? JSON.parse(data) : [DEFAULT_USER_PROFILE];
    } catch {
      return [DEFAULT_USER_PROFILE];
    }
  },

  syncUserToRegistry(user: UserProfile): void {
    const users = this.getUsersRegistry();
    const idx = users.findIndex((u) => u.email === user.email || u.id === user.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...user };
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  logout(): UserProfile {
    const guestProfile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      id: `guest_${Date.now()}`,
      name: 'אורח',
      email: '',
      isLoggedIn: false,
      hasBiometrics: false,
    };
    this.saveProfile(guestProfile);
    return guestProfile;
  },

  getAllDayLogs(): Record<string, DayLog> {
    try {
      const data = localStorage.getItem(DAY_LOGS_KEY);
      if (data) {
        return JSON.parse(data);
      }
      const initialLogs: Record<string, DayLog> = {
        [INITIAL_TODAY_LOG.date]: INITIAL_TODAY_LOG,
      };
      localStorage.setItem(DAY_LOGS_KEY, JSON.stringify(initialLogs));
      return initialLogs;
    } catch {
      return { [INITIAL_TODAY_LOG.date]: INITIAL_TODAY_LOG };
    }
  },

  getDayLog(date: string): DayLog {
    const logs = this.getAllDayLogs();
    if (logs[date]) {
      return logs[date];
    }
    const emptyLog: DayLog = {
      date,
      waterGlasses: 0,
      meals: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: [],
      },
    };
    return emptyLog;
  },

  saveDayLog(dayLog: DayLog): void {
    const logs = this.getAllDayLogs();
    logs[dayLog.date] = dayLog;
    localStorage.setItem(DAY_LOGS_KEY, JSON.stringify(logs));
  },

  addFoodToMeal(
    date: string,
    mealType: MealType,
    food: FoodItem,
    grams: number,
    amount: number,
    unit: string
  ): DayLog {
    const dayLog = this.getDayLog(date);
    const calculated = calculateItemNutrition(food, grams);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const loggedItem: LoggedFoodItem = {
      ...food,
      logId: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      amount,
      unit,
      totalGrams: grams,
      calculatedCalories: calculated.calculatedCalories,
      calculatedProtein: calculated.calculatedProtein,
      calculatedCarbs: calculated.calculatedCarbs,
      calculatedFat: calculated.calculatedFat,
      timestamp: timeStr,
    };

    if (!dayLog.meals[mealType]) {
      dayLog.meals[mealType] = [];
    }

    dayLog.meals[mealType].push(loggedItem);
    this.saveDayLog(dayLog);
    return dayLog;
  },

  removeFoodFromMeal(date: string, mealType: MealType, logId: string): DayLog {
    const dayLog = this.getDayLog(date);
    if (dayLog.meals[mealType]) {
      dayLog.meals[mealType] = dayLog.meals[mealType].filter((item) => item.logId !== logId && item.id !== logId);
      this.saveDayLog(dayLog);
    }
    return dayLog;
  },

  updateWater(date: string, glasses: number): DayLog {
    const dayLog = this.getDayLog(date);
    dayLog.waterGlasses = Math.max(0, glasses);
    this.saveDayLog(dayLog);
    return dayLog;
  },

  getFoodDatabase(): FoodItem[] {
    try {
      const customData = localStorage.getItem(FOOD_DB_KEY);
      if (customData) {
        const customFoods: FoodItem[] = JSON.parse(customData);
        return [...customFoods, ...INITIAL_FOOD_DATABASE];
      }
      return INITIAL_FOOD_DATABASE;
    } catch {
      return INITIAL_FOOD_DATABASE;
    }
  },

  saveCustomFood(food: Omit<FoodItem, 'id'>): FoodItem {
    const newFood: FoodItem = {
      ...food,
      id: 'custom_' + Date.now(),
      isCustom: true,
    };
    try {
      const customData = localStorage.getItem(FOOD_DB_KEY);
      const customFoods: FoodItem[] = customData ? JSON.parse(customData) : [];
      customFoods.unshift(newFood);
      localStorage.setItem(FOOD_DB_KEY, JSON.stringify(customFoods));
    } catch (e) {
      console.warn(e);
    }
    return newFood;
  },

  toggleFavorite(foodId: string): void {
    const database = this.getFoodDatabase();
    const item = database.find((f) => f.id === foodId);
    if (item) {
      item.isFavorite = !item.isFavorite;
      const customData = localStorage.getItem(FOOD_DB_KEY);
      const customFoods: FoodItem[] = customData ? JSON.parse(customData) : [];
      const cIndex = customFoods.findIndex((f) => f.id === foodId);
      if (cIndex >= 0) {
        customFoods[cIndex].isFavorite = item.isFavorite;
        localStorage.setItem(FOOD_DB_KEY, JSON.stringify(customFoods));
      }
    }
  },

  getNotifications(): NotificationItem[] {
    try {
      const data = localStorage.getItem(NOTIFICATIONS_KEY);
      return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },

  markNotificationsAsRead(): void {
    const list = this.getNotifications().map((n) => ({ ...n, read: true }));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
  },

  exportAllData(): string {
    const data = {
      profile: this.getProfile(),
      dayLogs: this.getAllDayLogs(),
      customFoods: localStorage.getItem(FOOD_DB_KEY) ? JSON.parse(localStorage.getItem(FOOD_DB_KEY)!) : [],
      notifications: this.getNotifications(),
      exportDate: new Date().toISOString(),
      version: '1.0.0',
    };
    return JSON.stringify(data, null, 2);
  },

  importAllData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.profile) localStorage.setItem(PROFILE_KEY, JSON.stringify(parsed.profile));
      if (parsed.dayLogs) localStorage.setItem(DAY_LOGS_KEY, JSON.stringify(parsed.dayLogs));
      if (parsed.customFoods) localStorage.setItem(FOOD_DB_KEY, JSON.stringify(parsed.customFoods));
      if (parsed.notifications) localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(parsed.notifications));
      return true;
    } catch (e) {
      console.warn('Import failed', e);
      return false;
    }
  },

  resetAllData(): void {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(DAY_LOGS_KEY);
    localStorage.removeItem(FOOD_DB_KEY);
    localStorage.removeItem(NOTIFICATIONS_KEY);
  },
};
