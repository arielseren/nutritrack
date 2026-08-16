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

export type FitnessGoal = 'lose_weight' | 'maintain' | 'gain_muscle';

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

export interface DayLog {
  date: string; // YYYY-MM-DD
  waterGlasses: number; // e.g. 6 of 8
  meals: {
    breakfast: LoggedFoodItem[];
    lunch: LoggedFoodItem[];
    dinner: LoggedFoodItem[];
    snack: LoggedFoodItem[];
  };
  notes?: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  email?: string;
  password?: string;
  isLoggedIn?: boolean;
  hasBiometrics?: boolean;
  biometricCredentialId?: string;
  gender: 'male' | 'female';
  age: number;
  height: number; // cm
  currentWeight: number; // kg
  targetWeight: number; // kg
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
  dailyCalorieTarget: number;
  dailyProteinTarget: number; // grams
  dailyCarbsTarget: number; // grams
  dailyFatTarget: number; // grams
  dailyWaterTargetGlasses: number; // glasses (250ml each)
  theme: 'light' | 'dark';
  waterReminderEnabled?: boolean;
  pushNotificationsEnabled?: boolean;
  notificationsEnabled?: boolean;
  waterReminderIntervalMinutes?: number;
  mealReminderBreakfast?: string; // HH:mm
  mealReminderLunch?: string;
  mealReminderDinner?: string;
}

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

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  type: 'water' | 'meal' | 'goal' | 'system';
  read: boolean;
}
