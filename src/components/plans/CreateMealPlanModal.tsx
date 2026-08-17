import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  SunMedium,
  Sun,
  Moon,
  Apple,
  Sparkles,
  Search,
  Check,
  Flame,
  Zap,
} from 'lucide-react';
import type { MealPlanPreset, MealType, FitnessGoal, FoodItem } from '../../types';
import { calculateItemNutrition } from '../../services/nutritionCalculator';

interface CreateMealPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodDatabase: FoodItem[];
  onSavePlan: (newPlan: MealPlanPreset, andApply?: boolean) => void;
  onSaveCustomFoodToDb?: (food: Omit<FoodItem, 'id'>) => FoodItem;
  existingPlan?: MealPlanPreset | null;
}

export const CreateMealPlanModal: React.FC<CreateMealPlanModalProps> = ({
  isOpen,
  onClose,
  foodDatabase,
  onSavePlan,
  onSaveCustomFoodToDb,
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
  const [pickerTab, setPickerTab] = useState<'search' | 'direct'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [selectedGrams, setSelectedGrams] = useState<number>(100);
  const [selectedAmount, setSelectedAmount] = useState<number>(1);

  // Direct custom item form inside picker
  const [directName, setDirectName] = useState('');
  const [directCalories, setDirectCalories] = useState('');
  const [directProtein, setDirectProtein] = useState('');
  const [directCarbs, setDirectCarbs] = useState('');
  const [directFat, setDirectFat] = useState('');
  const [directAmountDesc, setDirectAmountDesc] = useState('1 מנה');
  const [directGrams, setDirectGrams] = useState('100');
  const [directSaveToDb, setDirectSaveToDb] = useState(false);

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
    const amountDesc =
      selectedAmount > 0 && selectedFood.servingUnit
        ? `${selectedAmount} ${selectedFood.servingUnit}`
        : `${selectedGrams} גרם`;

    const newItem = {
      foodId: selectedFood.id,
      name: selectedFood.name,
      amountDesc,
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

    setSelectedFood(null);
    setActivePickerMeal(null);
    setSearchQuery('');
  };

  const handleAddDirectItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePickerMeal) return;

    const cal = Number(directCalories) || 0;
    if (cal <= 0) {
      alert('נא להזין קלוריות חיוביות');
      return;
    }

    const prot = Number(directProtein) || 0;
    const carbs = Number(directCarbs) || 0;
    const fat = Number(directFat) || 0;
    const g = Number(directGrams) || 100;
    const name = directName.trim() || 'מאכל מותאם';
    const amountDesc = directAmountDesc.trim() || `${g} גרם`;

    let foodId = 'direct_' + Date.now();

    // Optionally save to personal database
    if (directSaveToDb && onSaveCustomFoodToDb) {
      const saved = onSaveCustomFoodToDb({
        name,
        calories: Math.round((cal / g) * 100),
        protein: Math.round((prot / g) * 100),
        carbs: Math.round((carbs / g) * 100),
        fat: Math.round((fat / g) * 100),
        servingUnit: amountDesc,
        servingGrams: g,
        category: 'proteins',
      });
      foodId = saved.id;
    }

    const newItem = {
      foodId,
      name,
      amountDesc,
      grams: g,
      calories: cal,
      protein: prot,
      carbs,
      fat,
    };

    setMeals((prev) => ({
      ...prev,
      [activePickerMeal]: [...prev[activePickerMeal], newItem],
    }));

    // Reset direct form
    setDirectName('');
    setDirectCalories('');
    setDirectProtein('');
    setDirectCarbs('');
    setDirectFat('');
    setDirectAmountDesc('1 מנה');
    setDirectGrams('100');
    setDirectSaveToDb(false);
    setActivePickerMeal(null);
  };

  const handleRemoveItem = (mealType: MealType, index: number) => {
    setMeals((prev) => ({
      ...prev,
      [mealType]: prev[mealType].filter((_, i) => i !== index),
    }));
  };

  const handleSave = (andApply = false) => {
    if (!title.trim()) {
      alert('נא להזין שם לתפריט');
      return;
    }

    const totalItems =
      meals.breakfast.length + meals.lunch.length + meals.dinner.length + meals.snack.length;
    if (totalItems === 0) {
      alert('נא להוסיף לפחות מאכל אחד לתפריט');
      return;
    }

    const newPlan: MealPlanPreset = {
      id: existingPlan?.id || 'custom_plan_' + Date.now(),
      title: title.trim(),
      description: description.trim() || 'תפריט מותאם אישית',
      badge: 'מותאם אישית',
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
    { type: 'breakfast', title: 'ארוחת בוקר', icon: <SunMedium className="w-4 h-4 text-tertiary" />, color: 'bg-tertiary/10 text-tertiary' },
    { type: 'lunch', title: 'ארוחת צהריים', icon: <Sun className="w-4 h-4 text-primary" />, color: 'bg-primary/10 text-primary' },
    { type: 'dinner', title: 'ארוחת ערב', icon: <Moon className="w-4 h-4 text-secondary" />, color: 'bg-secondary/10 text-secondary' },
    { type: 'snack', title: 'נשנושים וביניים', icon: <Apple className="w-4 h-4 text-amber-500" />, color: 'bg-amber-500/10 text-amber-600' },
  ];

  const filteredFood = foodDatabase.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface rounded-3xl w-full max-w-[480px] sm:max-w-2xl max-h-[92dvh] flex flex-col shadow-2xl border border-outline-variant/30 overflow-hidden animate-modal-sheet">
        
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-surface-container-high bg-surface-container-lowest flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center text-primary shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-base text-on-surface">
                {existingPlan ? 'עריכת תפריט מותאם אישית' : 'בונה תפריטי תזונה מותאמים אישית'}
              </h2>
              <p className="text-xs text-outline">הרכב ארוחות, הוסף מאכלים או הזן ערכים ישירות, וצפה בערכים בזמן אמת</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="סגור"
            className="p-2 rounded-xl text-outline hover:bg-surface-container hover:text-on-surface transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Total Macro Summary Bar */}
        <div className="p-3.5 bg-surface-container-low border-b border-surface-container-high flex-shrink-0">
          <div className="flex items-center justify-between mb-2 text-xs">
            <span className="text-xs font-bold text-outline">סך ערכים מחושב בזמן אמת לתפריט:</span>
            <span className="font-extrabold text-tertiary flex items-center gap-1.5 font-headline text-base">
              <Flame className="w-4 h-4 fill-tertiary" />
              {Math.round(totalCalories)} קק"ל
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-surface-container-lowest border border-surface-container-high shadow-xs">
              <span className="text-[11px] text-outline block">חלבון</span>
              <span className="font-bold text-sm text-on-surface">{Math.round(totalProtein)}g</span>
            </div>
            <div className="p-2 rounded-xl bg-surface-container-lowest border border-surface-container-high shadow-xs">
              <span className="text-[11px] text-outline block">פחמימות</span>
              <span className="font-bold text-sm text-on-surface">{Math.round(totalCarbs)}g</span>
            </div>
            <div className="p-2 rounded-xl bg-surface-container-lowest border border-surface-container-high shadow-xs">
              <span className="text-[11px] text-outline block">שומן</span>
              <span className="font-bold text-sm text-on-surface">{Math.round(totalFat)}g</span>
            </div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Plan Details Card */}
          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high space-y-3">
            <div>
              <label className="text-xs font-bold text-outline block mb-1">שם התפריט *</label>
              <input
                type="text"
                placeholder="לדוגמה: תפריט חיטוב ימי אימון, תפריט שבת"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-hidden focus:border-primary font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-outline block mb-1">מטרת התפריט</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface font-semibold"
                >
                  <option value="lose_weight">חיטוב וירידה במשקל</option>
                  <option value="maintain">שמירה על משקל (ניטרלי)</option>
                  <option value="lean_bulk">עלייה נקייה במסת שריר (Lean Bulk)</option>
                  <option value="gain_muscle">עלייה במסת שריר ומסה</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-outline block mb-1">תיאור קצר</label>
                <input
                  type="text"
                  placeholder="אופציונלי (למשל: דגש על חלבון גבוה)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface"
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
                  className="rounded-2xl bg-surface-container-lowest border border-surface-container-high overflow-hidden"
                >
                  {/* Meal Header */}
                  <div className="p-3.5 flex items-center justify-between bg-surface-container-low/50 border-b border-surface-container-high/60">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${color}`}>{icon}</div>
                      <div>
                        <span className="font-bold text-on-surface block text-xs">{mealTitle}</span>
                        <span className="text-[11px] text-outline">
                          {mealCal} קק"ל • {mealProt}g חלבון • {items.length} מאכלים
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActivePickerMeal(type);
                        setPickerTab('search');
                        setSelectedFood(null);
                        setSearchQuery('');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>הוסף מאכל</span>
                    </button>
                  </div>

                  {/* Items List */}
                  <div className="p-2.5 space-y-1.5">
                    {items.length === 0 ? (
                      <p className="text-center py-3 text-xs text-outline">טרם נוספו מאכלים לארוחה זו</p>
                    ) : (
                      items.map((item, idx) => (
                        <div
                          key={`${item.foodId}-${idx}`}
                          className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-xs text-on-surface block truncate">{item.name}</span>
                            <span className="text-[11px] text-outline">
                              {item.amountDesc} ({item.grams}g) • <strong className="text-primary">{item.calories} קק"ל</strong> • {item.protein}g חלבון • {item.carbs}g פחמימות • {item.fat}g שומן
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(type, idx)}
                            className="p-1.5 text-outline hover:text-error hover:bg-surface-container rounded-lg transition-all"
                            title="הסר פריט"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Footer Actions */}
        <div className="p-4 bg-surface-container-lowest border-t border-surface-container-high flex flex-col sm:flex-row gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="flex-1 py-3 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>שמור תפריט לרשימת התפריטים שלי</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave(true)}
            className="flex-1 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>שמור והחל עכשיו על יומן היום</span>
          </button>
        </div>

        {/* INLINE FOOD PICKER MODAL (Search database OR direct custom food creation on the fly) */}
        {activePickerMeal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs">
            <div className="bg-surface rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col p-4 shadow-2xl border border-outline-variant/30 animate-pop-in">
              <div className="flex justify-between items-center pb-2 border-b border-surface-container-high mb-3">
                <h3 className="font-headline font-bold text-sm text-on-surface">
                  הוספת מאכל ל{mealsMeta.find((m) => m.type === activePickerMeal)?.title}
                </h3>
                <button
                  onClick={() => setActivePickerMeal(null)}
                  className="p-1.5 rounded-xl text-outline hover:bg-surface-container"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mode Tabs: Search vs Direct Entry */}
              <div className="flex gap-1.5 p-1 bg-surface-container-low rounded-2xl border border-surface-container-high mb-3">
                <button
                  type="button"
                  onClick={() => setPickerTab('search')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    pickerTab === 'search'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>חיפוש במאגר</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPickerTab('direct')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    pickerTab === 'direct'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>יצירת מאכל / הזנה ישירה</span>
                </button>
              </div>

              {/* TAB 1: Search in DB */}
              {pickerTab === 'search' && (
                <>
                  {!selectedFood ? (
                    <>
                      <div className="relative mb-3">
                        <input
                          type="text"
                          placeholder="חפש מאכל במאגר..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-hidden focus:border-primary"
                        />
                        <Search className="w-4 h-4 text-outline absolute right-3 top-3" />
                      </div>

                      <div className="overflow-y-auto space-y-1.5 flex-1 max-h-[300px]">
                        {filteredFood.length === 0 ? (
                          <div className="text-center py-6 text-outline">
                            <p className="text-xs">לא נמצאו תוצאות</p>
                            <button
                              type="button"
                              onClick={() => setPickerTab('direct')}
                              className="mt-2 text-primary font-bold text-xs underline"
                            >
                              הזן את ערכי המאכל ישירות
                            </button>
                          </div>
                        ) : (
                          filteredFood.slice(0, 25).map((food) => (
                            <div
                              key={food.id}
                              onClick={() => {
                                setSelectedFood(food);
                                setSelectedGrams(food.servingGrams || 100);
                                setSelectedAmount(1);
                              }}
                              className="p-2.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container border border-surface-container-high/60 cursor-pointer flex justify-between items-center transition-all"
                            >
                              <div>
                                <span className="font-bold text-xs text-on-surface block">{food.name}</span>
                                <span className="text-[10px] text-outline">
                                  {food.calories} קק"ל / 100g • {food.servingUnit}
                                </span>
                              </div>
                              <Plus className="w-4 h-4 text-primary" />
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  ) : (
                    /* Food Portion Config inside picker */
                    <div className="space-y-3 animate-in fade-in duration-150 text-xs">
                      <div className="p-3 rounded-2xl bg-surface-container-lowest border border-surface-container-high">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-sm text-on-surface block">{selectedFood.name}</span>
                            <span className="text-[11px] text-outline">
                              {selectedFood.calories} קק"ל ל-100 גרם ({selectedFood.servingUnit})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedFood(null)}
                            className="text-xs text-outline hover:text-on-surface underline"
                          >
                            החלף מאכל
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-bold text-outline block mb-1">
                            כמות ({selectedFood.servingUnit})
                          </label>
                          <input
                            type="number"
                            min="0.25"
                            step="0.5"
                            value={selectedAmount}
                            onChange={(e) => {
                              const amt = Number(e.target.value) || 1;
                              setSelectedAmount(amt);
                              setSelectedGrams(Math.round(amt * (selectedFood.servingGrams || 100)));
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs text-on-surface font-bold text-center"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-outline block mb-1">משקל בגרמים</label>
                          <input
                            type="number"
                            min="1"
                            value={selectedGrams}
                            onChange={(e) => setSelectedGrams(Number(e.target.value) || 0)}
                            className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs text-on-surface font-bold text-center"
                          />
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-surface-container-low text-center">
                        <span className="text-xs text-outline">סה"כ מחושב לפריט: </span>
                        <strong className="text-primary text-sm font-headline">
                          {calculateItemNutrition(selectedFood, selectedGrams).calculatedCalories} קק"ל
                        </strong>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddItemToMeal}
                        className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>הוסף לארוחה</span>
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* TAB 2: Direct Custom Food Entry on the Fly */}
              {pickerTab === 'direct' && (
                <form onSubmit={handleAddDirectItemSubmit} className="space-y-2.5 overflow-y-auto max-h-[350px] text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-outline block mb-1">שם המאכל *</label>
                    <input
                      type="text"
                      required
                      placeholder="למשל: סלט חזה עוף עם קינואה, שייק ביתי..."
                      value={directName}
                      onChange={(e) => setDirectName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-outline block mb-1">קלוריות (קק"ל) *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        placeholder="350"
                        value={directCalories}
                        onChange={(e) => setDirectCalories(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-primary font-extrabold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-outline block mb-1">תיאור מנה</label>
                      <input
                        type="text"
                        placeholder="למשל: 1 צלחת / 1 כוס"
                        value={directAmountDesc}
                        onChange={(e) => setDirectAmountDesc(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-outline block mb-1">חלבון (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={directProtein}
                        onChange={(e) => setDirectProtein(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface font-bold text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-outline block mb-1">פחמימות (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={directCarbs}
                        onChange={(e) => setDirectCarbs(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface font-bold text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-outline block mb-1">שומן (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={directFat}
                        onChange={(e) => setDirectFat(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface font-bold text-center"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-surface-container-low border border-surface-container-high/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={directSaveToDb}
                      onChange={(e) => setDirectSaveToDb(e.target.checked)}
                      className="w-4 h-4 rounded text-primary border-surface-container-high focus:ring-primary"
                    />
                    <span className="text-[11px] text-on-surface">שמור מאכל זה גם במאגר המאכלים האישי שלי</span>
                  </label>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>הוסף לארוחה זו בתפריט</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
