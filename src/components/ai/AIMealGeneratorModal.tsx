import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  ChefHat,
  Clock,
  Check,
  Utensils,
  SunMedium,
  Sun,
  Sunset,
  Apple,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { MealType, UserProfile, DayLog } from '../../types';
import type { AIMenuSuggestion, AIMealGenOptions, AIParsedFoodItem } from '../../types/ai';
import { AIService } from '../../services/aiService';
import { calculateDayTotals, getDailyAdjustedTargets } from '../../services/nutritionCalculator';

interface AIMealGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  dayLog: DayLog;
  apiKey?: string;
  defaultMealType?: MealType;
  onLogParsedItems: (mealType: MealType, items: AIParsedFoodItem[]) => void;
}

export const AIMealGeneratorModal: React.FC<AIMealGeneratorModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  dayLog,
  apiKey,
  defaultMealType = 'dinner',
  onLogParsedItems,
}) => {
  const [activeTab, setActiveTab] = useState<'macro_gap' | 'fridge_ingredients' | 'full_day'>('macro_gap');
  const [selectedMealType, setSelectedMealType] = useState<MealType>(defaultMealType);
  const [fridgeInput, setFridgeInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<AIMenuSuggestion[]>([]);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);

  const todayTotals = calculateDayTotals(dayLog);
  const adjusted = getDailyAdjustedTargets(userProfile, dayLog, dayLog.date);
  const remainingKcal = Math.max(0, adjusted.targetCalories - todayTotals.totalCalories);
  const remainingProtein = Math.max(0, adjusted.targetProtein - todayTotals.totalProtein);
  const remainingCarbs = Math.max(0, adjusted.targetCarbs - todayTotals.totalCarbs);
  const remainingFat = Math.max(0, adjusted.targetFat - todayTotals.totalFat);

  useEffect(() => {
    if (isOpen) {
      setSelectedMealType(defaultMealType);
      setFridgeInput('');
      setExpandedRecipeId(null);
      // Auto-trigger initial generation for macro gap
      handleGenerateSuggestions('macro_gap');
    }
  }, [isOpen, defaultMealType]);

  const handleGenerateSuggestions = async (mode: 'macro_gap' | 'fridge_ingredients' | 'full_day' = activeTab) => {
    setIsGenerating(true);
    setSuggestions([]);
    try {
      const options: AIMealGenOptions = {
        mode: mode === 'full_day' ? 'full_day_plan' : mode,
        mealType: selectedMealType,
        targetCalories: remainingKcal > 0 ? remainingKcal : 500,
        targetProtein: remainingProtein > 0 ? remainingProtein : 40,
        targetCarbs: remainingCarbs > 0 ? remainingCarbs : 50,
        targetFat: remainingFat > 0 ? remainingFat : 15,
        availableIngredients: fridgeInput
          ? fridgeInput.split(',').map((s) => s.trim()).filter(Boolean)
          : undefined,
        goal: userProfile.goal,
      };

      const results = await AIService.generateMealOrRecipe(
        options,
        {
          calories: remainingKcal,
          protein: remainingProtein,
          carbs: remainingCarbs,
          fat: remainingFat,
        },
        apiKey
      );

      setSuggestions(results);
      if (results.length > 0) {
        setExpandedRecipeId(results[0].id);
      }
    } catch (err) {
      console.error('Failed to generate suggestions:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogRecipe = (recipe: AIMenuSuggestion) => {
    const items: AIParsedFoodItem[] = recipe.ingredients.map((ing) => ({
      name: ing.name,
      amountDesc: ing.amount,
      grams: ing.grams,
      calories: ing.calories,
      protein: ing.protein,
      carbs: ing.carbs,
      fat: ing.fat,
      confidence: 98,
    }));

    onLogParsedItems(recipe.mealType || selectedMealType, items);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-surface rounded-3xl border border-surface-container-high shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-surface-container-high flex items-center justify-between bg-surface-container-low/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <ChefHat className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline font-black text-base sm:text-lg text-on-surface">
                  מחולל מתכונים וארוחות AI
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                  שף חכם
                </span>
              </div>
              <p className="text-xs text-outline mt-0.5">
                השלמת חוסרי מאקרו יומיים, מתכונים ממצרכים קיימים ותפריטים
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
            aria-label="סגור"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="px-4 sm:px-5 pt-3 pb-2 bg-surface-container-low/30 border-b border-surface-container-high">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface-container rounded-2xl">
            <button
              onClick={() => {
                setActiveTab('macro_gap');
                handleGenerateSuggestions('macro_gap');
              }}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'macro_gap'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface hover:text-primary'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>השלמת מאקרו להיום</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('fridge_ingredients');
              }}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'fridge_ingredients'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface hover:text-primary'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>מצרכים מהמקרר</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Target Meal Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-outline block">לאיזו ארוחה לרשום?</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { type: 'breakfast' as MealType, label: 'בוקר', icon: <SunMedium className="w-3.5 h-3.5" /> },
                { type: 'lunch' as MealType, label: 'צהריים', icon: <Sun className="w-3.5 h-3.5" /> },
                { type: 'dinner' as MealType, label: 'ערב', icon: <Sunset className="w-3.5 h-3.5" /> },
                { type: 'snack' as MealType, label: 'נשנוש', icon: <Apple className="w-3.5 h-3.5" /> },
              ].map((meal) => (
                <button
                  key={meal.type}
                  type="button"
                  onClick={() => setSelectedMealType(meal.type)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
                    selectedMealType === meal.type
                      ? 'bg-primary text-on-primary border-primary shadow-xs'
                      : 'bg-surface-container-low text-on-surface border-surface-container-high/60 hover:bg-surface-container'
                  }`}
                >
                  {meal.icon}
                  <span>{meal.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Current Daily Remaining Gap Status Card */}
          <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface">תמונת מצב יתרה להיום:</span>
              <span className="text-[11px] font-extrabold text-primary">יעד: {adjusted.targetCalories} קק"ל</span>
            </div>

            <div className="grid grid-cols-4 gap-1 text-center bg-surface-container-lowest/80 p-2 rounded-xl border border-surface-container-high text-xs">
              <div>
                <span className="text-[10px] text-outline block">נותרו קלוריות</span>
                <span className="font-headline font-black text-tertiary text-xs sm:text-sm">
                  {remainingKcal}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-outline block">נותר חלבון</span>
                <span className="font-headline font-black text-on-surface text-xs sm:text-sm">
                  {remainingProtein}g
                </span>
              </div>
              <div>
                <span className="text-[10px] text-outline block">נותרו פחמימות</span>
                <span className="font-headline font-black text-on-surface text-xs sm:text-sm">
                  {remainingCarbs}g
                </span>
              </div>
              <div>
                <span className="text-[10px] text-outline block">נותר שומן</span>
                <span className="font-headline font-black text-on-surface text-xs sm:text-sm">
                  {remainingFat}g
                </span>
              </div>
            </div>
          </div>

          {/* Fridge Ingredients Input (if in fridge mode) */}
          {activeTab === 'fridge_ingredients' && (
            <div className="space-y-2 animate-in fade-in">
              <label className="text-xs font-bold text-on-surface block">
                אילו מצרכים יש לך כרגע במקרר/מזווה?
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={fridgeInput}
                  onChange={(e) => setFridgeInput(e.target.value)}
                  placeholder="לדוגמה: ביצים, קוטג', טונה, לחם, מלפפון, שמן זית"
                  className="flex-1 p-3 rounded-2xl bg-surface-container-low border border-surface-container-high text-xs sm:text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => handleGenerateSuggestions('fridge_ingredients')}
                  className="p-3 rounded-2xl bg-primary text-on-primary font-bold text-xs shadow-xs active:scale-95 transition-all"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'צור מתכונים'}
                </button>
              </div>
            </div>
          )}

          {/* Refresh Generator Button */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-on-surface">3 הצעות מותאמות אישית:</span>
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => handleGenerateSuggestions()}
              className="text-xs font-bold text-primary flex items-center gap-1 hover:underline disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>הצע רעיונות נוספים</span>
            </button>
          </div>

          {/* Generating Spinner */}
          {isGenerating && (
            <div className="p-8 rounded-3xl bg-primary/5 border border-primary/20 flex flex-col items-center justify-center gap-2.5 text-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-xs sm:text-sm font-bold text-on-surface">
                השף הדיגיטלי בונה מתכונים מדויקים למאקרו שלך...
              </span>
              <span className="text-[11px] text-outline">מחשב כמויות ומשקלים מדויקים</span>
            </div>
          )}

          {/* Suggestions List */}
          {!isGenerating && suggestions.length > 0 && (
            <div className="space-y-3">
              {suggestions.map((recipe) => {
                const isExpanded = expandedRecipeId === recipe.id;
                return (
                  <div
                    key={recipe.id}
                    className="rounded-2xl sm:rounded-3xl bg-surface-container-low border border-surface-container-high/80 overflow-hidden shadow-xs transition-all"
                  >
                    {/* Recipe Header */}
                    <div
                      onClick={() => setExpandedRecipeId(isExpanded ? null : recipe.id)}
                      className="p-3.5 sm:p-4 cursor-pointer hover:bg-surface-container transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-headline font-black text-sm sm:text-base text-on-surface">
                            {recipe.title}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{recipe.prepTimeMinutes} דקות</span>
                          </span>
                        </div>

                        <p className="text-xs text-outline mt-1 line-clamp-1">{recipe.description}</p>

                        <div className="flex items-center gap-2 text-xs font-bold mt-2">
                          <span className="text-tertiary font-extrabold">{recipe.totalCalories} קק"ל</span>
                          <span className="text-outline">•</span>
                          <span className="text-primary font-bold">חלבון: {recipe.protein}g</span>
                          <span className="text-outline">•</span>
                          <span className="text-outline">פחמ': {recipe.carbs}g</span>
                          <span className="text-outline">•</span>
                          <span className="text-outline">שומן: {recipe.fat}g</span>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-surface-container text-on-surface-variant flex-shrink-0">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>

                    {/* Expanded Recipe Details */}
                    {isExpanded && (
                      <div className="p-3.5 sm:p-4 border-t border-surface-container-high bg-surface-container-lowest/80 space-y-3 animate-in fade-in">
                        {/* Ingredients */}
                        <div className="space-y-1.5">
                          <span className="text-xs font-bold text-on-surface block">מצרכים וכמויות:</span>
                          <div className="space-y-1">
                            {recipe.ingredients.map((ing, iIdx) => (
                              <div
                                key={iIdx}
                                className="p-2 rounded-xl bg-surface-container-low flex items-center justify-between text-xs"
                              >
                                <span className="font-bold text-on-surface">{ing.name}</span>
                                <span className="text-outline font-medium">{ing.amount} ({ing.calories} קק"ל)</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Instructions */}
                        <div className="space-y-1.5">
                          <span className="text-xs font-bold text-on-surface block">אופן ההכנה:</span>
                          <ol className="space-y-1 text-xs text-on-surface-variant list-decimal list-inside pr-1">
                            {recipe.instructions.map((step, sIdx) => (
                              <li key={sIdx} className="leading-relaxed">{step}</li>
                            ))}
                          </ol>
                        </div>

                        {/* Action Button: Log This Recipe */}
                        <button
                          type="button"
                          onClick={() => handleLogRecipe(recipe)}
                          className="w-full py-3 rounded-2xl bg-primary text-on-primary hover:bg-primary-dark font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all mt-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>הוסף מתכון זה ליומן הארוחות של היום 🚀</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-surface-container-high bg-surface-container-low/60 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-all"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};
