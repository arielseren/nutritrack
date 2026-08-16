import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Utensils,
  Sun,
  Sunset,
  Cookie,
  Sparkles,
  Search,
  Check,
  Flame,
} from 'lucide-react';
import type { MealPlanPreset, MealType, FitnessGoal, FoodItem } from '../../types';
import { calculateItemNutrition } from '../../services/nutritionCalculator';

interface CreateMealPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodDatabase: FoodItem[];
  onSavePlan: (newPlan: MealPlanPreset, andApply?: boolean) => void;
  existingPlan?: MealPlanPreset | null;
}

export const CreateMealPlanModal: React.FC<CreateMealPlanModalProps> = ({
  isOpen,
  onClose,
  foodDatabase,
  onSavePlan,
  existingPlan,
}) => {
  const [title, setTitle] = useState(existingPlan?.title || '');
  const [description, setDescription] = useState(existingPlan?.description || '');
  const [goal, setGoal] = useState<FitnessGoal>(existingPlan?.targetGoal || 'lose_weight');

  // Meals state
  const [meals, setMeals] = useState<
    Record<
      MealType,
      {
        foodId: string;
        name: string;
        amountDesc: string;
        grams: number;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      }[]
    >
  >(() => {
    if (existingPlan) {
      const initial: Record<MealType, any[]> = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: [],
      };
      existingPlan.meals.forEach((m) => {
        initial[m.mealType] = m.items;
      });
      return initial;
    }
    return {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };
  });

  // Food Picker Sub-State
  const [activePickerMeal, setActivePickerMeal] = useState<MealType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [selectedGrams, setSelectedGrams] = useState<number>(100);
  const [selectedAmount, setSelectedAmount] = useState<number>(1);

  if (!isOpen) return null;

  // Calculate live total macros of the plan
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  (['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).forEach((m) => {
    meals[m].forEach((item) => {
      totalCalories += item.calories;
      totalProtein += item.protein;
      totalCarbs += item.carbs;
      totalFat += item.fat;
    });
  });

  const handleAddItemToMeal = () => {
    if (!activePickerMeal || !selectedFood) return;

    const nutrition = calculateItemNutrition(selectedFood, selectedGrams);
    const newItem = {
      foodId: selectedFood.id,
      name: selectedFood.name,
      amountDesc: `${selectedAmount} ${selectedFood.servingUnit}`,
      grams: selectedGrams,
      calories: nutrition.calculatedCalories,
      protein: nutrition.calculatedProtein,
      carbs: nutrition.calculatedCarbs,
      fat: nutrition.calculatedFat,
    };

    setMeals((prev) => ({
      ...prev,
      [activePickerMeal]: [...prev[activePickerMeal], newItem],
    }));

    // Reset picker
    setSelectedFood(null);
    setActivePickerMeal(null);
    setSearchQuery('');
  };

  const handleRemoveItem = (mealType: MealType, index: number) => {
    setMeals((prev) => ({
      ...prev,
      [mealType]: prev[mealType].filter((_, i) => i !== index),
    }));
  };

  const handleSave = (andApply: boolean = false) => {
    if (!title.trim()) {
      alert('נא להזין שם לתפריט');
      return;
    }

    const badgeMap: Record<FitnessGoal, string> = {
      lose_weight: 'חיטוב מותאם',
      maintain: 'תפריט מאוזן',
      lean_bulk: 'מסה נקייה',
      gain_muscle: 'מסה וכוח',
    };

    const newPlan: MealPlanPreset = {
      id: existingPlan?.id || 'custom_plan_' + Date.now(),
      title: title.trim(),
      description: description.trim() || 'תפריט מותאם אישית שנבנה על ידי המשתמש',
      badge: badgeMap[goal],
      targetGoal: goal,
      totalCalories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fat: Math.round(totalFat),
      isCustom: true,
      createdAt: new Date().toISOString(),
      meals: [
        { mealType: 'breakfast', items: meals.breakfast },
        { mealType: 'lunch', items: meals.lunch },
        { mealType: 'dinner', items: meals.dinner },
        { mealType: 'snack', items: meals.snack },
      ],
    };

    onSavePlan(newPlan, andApply);
    onClose();
  };

  const mealsMeta: { type: MealType; title: string; icon: React.ReactNode; color: string }[] = [
    { type: 'breakfast', title: 'ארוחת בוקר', icon: <Sun className="w-4 h-4 text-tertiary" />, color: 'bg-tertiary/10 text-tertiary' },
    { type: 'lunch', title: 'ארוחת צהריים', icon: <Utensils className="w-4 h-4 text-primary" />, color: 'bg-primary/10 text-primary' },
    { type: 'dinner', title: 'ארוחת ערב', icon: <Sunset className="w-4 h-4 text-secondary" />, color: 'bg-secondary/10 text-secondary' },
    { type: 'snack', title: 'נשנושים וביניים', icon: <Cookie className="w-4 h-4 text-amber-500" />, color: 'bg-amber-500/10 text-amber-600' },
  ];

  const filteredFood = foodDatabase.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface rounded-3xl w-full max-w-[480px] max-h-[90dvh] flex flex-col shadow-2xl border border-outline-variant/30 overflow-hidden animate-modal-sheet">
        
        {/* Header */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-surface-container-high bg-surface-container-lowest flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-sm text-on-surface">
                {existingPlan ? 'עריכת תפריט מותאם' : 'בניית תפריט תזונה חדש'}
              </h2>
              <p className="text-[10px] text-outline">הרכב ארוחות, בחר כמויות וצפה בערכים בזמן אמת</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-outline hover:bg-surface-container-high transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Total Macro Summary Bar */}
        <div className="p-3 bg-surface-container-low border-b border-surface-container-high flex-shrink-0">
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="text-[11px] font-bold text-outline">סיכום ערכים מחושב לתפריט:</span>
            <span className="font-extrabold text-tertiary flex items-center gap-1 font-headline">
              <Flame className="w-3.5 h-3.5 fill-tertiary" />
              {Math.round(totalCalories)} קק"ל
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-1.5 rounded-xl bg-surface-container-lowest border border-surface-container-high">
              <span className="text-[10px] text-outline block">חלבון</span>
              <span className="font-bold text-on-surface">{Math.round(totalProtein)}g</span>
            </div>
            <div className="p-1.5 rounded-xl bg-surface-container-lowest border border-surface-container-high">
              <span className="text-[10px] text-outline block">פחמימות</span>
              <span className="font-bold text-on-surface">{Math.round(totalCarbs)}g</span>
            </div>
            <div className="p-1.5 rounded-xl bg-surface-container-lowest border border-surface-container-high">
              <span className="text-[10px] text-outline block">שומן</span>
              <span className="font-bold text-on-surface">{Math.round(totalFat)}g</span>
            </div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          
          {/* Plan Details Card */}
          <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container-high space-y-2.5 text-xs">
            <div>
              <label className="text-[11px] font-bold text-outline block mb-1">שם התפריט *</label>
              <input
                type="text"
                placeholder="לדוגמה: תפריט חיטוב ימי אימון, תפריט סופ״ש"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-hidden focus:border-primary font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-outline block mb-1">מטרת התפריט</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as any)}
                  className="w-full px-2.5 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface"
                >
                  <option value="lose_weight">חיטוב וירידה במשקל</option>
                  <option value="maintain">שמירה על משקל (ניטרלי)</option>
                  <option value="lean_bulk">עלייה נקייה במסת שריר (Lean Bulk)</option>
                  <option value="gain_muscle">עלייה במסת שריר ומסה</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-outline block mb-1">תיאור קצר</label>
                <input
                  type="text"
                  placeholder="אופציונלי (למשל: דגש על חלבון גבוה)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface"
                />
              </div>
            </div>
          </div>

          {/* 4 Meal Cards with Add Buttons */}
          <div className="space-y-3">
            {mealsMeta.map(({ type, title: mealTitle, icon, color }) => {
              const items = meals[type];
              const mealCal = items.reduce((acc, i) => acc + i.calories, 0);
              const mealProt = items.reduce((acc, i) => acc + i.protein, 0);

              return (
                <div
                  key={type}
                  className="rounded-2xl bg-surface-container-lowest border border-surface-container-high overflow-hidden text-xs"
                >
                  {/* Meal Header */}
                  <div className="p-3 flex items-center justify-between bg-surface-container-low/50 border-b border-surface-container-high/60">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${color}`}>{icon}</div>
                      <div>
                        <span className="font-bold text-on-surface block text-xs">{mealTitle}</span>
                        <span className="text-[10px] text-outline">
                          {mealCal} קק"ל • {mealProt}g חלבון
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActivePickerMeal(type);
                        setSelectedFood(null);
                        setSearchQuery('');
                      }}
                      className="px-2.5 py-1 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[11px] flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>הוסף מאכל</span>
                    </button>
                  </div>

                  {/* Items List */}
                  <div className="p-2 space-y-1.5">
                    {items.length === 0 ? (
                      <p className="text-center py-2 text-[11px] text-outline">טרם נוספו מאכלים לארוחה זו</p>
                    ) : (
                      items.map((item, idx) => (
                        <div
                          key={`${item.foodId}-${idx}`}
                          className="p-2 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-on-surface block truncate">{item.name}</span>
                            <span className="text-[10px] text-outline">
                              {item.amountDesc} ({item.grams}g) • <strong className="text-tertiary">{item.calories} קק"ל</strong> • {item.protein}g חלבון
                            </span>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(type, idx)}
                            className="p-1 text-outline hover:text-error transition-all"
                            title="הסר פריט"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* INLINE FOOD PICKER MODAL (When activePickerMeal is selected) */}
        {activePickerMeal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
            <div className="bg-surface rounded-3xl w-full max-w-[420px] max-h-[85vh] flex flex-col p-4 shadow-2xl border border-outline-variant/30 animate-pop-in">
              <div className="flex justify-between items-center pb-2 border-b border-surface-container-high mb-3">
                <h3 className="font-headline font-bold text-xs text-on-surface">
                  הוספת מאכל ל{mealsMeta.find((m) => m.type === activePickerMeal)?.title}
                </h3>
                <button onClick={() => setActivePickerMeal(null)} className="p-1 text-outline">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!selectedFood ? (
                <>
                  <div className="relative mb-3">
                    <input
                      type="text"
                      placeholder="חפש מאכל במאגר..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-hidden focus:border-primary"
                    />
                    <Search className="w-4 h-4 text-outline absolute right-2.5 top-2.5" />
                  </div>

                  <div className="overflow-y-auto space-y-1.5 flex-1 max-h-[300px]">
                    {filteredFood.slice(0, 15).map((food) => (
                      <div
                        key={food.id}
                        onClick={() => {
                          setSelectedFood(food);
                          setSelectedGrams(food.servingGrams || 100);
                          setSelectedAmount(1);
                        }}
                        className="p-2.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low border border-surface-container-high cursor-pointer flex items-center justify-between text-xs transition-all"
                      >
                        <div>
                          <span className="font-bold text-on-surface block">{food.name}</span>
                          <span className="text-[10px] text-outline">
                            {food.calories} קק"ל • {food.protein}g חלבון ל-100 גרם
                          </span>
                        </div>
                        <Plus className="w-4 h-4 text-primary" />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-2xl bg-surface-container-low border border-surface-container-high">
                    <span className="font-bold text-sm text-on-surface block mb-1">{selectedFood.name}</span>
                    <span className="text-[11px] text-outline block">
                      יחידת מנה: {selectedFood.servingUnit} ({selectedFood.servingGrams} גרם)
                    </span>
                  </div>

                    <div>
                      <label className="text-[11px] font-bold text-outline block mb-1">כמות גרמים</label>
                      <input
                        type="number"
                        value={selectedGrams === 0 ? '' : selectedGrams}
                        onChange={(e) => {
                          const g = e.target.value === '' ? 0 : Number(e.target.value);
                          setSelectedGrams(g);
                          setSelectedAmount(Math.round((g / (selectedFood.servingGrams || 100)) * 10) / 10);
                        }}
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface font-bold text-xs"
                      />
                    </div>

                  <div className="p-2.5 rounded-xl bg-primary/10 text-center text-xs font-bold text-primary">
                    ערך מחושב: {Math.round((selectedFood.calories * selectedGrams) / 100)} קק"ל •{' '}
                    {Math.round(((selectedFood.protein * selectedGrams) / 100) * 10) / 10}g חלבון
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setSelectedFood(null)}
                      className="flex-1 py-2 rounded-xl text-outline bg-surface-container hover:bg-surface-container-high font-bold text-xs"
                    >
                      חזור לחיפוש
                    </button>
                    <button
                      onClick={handleAddItemToMeal}
                      className="flex-1 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>הוסף לתפריט</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-3.5 bg-surface-container-lowest border-t border-surface-container-high flex items-center gap-2 flex-shrink-0 modal-safe-bottom">
          <button
            onClick={() => handleSave(false)}
            className="flex-1 py-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface font-headline font-bold text-xs transition-all border border-surface-container-high"
          >
            שמור תפריט
          </button>
          <button
            onClick={() => handleSave(true)}
            className="flex-1 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary font-headline font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>שמור והחל על היום</span>
          </button>
        </div>

      </div>
    </div>
  );
};
