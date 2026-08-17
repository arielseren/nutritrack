import type { MealType, FitnessGoal } from './index';

export type CoachPersonaId = 'male_itai' | 'female_maya';

export interface AIParsedFoodItem {
  name: string;
  amountDesc: string; // e.g. "1 חזה עוף בינוני", "כוס אורז"
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence?: number; // 0 - 100
  notes?: string;
}

export interface AIVisionAnalysisResult {
  title: string;
  summary: string;
  mealType: MealType;
  items: AIParsedFoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  confidenceScore: number;
  healthTip?: string;
  imageUrl?: string;
}

export interface AILabelOcrResult {
  productName: string;
  brand?: string;
  servingUnit: string;
  servingGrams: number;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  sugarsPer100g?: number;
  sodiumPer100g?: number;
  fiberPer100g?: number;
  category: 'proteins' | 'carbs' | 'fats' | 'dairy' | 'fruits_veggies' | 'snacks' | 'beverages' | 'popular';
  rawText?: string;
}

export interface AINLParseResult {
  mealType: MealType;
  rawInput: string;
  items: AIParsedFoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  explanation?: string;
}

export interface AIMenuSuggestion {
  id: string;
  title: string;
  description: string;
  mealType: MealType;
  prepTimeMinutes: number;
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: {
    name: string;
    amount: string;
    grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
  instructions: string[];
  tags: string[]; // e.g. "עתיר חלבון", "קל לעיכול", "מהיר הכנה"
}

export interface AIMealGenOptions {
  mode: 'macro_gap' | 'fridge_ingredients' | 'full_day_plan';
  mealType?: MealType;
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
  availableIngredients?: string[];
  dietaryPreferences?: string[]; // e.g. "כשר", "ללא לקטוז", "דל סודיום"
  maxPrepMinutes?: number;
  goal?: FitnessGoal;
}

export interface AICoachSuggestedAction {
  label: string;
  type: 'adjust_today_targets' | 'replace_meal' | 'add_logged_food' | 'open_recipe_generator' | 'switch_to_liquid_macros';
  payload?: any;
}

export interface AICoachMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO string or HH:mm
  suggestedActions?: AICoachSuggestedAction[];
  tags?: string[];
}

export interface AICoachMemory {
  preferences: string[]; // e.g. "מעדיף ארוחות ערב קלות", "אוהב שייקים"
  allergiesOrDislikes: string[]; // e.g. "לא אוכל דגים", "רגיש ללקטוז"
  satietyState?: 'bloated' | 'hungry' | 'normal' | 'low_appetite';
  userNotes: string[];
  lastConsultationTopic?: string;
  updatedAt?: string;
}

export interface AISettings {
  apiKey?: string;
  modelName?: string; // default: 'gemini-2.5-flash'
  useLocalFallbackOnly?: boolean;
}
