import React, { useState } from 'react';
import { PlusCircle, X, Check } from 'lucide-react';
import type { FoodCategory, FoodItem } from '../../types';

interface CustomFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCustomFood: (food: Omit<FoodItem, 'id'>) => void;
}

export const CustomFoodModal: React.FC<CustomFoodModalProps> = ({
  isOpen,
  onClose,
  onSaveCustomFood,
}) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [servingUnit, setServingUnit] = useState('מנה (100 גרם)');
  const [servingGrams, setServingGrams] = useState('100');
  const [category, setCategory] = useState<FoodCategory>('proteins');
  const [barcode, setBarcode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !calories) return;

    onSaveCustomFood({
      name: name.trim(),
      brand: brand.trim() || undefined,
      calories: Math.max(0, Number(calories)),
      protein: Math.max(0, Number(protein) || 0),
      carbs: Math.max(0, Number(carbs) || 0),
      fat: Math.max(0, Number(fat) || 0),
      fiber: fiber ? Number(fiber) : undefined,
      servingUnit: servingUnit.trim() || 'מנה (100 גרם)',
      servingGrams: Math.max(1, Number(servingGrams) || 100),
      category,
      barcode: barcode.trim() || undefined,
      isCustom: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[480px] max-h-[92vh] bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-surface-container-high">
        {/* Header */}
        <div className="p-4 border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-on-surface">יצירת מאכל מותאם אישית</h3>
              <p className="text-xs text-outline">הזן את הערכים ל-100 גרם של המוצר</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs">
          <div>
            <label className="font-bold text-on-surface block mb-1">שם המאכל *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="לדוגמה: שייק חלבון בננה ביתי"
              className="w-full bg-surface-container-low text-on-surface p-2.5 rounded-xl border border-surface-container-high focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="font-bold text-on-surface block mb-1">מותג / יצרן (אופציונלי)</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="למשל: תנובה"
                className="w-full bg-surface-container-low text-on-surface p-2.5 rounded-xl border border-surface-container-high focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-on-surface block mb-1">קטגוריה</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="w-full bg-surface-container-low text-on-surface p-2.5 rounded-xl border border-surface-container-high focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="proteins">חלבונים</option>
                <option value="carbs">פחמימות</option>
                <option value="fats">שומנים</option>
                <option value="dairy">מוצרי חלב</option>
                <option value="fruits_veggies">פירות וירקות</option>
                <option value="snacks">נשנושים</option>
                <option value="beverages">משקאות</option>
              </select>
            </div>
          </div>

          {/* 4 Macros per 100g */}
          <div className="p-3 bg-surface-container-low rounded-2xl border border-surface-container-high space-y-2">
            <span className="font-bold text-on-surface block">ערכים תזונתיים ל-100 גרם:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-outline font-semibold block mb-0.5">קלוריות *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="0"
                  className="w-full bg-surface-container-lowest p-2 rounded-lg border border-surface-container-high text-center font-bold"
                />
              </div>
              <div>
                <label className="text-outline font-semibold block mb-0.5">חלבון (g)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  placeholder="0"
                  className="w-full bg-surface-container-lowest p-2 rounded-lg border border-surface-container-high text-center font-bold"
                />
              </div>
              <div>
                <label className="text-outline font-semibold block mb-0.5">פחמימה (g)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  placeholder="0"
                  className="w-full bg-surface-container-lowest p-2 rounded-lg border border-surface-container-high text-center font-bold"
                />
              </div>
              <div>
                <label className="text-outline font-semibold block mb-0.5">שומן (g)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  placeholder="0"
                  className="w-full bg-surface-container-lowest p-2 rounded-lg border border-surface-container-high text-center font-bold"
                />
              </div>
            </div>
          </div>

          {/* Serving Unit */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="font-bold text-on-surface block mb-1">תיאור מנת הגשה</label>
              <input
                type="text"
                value={servingUnit}
                onChange={(e) => setServingUnit(e.target.value)}
                placeholder="למשל: יחידה (150 גרם)"
                className="w-full bg-surface-container-low text-on-surface p-2.5 rounded-xl border border-surface-container-high"
              />
            </div>
            <div>
              <label className="font-bold text-on-surface block mb-1">משקל מנה (גרמים)</label>
              <input
                type="number"
                min="1"
                value={servingGrams}
                onChange={(e) => setServingGrams(e.target.value)}
                placeholder="100"
                className="w-full bg-surface-container-low text-on-surface p-2.5 rounded-xl border border-surface-container-high text-center font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="font-bold text-on-surface block mb-1">סיבים תזונתיים (g)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={fiber}
                onChange={(e) => setFiber(e.target.value)}
                placeholder="0"
                className="w-full bg-surface-container-low text-on-surface p-2.5 rounded-xl border border-surface-container-high"
              />
            </div>
            <div>
              <label className="font-bold text-on-surface block mb-1">ברקוד (אופציונלי לסריקה)</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="7290..."
                className="w-full bg-surface-container-low text-on-surface p-2.5 rounded-xl border border-surface-container-high"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-md shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 mt-2"
          >
            <Check className="w-4 h-4" />
            <span>שמור מאכל זה במאגר שלי</span>
          </button>
        </form>
      </div>
    </div>
  );
};
