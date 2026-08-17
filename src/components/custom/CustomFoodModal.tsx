import React, { useState, useEffect } from 'react';
import { X, Check, Zap, Database, Edit2 } from 'lucide-react';
import type { FoodCategory, FoodItem, MealType } from '../../types';

interface CustomFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMealType?: MealType;
  editingFood?: FoodItem | null;
  onSaveCustomFood: (food: Omit<FoodItem, 'id'>) => void;
  onUpdateCustomFood?: (food: FoodItem) => void;
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
  editingFood = null,
  onSaveCustomFood,
  onUpdateCustomFood,
  onLogDirect,
}) => {
  // Mode: 'direct_log' (just calories & macros to today's diary) vs 'save_to_db' (create/edit reusable food)
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

  // Sync state when modal opens or editingFood changes
  useEffect(() => {
    if (isOpen) {
      if (editingFood) {
        setModalMode('save_to_db');
        setName(editingFood.name || '');
        setBrand(editingFood.brand || '');
        setCalories(String(editingFood.calories || ''));
        setProtein(String(editingFood.protein || ''));
        setCarbs(String(editingFood.carbs || ''));
        setFat(String(editingFood.fat || ''));
        setServingUnit(editingFood.servingUnit || 'מנה');
        setServingGrams(String(editingFood.servingGrams || 100));
        setCategory(editingFood.category || 'proteins');
      } else {
        setSelectedMealType(defaultMealType);
        setName('');
        setBrand('');
        setCalories('');
        setProtein('');
        setCarbs('');
        setFat('');
        setServingUnit('מנה');
        setServingGrams('100');
        setCategory('proteins');
        setSaveToDbAlso(false);
      }
    }
  }, [isOpen, defaultMealType, editingFood]);

  if (!isOpen) return null;

  const isEditing = !!editingFood;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numCalories = Number(calories);
    if (!calories || isNaN(numCalories) || numCalories < 0) {
      alert('נא להזין קלוריות חיוביות');
      return;
    }

    const numProtein = Number(protein) || 0;
    const numCarbs = Number(carbs) || 0;
    const numFat = Number(fat) || 0;
    const foodName = name.trim() || 'מנה אישית';

    if (isEditing && editingFood && onUpdateCustomFood) {
      onUpdateCustomFood({
        ...editingFood,
        name: foodName,
        brand: brand.trim() || undefined,
        calories: numCalories,
        protein: numProtein,
        carbs: numCarbs,
        fat: numFat,
        servingUnit: servingUnit.trim() || 'מנה',
        servingGrams: Math.max(1, Number(servingGrams) || 100),
        category,
      });
      onClose();
      return;
    }

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

    // Otherwise save new food to database
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

  const categories: { key: FoodCategory; label: string }[] = [
    { key: 'proteins', label: 'חלבונים' },
    { key: 'carbs', label: 'פחמימות' },
    { key: 'fats', label: 'שומנים' },
    { key: 'dairy', label: 'מוצרי חלב' },
    { key: 'fruits_veggies', label: 'פירות וירקות' },
    { key: 'snacks', label: 'נשנושים' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[480px] sm:max-w-xl h-[94dvh] sm:h-[88dvh] sm:max-h-[90dvh] bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-surface-container-high animate-modal-sheet modal-safe-bottom">
        
        {/* Header */}
        <div className="p-4 border-b border-surface-container-high bg-surface-container-low flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              {isEditing ? <Edit2 className="w-5 h-5" /> : modalMode === 'direct_log' ? <Zap className="w-5 h-5" /> : <Database className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-on-surface">
                {isEditing ? 'עריכת מאכל אישי' : modalMode === 'direct_log' ? 'הזנת קלוריות ומאקרו ישירה' : 'יצירת מאכל חדש למאגר'}
              </h3>
              <p className="text-[11px] text-outline">
                {isEditing
                  ? 'עדכון הערכים והשם של המאכל האישי שלך'
                  : modalMode === 'direct_log'
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

        {/* Mode Selector (When not editing an existing food) */}
        {!isEditing && (
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
              <span>הזנה ישירה להיום (ללא 100 גרם)</span>
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
              <span>יצירת מאכל למאגר (ל-100 גרם)</span>
            </button>
          </div>
        )}

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs">
          
          {/* Meal Type (Only for direct logging) */}
          {!isEditing && modalMode === 'direct_log' && (
            <div>
              <label className="text-[11px] font-bold text-outline block mb-1">לאיזו ארוחה להוסיף?</label>
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-surface-container-low rounded-2xl border border-surface-container-high">
                {(
                  [
                    { type: 'breakfast', label: 'בוקר' },
                    { type: 'lunch', label: 'צהריים' },
                    { type: 'dinner', label: 'ערב' },
                    { type: 'snack', label: 'נשנוש' },
                  ] as { type: MealType; label: string }[]
                ).map(({ type, label }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedMealType(type)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedMealType === type
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-outline hover:bg-surface-container'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Name & Brand */}
          <div className="space-y-2">
            <div>
              <label className="text-[11px] font-bold text-outline block mb-1">שם המאכל / המנה *</label>
              <input
                type="text"
                required
                placeholder="למשל: סלט קינואה ועוף, שייק חלבון, פסטה בולונז..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-container-lowest text-on-surface p-2.5 rounded-xl border border-surface-container-high text-xs outline-hidden focus:border-primary font-bold"
              />
            </div>

            {(modalMode === 'save_to_db' || isEditing) && (
              <div>
                <label className="text-[11px] font-bold text-outline block mb-1">מותג / יצרן (אופציונלי)</label>
                <input
                  type="text"
                  placeholder="למשל: תנובה, שטראוס, ביתי..."
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-surface-container-lowest text-on-surface p-2.5 rounded-xl border border-surface-container-high text-xs outline-hidden focus:border-primary"
                />
              </div>
            )}
          </div>

          {/* Calories (Primary Focus) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-outline">
                {modalMode === 'direct_log' ? 'סך קלוריות שנאכלו (קק"ל) *' : 'קלוריות ל-100 גרם (קק"ל) *'}
              </label>
              {modalMode === 'direct_log' && (
                <span className="text-[10px] text-primary font-bold">הזנה ישירה של המנה כולה</span>
              )}
            </div>
            <input
              type="number"
              min="0"
              required
              placeholder="למשל: 450"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full bg-surface-container-lowest text-on-surface text-base font-extrabold text-primary p-2.5 rounded-xl border border-surface-container-high outline-hidden focus:border-primary"
            />
          </div>

          {/* 3 Macro Values */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-bold text-outline block mb-1">חלבון (גרם)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="0"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full bg-surface-container-lowest text-on-surface font-bold p-2 rounded-xl border border-surface-container-high text-xs text-center"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-outline block mb-1">פחמימות (גרם)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="0"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="w-full bg-surface-container-lowest text-on-surface font-bold p-2 rounded-xl border border-surface-container-high text-xs text-center"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-outline block mb-1">שומן (גרם)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="0"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="w-full bg-surface-container-lowest text-on-surface font-bold p-2 rounded-xl border border-surface-container-high text-xs text-center"
              />
            </div>
          </div>

          {/* Serving Unit & Category for Database Mode */}
          {(modalMode === 'save_to_db' || isEditing) && (
            <div className="space-y-3 pt-1 border-t border-surface-container-high">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-outline block mb-1">תיאור יחידת מנה</label>
                  <input
                    type="text"
                    placeholder="למשל: פרוסה, כף, קציצה"
                    value={servingUnit}
                    onChange={(e) => setServingUnit(e.target.value)}
                    className="w-full bg-surface-container-lowest text-on-surface p-2 rounded-xl border border-surface-container-high text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-outline block mb-1">משקל מנה (גרם)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="100"
                    value={servingGrams}
                    onChange={(e) => setServingGrams(e.target.value)}
                    className="w-full bg-surface-container-lowest text-on-surface font-bold p-2 rounded-xl border border-surface-container-high text-xs text-center"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-outline block mb-1">קטגוריה במאגר</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setCategory(cat.key)}
                      className={`p-1.5 rounded-xl text-xs font-bold border transition-all ${
                        category === cat.key
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-surface-container text-outline border-surface-container-high'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Checkbox to also save in db (Direct log mode only) */}
          {!isEditing && modalMode === 'direct_log' && (
            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high/60 cursor-pointer">
              <input
                type="checkbox"
                checked={saveToDbAlso}
                onChange={(e) => setSaveToDbAlso(e.target.checked)}
                className="w-4 h-4 rounded text-primary border-surface-container-high focus:ring-primary"
              />
              <span className="text-[11px] text-on-surface font-medium">
                שמור מאכל זה גם במאגר המאכלים האישי שלי
              </span>
            </label>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary font-headline font-bold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>
              {isEditing
                ? 'שמור שינויים במאכל'
                : modalMode === 'direct_log'
                ? 'הוסף ישירות ליומן היום'
                : 'שמור מאכל חדש במאגר'}
            </span>
          </button>
        </form>

      </div>
    </div>
  );
};
