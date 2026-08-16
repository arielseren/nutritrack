import type { ActivityLevel, FitnessGoal, DayLog, LoggedFoodItem, WorkoutDayType, UserProfile } from '../types';

/**
 * מחושב לפי משוואת מיפלין סנט ג'ור (Mifflin-St Jeor)
 */
export function calculateBMR(
  gender: 'male' | 'female',
  weightKg: number,
  heightCm: number,
  age: number
): number {
  if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  } else {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }
}

export function getActivityMultiplier(level: ActivityLevel): number {
  switch (level) {
    case 'sedentary':
      return 1.2; // יושבני ללא פעילות
    case 'light':
      return 1.375; // אימונים קלים 1-3 פעמים בשבוע
    case 'moderate':
      return 1.55; // אימונים בינוניים 3-5 פעמים בשבוע
    case 'active':
      return 1.725; // אימונים אינטנסיביים 6-7 פעמים בשבוע
    case 'extra_active':
      return 1.9; // אימונים פעמיים ביום / עבודה פיזית קשה
    default:
      return 1.375;
  }
}

export function calculateTDEE(
  bmr: number,
  activityLevel: ActivityLevel,
  goal: FitnessGoal
): {
  maintenanceCalories: number;
  targetCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
} {
  const maintenance = Math.round(bmr * getActivityMultiplier(activityLevel));
  let target = maintenance;

  let proteinPercent = 0.30;
  let carbsPercent = 0.40;
  let fatPercent = 0.30;

  if (goal === 'lose_weight') {
    target = Math.max(1200, Math.round(maintenance - 450)); // גירעון מבוקר
    proteinPercent = 0.35; // דגש על שימור שריר
    carbsPercent = 0.35;
    fatPercent = 0.30;
  } else if (goal === 'lean_bulk') {
    target = Math.round(maintenance + 250); // עודף קלורי קל ונקי לבניית שריר ללא שומן
    proteinPercent = 0.32; // חלבון גבוה (כ-2.2 גרם לק"ג)
    carbsPercent = 0.43; // אנרגיה לאימונים
    fatPercent = 0.25;
  } else if (goal === 'gain_muscle') {
    target = Math.round(maintenance + 450); // עודף קלורי מלא
    proteinPercent = 0.28;
    carbsPercent = 0.47;
    fatPercent = 0.25;
  }

  const proteinGrams = Math.round((target * proteinPercent) / 4);
  const carbsGrams = Math.round((target * carbsPercent) / 4);
  const fatGrams = Math.round((target * fatPercent) / 9);

  return {
    maintenanceCalories: maintenance,
    targetCalories: target,
    proteinGrams,
    carbsGrams,
    fatGrams,
  };
}

export function calculateScientificTargets(
  gender: 'male' | 'female',
  age: number,
  heightCm: number,
  weightKg: number,
  activityLevel: ActivityLevel,
  goal: FitnessGoal
) {
  const bmr = calculateBMR(gender, weightKg, heightCm, age);
  const tdee = calculateTDEE(bmr, activityLevel, goal);
  return {
    bmr,
    calories: tdee.targetCalories,
    protein: tdee.proteinGrams,
    carbs: tdee.carbsGrams,
    fat: tdee.fatGrams,
  };
}

export function calculateItemNutrition(
  item: { calories: number; protein: number; carbs: number; fat: number },
  grams: number
) {
  const ratio = grams / 100;
  return {
    calculatedCalories: Math.round(item.calories * ratio),
    calculatedProtein: Math.round(item.protein * ratio * 10) / 10,
    calculatedCarbs: Math.round(item.carbs * ratio * 10) / 10,
    calculatedFat: Math.round(item.fat * ratio * 10) / 10,
  };
}

export function calculateDayTotals(dayLog?: DayLog) {
  if (!dayLog) {
    return {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      allLoggedItems: [] as LoggedFoodItem[],
    };
  }

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  const allLoggedItems: LoggedFoodItem[] = [];

  const mealTypes: (keyof DayLog['meals'])[] = ['breakfast', 'lunch', 'dinner', 'snack'];

  mealTypes.forEach((meal) => {
    const items = dayLog.meals[meal] || [];
    items.forEach((item) => {
      totalCalories += item.calculatedCalories ?? item.calories ?? 0;
      totalProtein += item.calculatedProtein ?? item.protein ?? 0;
      totalCarbs += item.calculatedCarbs ?? item.carbs ?? 0;
      totalFat += item.calculatedFat ?? item.fat ?? 0;
      allLoggedItems.push(item);
    });
  });

  return {
    totalCalories: Math.round(totalCalories),
    totalProtein: Math.round(totalProtein * 10) / 10,
    totalCarbs: Math.round(totalCarbs * 10) / 10,
    totalFat: Math.round(totalFat * 10) / 10,
    allLoggedItems,
  };
}

export function formatHebrewDate(dateStr: string): string {
  const todayStr = getTodayDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  if (dateStr === todayStr) return 'היום';
  if (dateStr === yesterdayStr) return 'אתמול';
  if (dateStr === tomorrowStr) return 'מחר';

  const [year, month, day] = dateStr.split('-');
  const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
  return dateObj.toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface WorkoutConfig {
  type: WorkoutDayType;
  title: string;
  emoji: string;
  badge: string;
  defaultBurnedKcal: number;
  description: string;
  carbBoostGrams: number;
  proteinBoostGrams: number;
}

export const WORKOUT_CONFIGS: Record<WorkoutDayType, WorkoutConfig> = {
  rest: {
    type: 'rest',
    title: 'יום מנוחה והתאוששות',
    emoji: '🛋️',
    badge: 'מנוחה',
    defaultBurnedKcal: 0,
    description: 'מאזן בסיסי לשיקום השרירים',
    carbBoostGrams: 0,
    proteinBoostGrams: 0,
  },
  light_strength: {
    type: 'light_strength',
    title: 'אימון כוח / פלג גוף עליון',
    emoji: '🏋️',
    badge: 'אימון כוח',
    defaultBurnedKcal: 250,
    description: '+250 קק"ל ופחמימות למילוי מאגרים',
    carbBoostGrams: 40,
    proteinBoostGrams: 10,
  },
  heavy_strength: {
    type: 'heavy_strength',
    title: 'אימון כבד / רגליים / עצימות גבוהה',
    emoji: '🔥',
    badge: 'אימון כבד',
    defaultBurnedKcal: 450,
    description: '+450 קק"ל לבניית שריר ואנרגיה מקסימלית',
    carbBoostGrams: 75,
    proteinBoostGrams: 15,
  },
  cardio: {
    type: 'cardio',
    title: 'אירובי / ריצה / רכיבה / שחייה',
    emoji: '🏃',
    badge: 'אירובי',
    defaultBurnedKcal: 350,
    description: '+350 קק"ל ופחמימות זמינות',
    carbBoostGrams: 60,
    proteinBoostGrams: 5,
  },
  hiit: {
    type: 'hiit',
    title: 'אימון אינטרוולים / קרוספיט',
    emoji: '⚡',
    badge: 'HIIT',
    defaultBurnedKcal: 400,
    description: '+400 קק"ל לשריפת אנרגיה מוגברת',
    carbBoostGrams: 65,
    proteinBoostGrams: 10,
  },
  custom: {
    type: 'custom',
    title: 'אימון מותאם אישית',
    emoji: '🎯',
    badge: 'מותאם אישית',
    defaultBurnedKcal: 300,
    description: 'הזנת קלוריות שנשרפו באימון ידנית',
    carbBoostGrams: 50,
    proteinBoostGrams: 10,
  },
};

export const DEFAULT_WEEKLY_WORKOUT_SCHEDULE: Record<number, WorkoutDayType> = {
  0: 'light_strength', // ראשון: כוח
  1: 'rest',           // שני: מנוחה
  2: 'heavy_strength', // שלישי: כבד/רגליים
  3: 'rest',           // רביעי: מנוחה
  4: 'light_strength', // חמישי: כוח
  5: 'cardio',         // שישי: אירובי
  6: 'rest',           // שבת: מנוחה
};

export function getDailyAdjustedTargets(
  userProfile: UserProfile,
  dayLog?: DayLog,
  dateStr?: string
): {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  workoutType: WorkoutDayType;
  burnedCalories: number;
  workoutTitle: string;
  workoutEmoji: string;
  workoutBadge: string;
  isAdjusted: boolean;
  baseCalories: number;
} {
  const baseCalories = userProfile.dailyCalorieTarget || 2000;
  const baseProtein = userProfile.dailyProteinTarget || 140;
  const baseCarbs = userProfile.dailyCarbsTarget || 200;
  const baseFat = userProfile.dailyFatTarget || 65;

  let workoutType: WorkoutDayType = 'rest';

  // 1. If explicit in dayLog
  if (dayLog?.workoutType) {
    workoutType = dayLog.workoutType;
  } else if (dateStr) {
    // 2. Or fallback to weekly schedule
    const schedule = userProfile.weeklyWorkoutSchedule || DEFAULT_WEEKLY_WORKOUT_SCHEDULE;
    const dayOfWeek = new Date(dateStr + 'T12:00:00').getDay();
    if (schedule[dayOfWeek]) {
      workoutType = schedule[dayOfWeek];
    }
  }

  const config = WORKOUT_CONFIGS[workoutType] || WORKOUT_CONFIGS.rest;
  const burned =
    dayLog?.workoutBurnedCalories !== undefined
      ? dayLog.workoutBurnedCalories
      : config.defaultBurnedKcal;

  let targetCalories = baseCalories;
  let targetProtein = baseProtein;
  let targetCarbs = baseCarbs;
  let targetFat = baseFat;

  if (burned > 0) {
    targetCalories += burned;
    // 65% of additional calories from carbs, 20% protein, 15% fats
    targetCarbs += Math.round((burned * 0.65) / 4);
    targetProtein += Math.round((burned * 0.20) / 4);
    targetFat += Math.round((burned * 0.15) / 9);
  }

  return {
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFat,
    workoutType,
    burnedCalories: burned,
    workoutTitle: dayLog?.workoutTitle || config.title,
    workoutEmoji: config.emoji,
    workoutBadge: config.badge,
    isAdjusted: burned > 0,
    baseCalories,
  };
}

/**
 * מחשב את רצף הימים הרציפים שבהם המשתמש תיעד אוכל או מים
 */
export function calculateLoggingStreak(
  dayLogs: Record<string, DayLog>,
  todayDateStr: string
): number {
  const isLogged = (dStr: string) => {
    const log = dayLogs[dStr];
    if (!log) return false;
    const hasFood =
      (log.meals?.breakfast?.length || 0) > 0 ||
      (log.meals?.lunch?.length || 0) > 0 ||
      (log.meals?.dinner?.length || 0) > 0 ||
      (log.meals?.snack?.length || 0) > 0;
    const hasWater = (log.waterGlasses || 0) > 0;
    return hasFood || hasWater;
  };

  let streak = 0;
  const today = new Date(todayDateStr + 'T12:00:00');

  // Check if today has logs
  if (isLogged(todayDateStr)) {
    streak = 1;
    const cursor = new Date(today);
    cursor.setDate(cursor.getDate() - 1);
    while (true) {
      const dStr = cursor.toISOString().split('T')[0];
      if (isLogged(dStr)) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
  } else {
    // If today is not logged yet, check from yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];
    if (isLogged(yStr)) {
      streak = 1;
      const cursor = new Date(yesterday);
      cursor.setDate(cursor.getDate() - 1);
      while (true) {
        const dStr = cursor.toISOString().split('T')[0];
        if (isLogged(dStr)) {
          streak++;
          cursor.setDate(cursor.getDate() - 1);
        } else {
          break;
        }
      }
    } else {
      streak = 0;
    }
  }

  return streak;
}
