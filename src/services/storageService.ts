import type { DayLog, FoodItem, LoggedFoodItem, MealType, UserProfile, NotificationItem, MealPlanPreset, WorkoutDayType, WeeklyMealPlanSchedule, WeeklyMealPlanDay, AICoachMessage, AICoachMemory } from '../types';
import { INITIAL_FOOD_DATABASE } from '../data/foodDatabase';
import { calculateItemNutrition, getTodayDateString } from './nutritionCalculator';

const ACTIVE_USER_ID_KEY = 'nutritrack_active_user_id_v1';
const PROFILE_KEY_LEGACY = 'nutritrack_user_profile_v1';
const PROFILE_KEY_PREFIX = 'nutritrack_user_profile_v1_';
const USERS_REGISTRY_KEY = 'nutritrack_users_registry_v1';
const DAY_LOGS_PREFIX = 'nutritrack_day_logs_v1_';
const FOOD_DB_PREFIX = 'nutritrack_custom_food_db_v1_';
const CUSTOM_MEAL_PLANS_PREFIX = 'nutritrack_custom_meal_plans_v1_';
const WEEKLY_MEAL_PLAN_PREFIX = 'nutritrack_weekly_meal_plan_v1_';
const NOTIFICATIONS_PREFIX = 'nutritrack_notifications_v1_';
const AI_COACH_MESSAGES_PREFIX = 'nutritrack_ai_coach_messages_v1_';
const AI_COACH_MEMORY_PREFIX = 'nutritrack_ai_coach_memory_v1_';

export const DEFAULT_WEEKLY_MEAL_PLAN: WeeklyMealPlanSchedule = {
  0: { dayOfWeek: 0, dayName: 'יום ראשון' },
  1: { dayOfWeek: 1, dayName: 'יום שני' },
  2: { dayOfWeek: 2, dayName: 'יום שלישי' },
  3: { dayOfWeek: 3, dayName: 'יום רביעי' },
  4: { dayOfWeek: 4, dayName: 'יום חמישי' },
  5: { dayOfWeek: 5, dayName: 'יום שישי' },
  6: { dayOfWeek: 6, dayName: 'יום שבת' },
};

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'usr_default_1',
  name: 'משתמש חדש',
  email: 'user@example.com',
  isLoggedIn: true,
  hasBiometrics: false,
  gender: 'male',
  age: 28,
  height: 175,
  initialWeight: 70,
  currentWeight: 70,
  targetWeight: 68,
  weightLogs: [
    {
      id: 'w_init',
      date: getTodayDateString(),
      weight: 70,
      note: 'משקל התחלתי',
      timestamp: '08:00',
    },
  ],
  activityLevel: 'moderate',
  goal: 'lean_bulk',
  dailyCalorieTarget: 2200,
  dailyProteinTarget: 155,
  dailyCarbsTarget: 220,
  dailyFatTarget: 65,
  dailyWaterTargetGlasses: 8,
  theme: 'light',
  pushNotificationsEnabled: false,
  waterReminderEnabled: true,
  waterReminderIntervalMinutes: 120,
  mealReminderBreakfast: '08:30',
  mealReminderLunch: '13:30',
  mealReminderDinner: '19:30',
  weeklyWeightReminderEnabled: true,
  weeklyWeightReminderDay: 0, // יום ראשון
  weeklyWeightReminderTime: '08:00',
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
  // Active User Identifier
  getActiveUserId(): string {
    try {
      const activeId = localStorage.getItem(ACTIVE_USER_ID_KEY);
      if (activeId) return activeId;
      const legacyProfileStr = localStorage.getItem(PROFILE_KEY_LEGACY);
      if (legacyProfileStr) {
        const parsed = JSON.parse(legacyProfileStr);
        if (parsed.id) {
          localStorage.setItem(ACTIVE_USER_ID_KEY, parsed.id);
          return parsed.id;
        }
      }
      return DEFAULT_USER_PROFILE.id || 'usr_default_1';
    } catch {
      return DEFAULT_USER_PROFILE.id || 'usr_default_1';
    }
  },

  setActiveUserId(userId: string): void {
    try {
      localStorage.setItem(ACTIVE_USER_ID_KEY, userId);
    } catch (e) {
      console.warn(e);
    }
  },

  // Profile Management (User-Scoped)
  getProfile(userId?: string): UserProfile {
    const uid = userId || this.getActiveUserId();
    try {
      // 1. Check user-specific storage key
      const userSpecificData = localStorage.getItem(PROFILE_KEY_PREFIX + uid);
      if (userSpecificData) {
        const parsed = JSON.parse(userSpecificData);
        const merged: UserProfile = { ...DEFAULT_USER_PROFILE, ...parsed };
        if (parsed.initialWeight === undefined) {
          merged.initialWeight = parsed.currentWeight ?? merged.currentWeight;
        }
        return merged;
      }

      // 2. Check users registry
      const registry = this.getUsersRegistry();
      const userInRegistry = registry.find((u) => u.id === uid);
      if (userInRegistry) {
        const merged: UserProfile = { ...DEFAULT_USER_PROFILE, ...userInRegistry };
        if (userInRegistry.initialWeight === undefined) {
          merged.initialWeight = userInRegistry.currentWeight ?? merged.currentWeight;
        }
        return merged;
      }

      // 3. Check legacy key if default
      const legacyData = localStorage.getItem(PROFILE_KEY_LEGACY);
      if (legacyData) {
        const parsed = JSON.parse(legacyData);
        if (parsed.id === uid || uid === DEFAULT_USER_PROFILE.id) {
          const merged: UserProfile = { ...DEFAULT_USER_PROFILE, ...parsed };
          if (parsed.initialWeight === undefined) {
            merged.initialWeight = parsed.currentWeight ?? merged.currentWeight;
          }
          return merged;
        }
      }

      return DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  },

  saveProfile(profile: UserProfile): void {
    const uid = profile.id || `usr_${Date.now()}`;
    const initialW = profile.initialWeight || profile.currentWeight;
    const userToSave: UserProfile = {
      ...profile,
      id: uid,
      initialWeight: initialW,
      currentWeight: profile.currentWeight,
    };

    try {
      this.setActiveUserId(uid);
      localStorage.setItem(PROFILE_KEY_PREFIX + uid, JSON.stringify(userToSave));
      localStorage.setItem(PROFILE_KEY_LEGACY, JSON.stringify(userToSave));
      this.syncUserToRegistry(userToSave);
    } catch (e) {
      console.warn('Failed to save profile', e);
    }
  },

  // Users Registry (All registered users on this device)
  getUsersRegistry(): UserProfile[] {
    try {
      const data = localStorage.getItem(USERS_REGISTRY_KEY);
      return data ? JSON.parse(data) : [DEFAULT_USER_PROFILE];
    } catch {
      return [DEFAULT_USER_PROFILE];
    }
  },

  syncUserToRegistry(user: UserProfile): void {
    try {
      const users = this.getUsersRegistry();
      const idx = users.findIndex((u) => u.id === user.id || (u.email && u.email === user.email));
      if (idx >= 0) {
        users[idx] = { ...users[idx], ...user };
      } else {
        users.push(user);
      }
      localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn(e);
    }
  },

  logout(): UserProfile {
    const guestId = `guest_${Date.now()}`;
    const guestProfile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      id: guestId,
      name: 'אורח',
      email: '',
      isLoggedIn: false,
      hasBiometrics: false,
    };
    this.setActiveUserId(guestId);
    this.saveProfile(guestProfile);
    return guestProfile;
  },

  // Day Logs (Per-User Isolated)
  getAllDayLogs(userId?: string): Record<string, DayLog> {
    const uid = userId || this.getActiveUserId();
    const key = DAY_LOGS_PREFIX + uid;

    try {
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }

      // Check legacy single-user log if it's the initial default demo user
      if (uid === DEFAULT_USER_PROFILE.id || uid === 'usr_default_1') {
        const legacy = localStorage.getItem('nutritrack_day_logs_v1');
        if (legacy) {
          const parsed = JSON.parse(legacy);
          localStorage.setItem(key, JSON.stringify(parsed));
          return parsed;
        }
        const initial: Record<string, DayLog> = {
          [INITIAL_TODAY_LOG.date]: INITIAL_TODAY_LOG,
        };
        localStorage.setItem(key, JSON.stringify(initial));
        return initial;
      }

      // For any newly registered or authenticated user, start with clean state
      return {};
    } catch {
      return {};
    }
  },

  getDayLog(date: string, userId?: string): DayLog {
    const uid = userId || this.getActiveUserId();
    const logs = this.getAllDayLogs(uid);

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

  saveDayLog(dayLog: DayLog, userId?: string): void {
    const uid = userId || this.getActiveUserId();
    const key = DAY_LOGS_PREFIX + uid;
    const logs = this.getAllDayLogs(uid);

    logs[dayLog.date] = dayLog;
    try {
      localStorage.setItem(key, JSON.stringify(logs));
    } catch (e) {
      console.warn('Failed to save day log', e);
    }
  },

  addFoodToMeal(
    date: string,
    mealType: MealType,
    food: FoodItem,
    grams: number,
    amount: number,
    unit: string,
    userId?: string
  ): DayLog {
    const uid = userId || this.getActiveUserId();
    const dayLog = this.getDayLog(date, uid);
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
    this.saveDayLog(dayLog, uid);
    return dayLog;
  },

  addDirectItemToMeal(
    date: string,
    mealType: MealType,
    name: string,
    calories: number,
    protein: number,
    carbs: number,
    fat: number,
    unit?: string,
    userId?: string
  ): DayLog {
    const uid = userId || this.getActiveUserId();
    const dayLog = this.getDayLog(date, uid);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const loggedItem: LoggedFoodItem = {
      name: name.trim() || 'מנה ישירה',
      amount: 1,
      unit: unit || 'מנה',
      totalGrams: 100,
      calories: Math.round(calories),
      calculatedCalories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      calculatedProtein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      calculatedCarbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      calculatedFat: Math.round(fat * 10) / 10,
      logId: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: timeStr,
    };

    if (!dayLog.meals[mealType]) {
      dayLog.meals[mealType] = [];
    }

    dayLog.meals[mealType].push(loggedItem);
    this.saveDayLog(dayLog, uid);
    return dayLog;
  },

  removeFoodFromMeal(date: string, mealType: MealType, logId: string, userId?: string): DayLog {
    const uid = userId || this.getActiveUserId();
    const dayLog = this.getDayLog(date, uid);

    if (dayLog.meals[mealType]) {
      dayLog.meals[mealType] = dayLog.meals[mealType].filter(
        (item) => item.logId !== logId && item.id !== logId
      );
      this.saveDayLog(dayLog, uid);
    }
    return dayLog;
  },

  updateWater(date: string, glasses: number, userId?: string): DayLog {
    const uid = userId || this.getActiveUserId();
    const dayLog = this.getDayLog(date, uid);
    dayLog.waterGlasses = Math.max(0, glasses);
    this.saveDayLog(dayLog, uid);
    return dayLog;
  },

  setDayWorkout(
    date: string,
    workoutType: WorkoutDayType,
    burnedCalories?: number,
    title?: string,
    durationMinutes?: number,
    userId?: string
  ): DayLog {
    const uid = userId || this.getActiveUserId();
    const dayLog = this.getDayLog(date, uid);
    dayLog.workoutType = workoutType;
    if (burnedCalories !== undefined) dayLog.workoutBurnedCalories = burnedCalories;
    if (title !== undefined) dayLog.workoutTitle = title;
    if (durationMinutes !== undefined) dayLog.workoutDurationMinutes = durationMinutes;
    this.saveDayLog(dayLog, uid);
    return dayLog;
  },

  // Custom Foods (Per-User Isolated)
  getFoodDatabase(userId?: string): FoodItem[] {
    const uid = userId || this.getActiveUserId();
    const key = FOOD_DB_PREFIX + uid;

    try {
      const customData = localStorage.getItem(key);
      if (customData) {
        const customFoods: FoodItem[] = JSON.parse(customData);
        return [...customFoods, ...INITIAL_FOOD_DATABASE];
      }
      return INITIAL_FOOD_DATABASE;
    } catch {
      return INITIAL_FOOD_DATABASE;
    }
  },

  saveCustomFood(food: Omit<FoodItem, 'id'>, userId?: string): FoodItem {
    const uid = userId || this.getActiveUserId();
    const key = FOOD_DB_PREFIX + uid;

    const newFood: FoodItem = {
      ...food,
      id: 'custom_' + Date.now(),
      isCustom: true,
    };

    try {
      const customData = localStorage.getItem(key);
      const customFoods: FoodItem[] = customData ? JSON.parse(customData) : [];
      customFoods.unshift(newFood);
      localStorage.setItem(key, JSON.stringify(customFoods));
    } catch (e) {
      console.warn(e);
    }
    return newFood;
  },

  updateCustomFood(food: FoodItem, userId?: string): FoodItem {
    const uid = userId || this.getActiveUserId();
    const key = FOOD_DB_PREFIX + uid;

    try {
      const customData = localStorage.getItem(key);
      const customFoods: FoodItem[] = customData ? JSON.parse(customData) : [];
      const idx = customFoods.findIndex((f) => f.id === food.id);
      if (idx >= 0) {
        customFoods[idx] = { ...food, isCustom: true };
      } else {
        customFoods.unshift({ ...food, isCustom: true });
      }
      localStorage.setItem(key, JSON.stringify(customFoods));
    } catch (e) {
      console.warn(e);
    }
    return food;
  },

  deleteCustomFood(foodId: string, userId?: string): FoodItem[] {
    const uid = userId || this.getActiveUserId();
    const key = FOOD_DB_PREFIX + uid;

    try {
      const customData = localStorage.getItem(key);
      const customFoods: FoodItem[] = customData ? JSON.parse(customData) : [];
      const updated = customFoods.filter((f) => f.id !== foodId);
      localStorage.setItem(key, JSON.stringify(updated));
      return [...updated, ...INITIAL_FOOD_DATABASE];
    } catch (e) {
      console.warn(e);
      return this.getFoodDatabase(uid);
    }
  },

  toggleFavorite(foodId: string, userId?: string): void {
    const uid = userId || this.getActiveUserId();
    const key = FOOD_DB_PREFIX + uid;

    const database = this.getFoodDatabase(uid);
    const item = database.find((f) => f.id === foodId);
    if (item) {
      item.isFavorite = !item.isFavorite;
      try {
        const customData = localStorage.getItem(key);
        const customFoods: FoodItem[] = customData ? JSON.parse(customData) : [];
        const cIndex = customFoods.findIndex((f) => f.id === foodId);
        if (cIndex >= 0) {
          customFoods[cIndex].isFavorite = item.isFavorite;
          localStorage.setItem(key, JSON.stringify(customFoods));
        }
      } catch (e) {
        console.warn(e);
      }
    }
  },

  // Weight Tracking & Progress (Per-User Isolated)
  logWeight(
    weight: number,
    date?: string,
    note?: string,
    userId?: string
  ): UserProfile {
    const uid = userId || this.getActiveUserId();
    const profile = this.getProfile(uid);
    const dateStr = date || getTodayDateString();

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newEntry: import('../types').WeightLogEntry = {
      id: 'w_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      date: dateStr,
      weight: Number(weight),
      note: note ? note.trim() : undefined,
      timestamp: timeStr,
    };

    const currentLogs = Array.isArray(profile.weightLogs) ? [...profile.weightLogs] : [];
    
    // Replace if same date or insert sorted
    const existingIdx = currentLogs.findIndex((l) => l.date === dateStr);
    if (existingIdx >= 0) {
      currentLogs[existingIdx] = newEntry;
    } else {
      currentLogs.push(newEntry);
    }

    // Sort logs chronologically (newest first for display, or oldest first)
    currentLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const updatedProfile: UserProfile = {
      ...profile,
      initialWeight: profile.initialWeight || profile.currentWeight || weight,
      currentWeight: Number(weight),
      weightLogs: currentLogs,
    };

    this.saveProfile(updatedProfile);
    return updatedProfile;
  },

  deleteWeightLog(logId: string, userId?: string): UserProfile {
    const uid = userId || this.getActiveUserId();
    const profile = this.getProfile(uid);
    const currentLogs = (profile.weightLogs || []).filter((l) => l.id !== logId);

    const latestWeight = currentLogs.length > 0 ? currentLogs[0].weight : profile.initialWeight || profile.currentWeight;

    const updatedProfile: UserProfile = {
      ...profile,
      currentWeight: latestWeight,
      weightLogs: currentLogs,
    };

    this.saveProfile(updatedProfile);
    return updatedProfile;
  },

  // Notifications (Per-User Isolated)
  getNotifications(userId?: string): NotificationItem[] {
    const uid = userId || this.getActiveUserId();
    const key = NOTIFICATIONS_PREFIX + uid;

    try {
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
      // Demo notifications for default user only
      if (uid === DEFAULT_USER_PROFILE.id || uid === 'usr_default_1') {
        return INITIAL_NOTIFICATIONS;
      }
      return [];
    } catch {
      return [];
    }
  },

  markNotificationsAsRead(userId?: string): void {
    const uid = userId || this.getActiveUserId();
    const key = NOTIFICATIONS_PREFIX + uid;
    const list = this.getNotifications(uid).map((n) => ({ ...n, read: true }));
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {
      console.warn(e);
    }
  },

  // Custom Meal Plans (Per-User Isolated)
  getCustomMealPlans(userId?: string): MealPlanPreset[] {
    const uid = userId || this.getActiveUserId();
    const key = CUSTOM_MEAL_PLANS_PREFIX + uid;

    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCustomMealPlan(plan: MealPlanPreset, userId?: string): MealPlanPreset {
    const uid = userId || this.getActiveUserId();
    const key = CUSTOM_MEAL_PLANS_PREFIX + uid;

    const plans = this.getCustomMealPlans(uid);
    const idx = plans.findIndex((p) => p.id === plan.id);
    if (idx >= 0) {
      plans[idx] = plan;
    } else {
      plans.unshift(plan);
    }

    try {
      localStorage.setItem(key, JSON.stringify(plans));
    } catch (e) {
      console.warn(e);
    }
    return plan;
  },

  deleteCustomMealPlan(planId: string, userId?: string): void {
    const uid = userId || this.getActiveUserId();
    const key = CUSTOM_MEAL_PLANS_PREFIX + uid;
    const plans = this.getCustomMealPlans(uid).filter((p) => p.id !== planId);
    try {
      localStorage.setItem(key, JSON.stringify(plans));
    } catch (e) {
      console.warn(e);
    }
  },

  // Weekly Meal Plan (Per-User Isolated)
  getWeeklyMealPlan(userId?: string): WeeklyMealPlanSchedule {
    const uid = userId || this.getActiveUserId();
    const key = WEEKLY_MEAL_PLAN_PREFIX + uid;
    try {
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
      return DEFAULT_WEEKLY_MEAL_PLAN;
    } catch {
      return DEFAULT_WEEKLY_MEAL_PLAN;
    }
  },

  saveWeeklyMealPlan(schedule: WeeklyMealPlanSchedule, userId?: string): void {
    const uid = userId || this.getActiveUserId();
    const key = WEEKLY_MEAL_PLAN_PREFIX + uid;
    try {
      localStorage.setItem(key, JSON.stringify(schedule));
    } catch (e) {
      console.warn(e);
    }
  },

  assignPlanToWeeklyDay(
    dayOfWeek: number,
    plan: MealPlanPreset | null,
    userId?: string
  ): WeeklyMealPlanSchedule {
    const uid = userId || this.getActiveUserId();
    const schedule = this.getWeeklyMealPlan(uid);
    const dayNames = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'];

    if (!plan) {
      schedule[dayOfWeek] = {
        dayOfWeek,
        dayName: dayNames[dayOfWeek],
      };
    } else {
      schedule[dayOfWeek] = {
        dayOfWeek,
        dayName: dayNames[dayOfWeek],
        planId: plan.id,
        planTitle: plan.title,
        planBadge: plan.badge,
        totalCalories: plan.totalCalories,
        protein: plan.protein,
        carbs: plan.carbs,
        fat: plan.fat,
        meals: plan.meals,
      };
    }

    this.saveWeeklyMealPlan(schedule, uid);
    return schedule;
  },

  applyWeeklyDayToCalendarDate(
    date: string,
    dayPlan: WeeklyMealPlanDay,
    foodDatabase: FoodItem[],
    userId?: string
  ): DayLog {
    const uid = userId || this.getActiveUserId();

    if (dayPlan.meals) {
      dayPlan.meals.forEach((planMeal) => {
        planMeal.items.forEach((item) => {
          const food = foodDatabase.find((f) => f.id === item.foodId) || {
            id: item.foodId,
            name: item.name,
            calories: Math.round((item.calories / (item.grams || 100)) * 100),
            protein: Math.round((item.protein / (item.grams || 100)) * 100),
            carbs: Math.round((item.carbs / (item.grams || 100)) * 100),
            fat: Math.round((item.fat / (item.grams || 100)) * 100),
            servingUnit: item.amountDesc || 'מנה',
            servingGrams: item.grams || 100,
            category: 'proteins' as const,
          };

          this.addFoodToMeal(
            date,
            planMeal.mealType,
            food,
            item.grams,
            1,
            item.amountDesc || 'מנה',
            uid
          );
        });
      });
    }

    return this.getDayLog(date, uid);
  },

  // Backup Export / Import (Per User)
  exportAllData(userId?: string): string {
    const uid = userId || this.getActiveUserId();
    const data = {
      profile: this.getProfile(uid),
      dayLogs: this.getAllDayLogs(uid),
      customFoods: this.getFoodDatabase(uid).filter((f) => f.isCustom),
      customPlans: this.getCustomMealPlans(uid),
      notifications: this.getNotifications(uid),
      exportDate: new Date().toISOString(),
      version: '2.0.0',
    };
    return JSON.stringify(data, null, 2);
  },

  importAllData(jsonString: string, userId?: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      const uid = userId || parsed.profile?.id || this.getActiveUserId();

      if (parsed.profile) {
        this.saveProfile(parsed.profile);
      }
      if (parsed.dayLogs) {
        localStorage.setItem(DAY_LOGS_PREFIX + uid, JSON.stringify(parsed.dayLogs));
      }
      if (parsed.customFoods) {
        localStorage.setItem(FOOD_DB_PREFIX + uid, JSON.stringify(parsed.customFoods));
      }
      if (parsed.customPlans) {
        localStorage.setItem(CUSTOM_MEAL_PLANS_PREFIX + uid, JSON.stringify(parsed.customPlans));
      }
      if (parsed.notifications) {
        localStorage.setItem(NOTIFICATIONS_PREFIX + uid, JSON.stringify(parsed.notifications));
      }
      return true;
    } catch (e) {
      console.warn('Import failed', e);
      return false;
    }
  },

  getAICoachMessages(userId?: string): AICoachMessage[] {
    const uid = userId || this.getActiveUserId();
    const raw = localStorage.getItem(AI_COACH_MESSAGES_PREFIX + uid);
    if (!raw) {
      return [
        {
          id: 'init_welcome',
          role: 'assistant',
          content: 'שלום! 👋 אני מאמן התזונה האישי שלך ב-NutriTrack. אני כאן כדי לעזור לך להגיע ליעדים שלך, להתאים את התפריט אם אתה מרגיש שבע מדי או כבד, לענות על שאלות תזונה ולהציע מתכונים מדויקים. במה אוכל לעזור לך היום?',
          timestamp: 'עכשיו',
          suggestedActions: [
            { label: '🤢 מרגיש מפוצץ / כבד - מה לעשות?', type: 'replace_meal' },
            { label: '🍳 הצע לי ארוחה להשלמת החלבון', type: 'open_recipe_generator' },
            { label: '📊 נתח את ההתקדמות השבועית שלי', type: 'adjust_today_targets' },
            { label: '⚡ מה לאכול לפני אימון?', type: 'replace_meal' },
          ],
        },
      ];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveAICoachMessages(messages: AICoachMessage[], userId?: string): void {
    const uid = userId || this.getActiveUserId();
    localStorage.setItem(AI_COACH_MESSAGES_PREFIX + uid, JSON.stringify(messages));
  },

  getAICoachMemory(userId?: string): AICoachMemory {
    const uid = userId || this.getActiveUserId();
    const raw = localStorage.getItem(AI_COACH_MEMORY_PREFIX + uid);
    if (!raw) {
      return {
        preferences: [],
        allergiesOrDislikes: [],
        satietyState: 'normal',
        userNotes: [],
      };
    }
    try {
      return JSON.parse(raw);
    } catch {
      return {
        preferences: [],
        allergiesOrDislikes: [],
        satietyState: 'normal',
        userNotes: [],
      };
    }
  },

  saveAICoachMemory(memory: AICoachMemory, userId?: string): void {
    const uid = userId || this.getActiveUserId();
    localStorage.setItem(AI_COACH_MEMORY_PREFIX + uid, JSON.stringify(memory));
  },

  clearAICoachHistory(userId?: string): void {
    const uid = userId || this.getActiveUserId();
    localStorage.removeItem(AI_COACH_MESSAGES_PREFIX + uid);
    localStorage.removeItem(AI_COACH_MEMORY_PREFIX + uid);
  },

  resetAllData(userId?: string): void {
    const uid = userId || this.getActiveUserId();
    localStorage.removeItem(PROFILE_KEY_PREFIX + uid);
    localStorage.removeItem(DAY_LOGS_PREFIX + uid);
    localStorage.removeItem(FOOD_DB_PREFIX + uid);
    localStorage.removeItem(NOTIFICATIONS_PREFIX + uid);
    localStorage.removeItem(CUSTOM_MEAL_PLANS_PREFIX + uid);
    localStorage.removeItem(AI_COACH_MESSAGES_PREFIX + uid);
    localStorage.removeItem(AI_COACH_MEMORY_PREFIX + uid);
  },
};
