export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type FoodCategory =
  | 'all'
  | 'popular'
  | 'proteins'
  | 'carbs'
  | 'fats'
  | 'dairy'
  | 'fruits_veggies'
  | 'snacks'
  | 'beverages'
  | 'favorites';

export type FitnessGoal = 'lose_weight' | 'maintain' | 'lean_bulk' | 'gain_muscle';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'extra_active';

export interface FoodItem {
  id: string;
  name: string;
  nameEn?: string;
  brand?: string;
  calories: number; // kcal per 100g
  protein: number; // grams per 100g
  carbs: number; // grams per 100g
  fat: number; // grams per 100g
  fiber?: number; // grams per 100g
  servingUnit: string; // e.g. "גביע (200 גרם)", "פרוסה (30 גרם)"
  servingGrams: number; // default gram amount for 1 unit
  category: FoodCategory;
  barcode?: string;
  imageUrl?: string;
  isFavorite?: boolean;
  isCustom?: boolean;
}

export interface LoggedFoodItem {
  id?: string;
  logId?: string; // unique log entry id
  foodId?: string;
  name: string;
  mealType?: MealType;
  loggedAt?: string;
  timestamp?: string;
  grams?: number;
  totalGrams?: number;
  amount: number;
  unit: string;
  calories?: number;
  calculatedCalories: number;
  protein?: number;
  calculatedProtein: number;
  carbs?: number;
  calculatedCarbs: number;
  fat?: number;
  calculatedFat: number;
  fiber?: number;
  imageUrl?: string;
}

export type WorkoutDayType =
  | 'rest'
  | 'light_strength'
  | 'heavy_strength'
  | 'cardio'
  | 'hiit'
  | 'custom';

export interface DayLog {
  date: string; // YYYY-MM-DD
  waterGlasses: number; // e.g. 6 of 8
  workoutType?: WorkoutDayType;
  workoutTitle?: string;
  workoutBurnedCalories?: number;
  workoutDurationMinutes?: number;
  meals: {
    breakfast: LoggedFoodItem[];
    lunch: LoggedFoodItem[];
    dinner: LoggedFoodItem[];
    snack: LoggedFoodItem[];
  };
  notes?: string;
}

export interface WeightLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // kg
  note?: string;
  timestamp?: string; // HH:mm
}

export interface UserProfile {
  id?: string;
  name: string;
  email?: string;
  password?: string;
  isLoggedIn?: boolean;
  isOnboarded?: boolean;
  hasBiometrics?: boolean;
  biometricCredentialId?: string;
  gender: 'male' | 'female';
  age: number;
  height: number; // cm
  initialWeight?: number; // Starting weight in kg
  currentWeight: number; // kg
  targetWeight: number; // kg
  weightLogs?: WeightLogEntry[];
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
  dailyCalorieTarget: number;
  dailyProteinTarget: number; // grams
  dailyCarbsTarget: number; // grams
  dailyFatTarget: number; // grams
  dailyWaterTargetGlasses: number; // glasses (250ml each)
  theme: 'light' | 'dark';
  weeklyWorkoutSchedule?: Record<number, WorkoutDayType>; // 0=Sunday, 1=Monday, etc.
  calorieCyclingEnabled?: boolean;
  waterReminderEnabled?: boolean;
  pushNotificationsEnabled?: boolean;
  notificationsEnabled?: boolean;
  waterReminderIntervalMinutes?: number;
  mealReminderBreakfast?: string; // HH:mm
  mealReminderLunch?: string;
  mealReminderDinner?: string;
  weeklyWeightReminderEnabled?: boolean;
  weeklyWeightReminderDay?: number; // 0=Sunday, 1=Monday...
  weeklyWeightReminderTime?: string; // HH:mm
  aiApiKey?: string;
  aiModel?: string;
}

export * from './ai';

export interface MealPlanPreset {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  badge: string; // e.g. "חיטוב מואץ", "מסה נקייה", "מותאם אישית"
  targetGoal: FitnessGoal;
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  isCustom?: boolean;
  author?: string;
  createdAt?: string;
  meals: {
    mealType: MealType;
    items: {
      foodId: string;
      name: string;
      amountDesc: string;
      grams: number;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }[];
  }[];
}

export interface WeeklyMealPlanDay {
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  dayName?: string;
  date?: string; // YYYY-MM-DD
  planId?: string; // Assigned preset or custom plan ID
  planTitle?: string;
  planBadge?: string;
  totalCalories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  meals?: {
    mealType: MealType;
    items: {
      foodId: string;
      name: string;
      amountDesc: string;
      grams: number;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }[];
  }[];
}

export type WeeklyMealPlanSchedule = Record<number, WeeklyMealPlanDay>; // 0 to 6

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  type: 'water' | 'meal' | 'goal' | 'system';
  read: boolean;
}
