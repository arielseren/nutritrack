import React, { useState } from 'react';
import { X, Check, Zap, Sparkles, Database } from 'lucide-react';
import type { FoodCategory, FoodItem, MealType } from '../../types';

interface CustomFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMealType?: MealType;
  onSaveCustomFood: (food: Omit<FoodItem, 'id'>) => void;
  onLogDirect?: (
    mealType: MealType,
    name: string,
    calories: number,
    protein: number,
    carbs: number,
    fat: number,
    saveToDb?: boolean
  ) => void;
}

export const CustomFoodModal: React.FC<CustomFoodModalProps> = ({
  isOpen,
  onClose,
  defaultMealType = 'lunch',
  onSaveCustomFood,
  onLogDirect,
}) => {
  // Mode: 'direct_log' (just calories & macros to today's diary) vs 'save_to_db' (create reusable food)
  const [modalMode, setModalMode] = useState<'direct_log' | 'save_to_db'>('direct_log');

  // Fields
  const [selectedMealType, setSelectedMealType] = useState<MealType>(defaultMealType);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [servingUnit, setServingUnit] = useState('מנה');
  const [servingGrams, setServingGrams] = useState('100');
  const [category, setCategory] = useState<FoodCategory>('proteins');
  const [saveToDbAlso, setSaveToDbAlso] = useState(false);

  // Sync defaultMealType on open
  React.useEffect(() => {
    if (isOpen) {
      setSelectedMealType(defaultMealType);
    }
  }, [isOpen, defaultMealType]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numCalories = Number(calories);
    if (!calories || isNaN(numCalories) || numCalories < 0) return;

    const numProtein = Number(protein) || 0;
    const numCarbs = Number(carbs) || 0;
    const numFat = Number(fat) || 0;
    const foodName = name.trim() || 'מנה מהירה';

    if (modalMode === 'direct_log' && onLogDirect) {
      onLogDirect(
        selectedMealType,
        foodName,
        numCalories,
        numProtein,
        numCarbs,
        numFat,
        saveToDbAlso
      );
      onClose();
      return;
    }

    // Otherwise save to database
    onSaveCustomFood({
      name: foodName,
      brand: brand.trim() || undefined,
      calories: numCalories,
      protein: numProtein,
      carbs: numCarbs,
      fat: numFat,
      servingUnit: servingUnit.trim() || 'מנה',
      servingGrams: Math.max(1, Number(servingGrams) || 100),
      category,
      isCustom: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[480px] max-h-[92dvh] bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-surface-container-high animate-modal-sheet modal-safe-bottom">
        
        {/* Header */}
        <div className="p-4 border-b border-surface-container-high bg-surface-container-low flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              {modalMode === 'direct_log' ? <Zap className="w-5 h-5" /> : <Database className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-on-surface">
                {modalMode === 'direct_log' ? 'הזנת קלוריות ומאקרו ישירה' : 'יצירת מאכל חדש למאגר'}
              </h3>
              <p className="text-[11px] text-outline">
                {modalMode === 'direct_log'
                  ? 'הזן את הערכים הכוללים של מה שאכלת והוסף ישירות ליומן'
                  : 'הגדרת מאכל מותאם אישית שיישמר במאגר לשימוש חוזר'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="סגור"
            className="p-1.5 rounded-full hover:bg-surface-container text-outline hover:text-on-surface transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Direct Log vs Save to DB */}
        <div className="p-3 bg-surface-container-low border-b border-surface-container-high flex gap-2">
          <button
            type="button"
            onClick={() => setModalMode('direct_log')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              modalMode === 'direct_log'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container text-outline hover:text-on-surface'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>הזנה ישירה ליומן</span>
          </button>

          <button
            type="button"
            onClick={() => setModalMode('save_to_db')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              modalMode === 'save_to_db'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container text-outline hover:text-on-surface'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>שמירה למאגר המאכלים</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs">
          
          {/* Meal Selector (If Direct Log) */}
          {modalMode === 'direct_log' && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-outline block">לאיזו ארוחה להוסיף?</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { type: 'breakfast' as MealType, label: 'בוקר 🌅' },
                  { type: 'lunch' as MealType, label: 'צהריים ☀️' },
                  { type: 'dinner' as MealType, label: 'ערב 🌙' },
                  { type: 'snack' as MealType, label: 'נשנוש 🍪' },
                ].map((m) => (
                  <button
                    key={m.type}
                    type="button"
                    onClick={() => setSelectedMealType(m.type)}
                    className={`py-2 px-1 rounded-xl text-center font-bold text-xs transition-all ${
                      selectedMealType === m.type
                        ? 'bg-primary/15 text-primary border border-primary font-extrabold'
                        : 'bg-surface-container-low text-outline border border-surface-container-high/60 hover:bg-surface-container'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="font-bold text-on-surface block mb-1">
              שם המאכל / הארוחה {modalMode === 'direct_log' && <span className="text-outline font-normal">(אופציונלי)</span>}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={modalMode === 'direct_log' ? 'למשל: ארוחה בחוץ / פיצה / קערת שייק' : 'למשל: עוגת גבינה חלבון'}
              className="w-full bg-surface-container-low text-on-surface p-2.5 rounded-xl border border-surface-container-high focus:border-primary outline-hidden text-xs"
            />
          </div>

          {/* Primary Macro Inputs Box */}
          <div className="p-3 rounded-2xl bg-surface-container-low border border-surface-container-high space-y-3">
            <div className="flex items-center gap-1 text-primary font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ערכים תזונתיים של המנה:</span>
            </div>

            {/* Direct Calories */}
            <div>
              <label className="font-bold text-on-surface block mb-1">
                סה"כ קלוריות (קק"ל) <span className="text-primary">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="any"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="למשל: 450"
                className="w-full bg-surface-container-lowest text-tertiary font-bold text-base p-2.5 rounded-xl border border-surface-container-high focus:border-primary outline-hidden"
              />
            </div>

            {/* 3 Macros Row */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-bold text-outline block mb-1">
                  חלבון (גרם)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  placeholder="0"
                  className="w-full bg-surface-container-lowest text-on-surface font-bold p-2 rounded-xl border border-surface-container-high focus:border-primary outline-hidden text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-outline block mb-1">
                  פחמימות (גרם)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  placeholder="0"
                  className="w-full bg-surface-container-lowest text-on-surface font-bold p-2 rounded-xl border border-surface-container-high focus:border-primary outline-hidden text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-outline block mb-1">
                  שומן (גרם)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  placeholder="0"
                  className="w-full bg-surface-container-lowest text-on-surface font-bold p-2 rounded-xl border border-surface-container-high focus:border-primary outline-hidden text-xs"
                />
              </div>
            </div>
          </div>

          {/* Direct log: Save to Database checkbox */}
          {modalMode === 'direct_log' && (
            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high/60 cursor-pointer hover:bg-surface-container transition-all">
              <input
                type="checkbox"
                checked={saveToDbAlso}
                onChange={(e) => setSaveToDbAlso(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <span className="text-xs text-on-surface font-semibold">
                שמור מאכל זה גם במאגר שלי לשימוש מהיר בעתיד
              </span>
            </label>
          )}

          {/* Database Mode Extra Fields */}
          {modalMode === 'save_to_db' && (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-on-surface block mb-1">מותג / יצרן (אופציונלי)</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="למשל: תנובה / ביתי"
                    className="w-full bg-surface-container-low text-on-surface p-2 rounded-xl border border-surface-container-high text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-on-surface block mb-1">משקל מנה בגרמים</label>
                  <input
                    type="number"
                    min="1"
                    value={servingGrams}
                    onChange={(e) => setServingGrams(e.target.value)}
                    placeholder="100"
                    className="w-full bg-surface-container-low text-on-surface p-2 rounded-xl border border-surface-container-high text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-on-surface block mb-1">תיאור מנה / יחידה</label>
                  <input
                    type="text"
                    value={servingUnit}
                    onChange={(e) => setServingUnit(e.target.value)}
                    placeholder="למשל: פרוסה / מנה"
                    className="w-full bg-surface-container-low text-on-surface p-2 rounded-xl border border-surface-container-high text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-on-surface block mb-1">קטגוריה</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FoodCategory)}
                    className="w-full bg-surface-container-low text-on-surface p-2 rounded-xl border border-surface-container-high text-xs font-semibold"
                  >
                    <option value="proteins">חלבונים</option>
                    <option value="carbs">פחמימות</option>
                    <option value="fats">שומנים</option>
                    <option value="dairy">מוצרי חלב</option>
                    <option value="fruits_veggies">פירות וירקות</option>
                    <option value="snacks">נשנושים</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary font-headline font-bold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              {modalMode === 'direct_log' ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>הוסף ישירות ליומן היום 🎉</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>שמור מאכל במאגר</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
