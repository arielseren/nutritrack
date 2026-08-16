import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Heart,
  Plus,
  QrCode,
  Utensils,
  PlusCircle,
  Check,
} from 'lucide-react';
import type { FoodCategory, FoodItem, MealType } from '../../types';
import { calculateItemNutrition } from '../../services/nutritionCalculator';

interface FoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodDatabase: FoodItem[];
  defaultMealType?: MealType;
  onLogFood: (mealType: MealType, food: FoodItem, grams: number, amount: number, unit: string) => void;
  onOpenBarcodeScanner: () => void;
  onOpenCustomFoodModal: () => void;
  onToggleFavorite: (foodId: string) => void;
}

export const FoodSearchModal: React.FC<FoodSearchModalProps> = ({
  isOpen,
  onClose,
  foodDatabase,
  defaultMealType = 'lunch',
  onLogFood,
  onOpenBarcodeScanner,
  onOpenCustomFoodModal,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>('all');
  const [selectedMealType, setSelectedMealType] = useState<MealType>(defaultMealType);

  // Selected food for portion calculation
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [amountValue, setAmountValue] = useState<number>(1);
  const [portionMode, setPortionMode] = useState<'standard' | 'grams'>('standard');
  const [customGrams, setCustomGrams] = useState<number>(100);

  // Sync defaultMealType when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedMealType(defaultMealType);
      setSelectedFood(null);
      setSearchQuery('');
    }
  }, [isOpen, defaultMealType]);

  const categories: { key: FoodCategory; label: string }[] = [
    { key: 'all', label: 'הכל' },
    { key: 'popular', label: 'פופולרי' },
    { key: 'proteins', label: 'חלבונים' },
    { key: 'carbs', label: 'פחמימות' },
    { key: 'fats', label: 'שומנים' },
    { key: 'dairy', label: 'מוצרי חלב' },
    { key: 'fruits_veggies', label: 'פירות וירקות' },
    { key: 'snacks', label: 'נשנושים' },
    { key: 'favorites', label: 'מועדפים ❤️' },
  ];

  const filteredFoods = useMemo(() => {
    return foodDatabase.filter((food) => {
      // Query filter
      const matchesQuery =
        searchQuery.trim() === '' ||
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (food.nameEn && food.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (food.brand && food.brand.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesQuery) return false;

      // Category filter
      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'popular') return food.isFavorite || food.calories > 0;
      if (selectedCategory === 'favorites') return !!food.isFavorite;
      return food.category === selectedCategory;
    });
  }, [foodDatabase, searchQuery, selectedCategory]);

  if (!isOpen) return null;

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setAmountValue(1);
    setPortionMode('standard');
    setCustomGrams(food.servingGrams);
  };

  const calculatedTotalGrams =
    portionMode === 'standard' && selectedFood
      ? Math.round(amountValue * selectedFood.servingGrams)
      : customGrams;

  const activeNutrition = selectedFood
    ? calculateItemNutrition(selectedFood, calculatedTotalGrams)
    : { calculatedCalories: 0, calculatedProtein: 0, calculatedCarbs: 0, calculatedFat: 0 };

  const handleConfirmLog = () => {
    if (!selectedFood) return;
    const unitLabel =
      portionMode === 'standard'
        ? selectedFood.servingUnit
        : 'גרם';

    onLogFood(
      selectedMealType,
      selectedFood,
      calculatedTotalGrams,
      portionMode === 'standard' ? amountValue : customGrams,
      unitLabel
    );
    setSelectedFood(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[480px] max-h-[92vh] bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-surface-container-high">
        {/* Header */}
        <div className="p-4 border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-on-surface">הוספת מזון ליומן</h3>
              <p className="text-xs text-outline">חפש מאגר עשיר, סרוק ברקוד או צור מאכל חדש</p>
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

        {/* Meal Selector Tabs - 4-Column Grid to ensure zero clipping on any phone */}
        <div className="px-4 pt-3 pb-1">
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
                className={`py-2 px-1 rounded-xl text-xs font-bold text-center transition-all ${
                  selectedMealType === type
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 pb-2 space-y-2.5">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חפש מאכל (חזה עוף, קוטג', אבוקדו)..."
              className="w-full bg-surface-container-low text-on-surface py-2.5 pr-10 pl-10 rounded-2xl border border-surface-container-high focus:ring-2 focus:ring-primary outline-none text-sm placeholder:text-outline/60 transition-all"
              autoFocus
            />
            <Search className="w-4 h-4 text-outline absolute right-3.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 text-outline hover:text-on-surface absolute left-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action pills: Barcode scanner + Custom Food */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenBarcodeScanner();
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-tertiary-container/30 hover:bg-tertiary-container/50 text-tertiary font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span>סרוק ברקוד</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenCustomFoodModal();
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-primary-container/20 hover:bg-primary-container/40 text-on-primary-container font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>צור מאכל מותאם</span>
            </button>
          </div>

          {/* Category Chips with smooth padding */}
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar py-1">
            {categories.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === key
                    ? 'bg-primary text-white font-bold shadow-xs'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Food List */}
        <div className="flex-1 overflow-y-auto p-4 pt-1 space-y-2 min-h-[220px]">
          {filteredFoods.length === 0 ? (
            <div className="py-12 text-center text-outline">
              <p className="text-sm font-semibold">לא נמצאו מאכלים התואמים לחיפוש</p>
              <button
                onClick={onOpenCustomFoodModal}
                className="mt-3 px-4 py-1.5 rounded-full bg-primary text-white text-xs font-bold hover:opacity-90 inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>צור מאכל זה עכשיו</span>
              </button>
            </div>
          ) : (
            filteredFoods.map((food) => {
              const isSelected = selectedFood?.id === food.id;
              return (
                <div
                  key={food.id}
                  onClick={() => handleSelectFood(food)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-primary-container/20 border-primary shadow-sm'
                      : 'bg-surface-container-lowest border-surface-container-high hover:bg-surface-container-low/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {food.imageUrl ? (
                      <img
                        src={food.imageUrl}
                        alt={food.name}
                        className="w-11 h-11 rounded-xl object-cover bg-surface-container flex-shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-outline flex-shrink-0">
                        <Utensils className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-on-surface truncate">{food.name}</h4>
                        {food.brand && (
                          <span className="text-[10px] px-1 py-0.2 rounded bg-surface-container text-outline truncate max-w-[80px]">
                            {food.brand}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-outline flex items-center gap-1.5 mt-0.5">
                        <span className="font-semibold text-tertiary">{food.calories} קק"ל / 100g</span>
                        <span>•</span>
                        <span>חלבון {food.protein}g</span>
                        <span>•</span>
                        <span>פחמימה {food.carbs}g</span>
                        <span>•</span>
                        <span>שומן {food.fat}g</span>
                      </div>
                      <span className="text-[10px] text-primary/80 block mt-0.5">
                        מנה מומלצת: {food.servingUnit}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(food.id);
                      }}
                      className={`p-1.5 rounded-lg active:scale-90 transition-all ${
                        food.isFavorite
                          ? 'text-tertiary fill-tertiary'
                          : 'text-outline hover:text-on-surface'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${food.isFavorite ? 'fill-tertiary' : ''}`} />
                    </button>

                    <div className="w-7 h-7 rounded-lg bg-primary-container/30 text-on-primary-container flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Portion Calculation Sheet when Food is Selected */}
        {selectedFood && (
          <div className="p-4 bg-surface-container-low border-t border-surface-container-high space-y-3 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-on-surface">הגדרת כמות:</span>
                <span className="text-xs text-primary font-bold mr-1">{selectedFood.name}</span>
              </div>
              <div className="flex rounded-lg bg-surface-container-high p-0.5 text-xs font-semibold">
                <button
                  onClick={() => setPortionMode('standard')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    portionMode === 'standard'
                      ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                      : 'text-outline'
                  }`}
                >
                  לפי יחידות
                </button>
                <button
                  onClick={() => setPortionMode('grams')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    portionMode === 'grams'
                      ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                      : 'text-outline'
                  }`}
                >
                  לפי גרמים
                </button>
              </div>
            </div>

            {/* Amount Adjuster */}
            {portionMode === 'standard' ? (
              <div className="flex items-center justify-between bg-surface-container-lowest p-2 rounded-xl border border-surface-container-high">
                <span className="text-xs text-outline">{selectedFood.servingUnit}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAmountValue(Math.max(0.5, amountValue - 0.5))}
                    className="w-8 h-8 rounded-lg bg-surface-container text-on-surface font-bold hover:bg-surface-container-high"
                  >
                    -
                  </button>
                  <span className="font-display font-bold text-base min-w-[36px] text-center">
                    {amountValue}
                  </span>
                  <button
                    onClick={() => setAmountValue(amountValue + 0.5)}
                    className="w-8 h-8 rounded-lg bg-surface-container text-on-surface font-bold hover:bg-surface-container-high"
                  >
                    +
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="2000"
                  value={customGrams === 0 ? '' : customGrams}
                  onChange={(e) => setCustomGrams(e.target.value === '' ? 0 : Number(e.target.value))}
                  placeholder="0"
                  className="w-24 p-2 text-center font-bold text-sm bg-surface-container-lowest rounded-xl border border-surface-container-high"
                />
                <span className="text-xs text-outline font-semibold">גרם סה"כ</span>
              </div>
            )}

            {/* Calculated Preview & Confirm Button */}
            <div className="flex items-center justify-between pt-1">
              <div className="text-xs">
                <span className="font-display font-extrabold text-base text-tertiary ml-1">
                  {activeNutrition.calculatedCalories} קק"ל
                </span>
                <span className="text-outline">
                  (חלבון: {activeNutrition.calculatedProtein}g | פחמ': {activeNutrition.calculatedCarbs}g | שומן: {activeNutrition.calculatedFat}g)
                </span>
              </div>

              <button
                onClick={handleConfirmLog}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-container text-white font-bold text-xs shadow-md shadow-primary/20 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>הוסף לארוחה</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
