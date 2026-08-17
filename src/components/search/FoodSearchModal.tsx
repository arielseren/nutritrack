import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Heart,
  PlusCircle,
  Check,
  Zap,
  Sparkles,
  SunMedium,
  Sun,
  Moon,
  Apple,
  Hand,
  Flame,
  Utensils,
  Layers,
  Edit2,
  Trash2,
} from 'lucide-react';
import type { FoodCategory, FoodItem, MealType } from '../../types';
import { calculateItemNutrition } from '../../services/nutritionCalculator';

interface FoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodDatabase: FoodItem[];
  defaultMealType?: MealType;
  onLogFood: (mealType: MealType, food: FoodItem, grams: number, amount: number, unit: string) => void;
  onOpenCustomFoodModal: () => void;
  onEditCustomFood?: (food: FoodItem) => void;
  onDeleteCustomFood?: (foodId: string) => void;
  onToggleFavorite: (foodId: string) => void;
  onLogDirectMeal?: (
    mealType: MealType,
    name: string,
    calories: number,
    protein: number,
    carbs: number,
    fat: number,
    saveToDb?: boolean
  ) => void;
}

export const FoodSearchModal: React.FC<FoodSearchModalProps> = ({
  isOpen,
  onClose,
  foodDatabase,
  defaultMealType = 'lunch',
  onLogFood,
  onOpenCustomFoodModal,
  onEditCustomFood,
  onDeleteCustomFood,
  onToggleFavorite,
  onLogDirectMeal,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'direct'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>('all');
  const [selectedMealType, setSelectedMealType] = useState<MealType>(defaultMealType);

  // Selected food for portion calculation (Search mode)
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [amountValue, setAmountValue] = useState<number>(1);
  const [portionMode, setPortionMode] = useState<'standard' | 'grams'>('standard');
  const [customGrams, setCustomGrams] = useState<number>(100);
  const [showPortionGuide, setShowPortionGuide] = useState(false);

  // Direct Macros Form State
  const [directName, setDirectName] = useState('');
  const [directCalories, setDirectCalories] = useState('');
  const [directProtein, setDirectProtein] = useState('');
  const [directCarbs, setDirectCarbs] = useState('');
  const [directFat, setDirectFat] = useState('');
  const [directSaveToDb, setDirectSaveToDb] = useState(false);

  // Sync defaultMealType when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedMealType(defaultMealType);
      setSelectedFood(null);
      setSearchQuery('');
      setDirectName('');
      setDirectCalories('');
      setDirectProtein('');
      setDirectCarbs('');
      setDirectFat('');
    }
  }, [isOpen, defaultMealType]);

  const categories: { key: FoodCategory; label: string; icon?: React.ReactNode }[] = [
    { key: 'all', label: 'הכל', icon: <Layers className="w-3.5 h-3.5" /> },
    { key: 'popular', label: 'פופולרי', icon: <Flame className="w-3.5 h-3.5" /> },
    { key: 'proteins', label: 'חלבונים', icon: <Utensils className="w-3.5 h-3.5" /> },
    { key: 'carbs', label: 'פחמימות', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { key: 'fats', label: 'שומנים', icon: <Zap className="w-3.5 h-3.5" /> },
    { key: 'dairy', label: 'מוצרי חלב' },
    { key: 'fruits_veggies', label: 'פירות וירקות', icon: <Apple className="w-3.5 h-3.5" /> },
    { key: 'snacks', label: 'נשנושים' },
    { key: 'favorites', label: 'מועדפים', icon: <Heart className="w-3.5 h-3.5 text-error fill-current" /> },
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
    setCustomGrams(food.servingGrams || 100);
  };

  const calculatedTotalGrams =
    portionMode === 'standard'
      ? (selectedFood?.servingGrams || 100) * amountValue
      : customGrams;

  const activeNutrition = selectedFood
    ? calculateItemNutrition(selectedFood, calculatedTotalGrams)
    : { calculatedCalories: 0, calculatedProtein: 0, calculatedCarbs: 0, calculatedFat: 0 };

  const handleConfirmLog = () => {
    if (!selectedFood) return;
    const unitDesc =
      portionMode === 'standard'
        ? `${amountValue} ${selectedFood.servingUnit}`
        : `${customGrams} גרם`;

    onLogFood(selectedMealType, selectedFood, calculatedTotalGrams, amountValue, unitDesc);
    setSelectedFood(null);
    onClose();
  };

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numCal = Number(directCalories) || 0;
    if (numCal <= 0) {
      alert('נא להזין כמות קלוריות (קק"ל) חיובית');
      return;
    }

    if (onLogDirectMeal) {
      onLogDirectMeal(
        selectedMealType,
        directName.trim() || 'מנה אישית',
        numCal,
        Number(directProtein) || 0,
        Number(directCarbs) || 0,
        Number(directFat) || 0,
        directSaveToDb
      );
    }
    onClose();
  };

  const mealButtons = [
    { type: 'breakfast' as MealType, label: 'בוקר', icon: <SunMedium className="w-3.5 h-3.5" /> },
    { type: 'lunch' as MealType, label: 'צהריים', icon: <Sun className="w-3.5 h-3.5" /> },
    { type: 'dinner' as MealType, label: 'ערב', icon: <Moon className="w-3.5 h-3.5" /> },
    { type: 'snack' as MealType, label: 'נשנוש', icon: <Apple className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[480px] sm:max-w-xl max-h-[92dvh] bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-surface-container-high animate-modal-sheet">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-surface-container-high bg-surface-container-low flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-on-surface">הוספת מאכל ליומן</h3>
              <p className="text-[11px] text-outline">חיפוש במאגר, מדריך כמויות או הזנת קלוריות ישירה</p>
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

        {/* Top Tab Mode Switcher: Search vs Direct Entry */}
        <div className="p-2.5 bg-surface-container-low border-b border-surface-container-high flex gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'search'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container text-outline hover:text-on-surface'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>חיפוש במאגר</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'direct'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container text-outline hover:text-on-surface'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>הזנה ישירה (ללא 100 גרם)</span>
          </button>
        </div>

        {/* Meal Selector Tabs with Clean Icons */}
        <div className="px-4 pt-3 pb-1 flex-shrink-0">
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-surface-container-low rounded-2xl border border-surface-container-high">
            {mealButtons.map(({ type, label, icon }) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedMealType(type)}
                className={`py-2 px-1 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                  selectedMealType === type
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: DIRECT MACROS ENTRY (NO 100g REQUIREMENT) */}
        {/* ========================================================================= */}
        {activeTab === 'direct' && (
          <form onSubmit={handleDirectSubmit} className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs animate-in fade-in duration-150">
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs text-primary block">
                  תיעוד מהיר ללא צורך במאזניים וחישובים
                </span>
                <p className="text-[11px] text-outline mt-0.5">
                  הזן ישירות את סך הקלוריות והערכים של המנה/הארוחה והיא תתווסף מיד ליומן היום.
                </p>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-outline block mb-1">שם המנה או הארוחה (אופציונלי)</label>
              <input
                type="text"
                value={directName}
                onChange={(e) => setDirectName(e.target.value)}
                placeholder="לדוגמה: ארוחת צהריים במסעדה, שייק חלבון, סנדוויץ'..."
                className="w-full bg-surface-container-lowest text-on-surface p-2.5 rounded-xl border border-surface-container-high text-xs outline-hidden focus:border-primary"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-outline block mb-1">
                סך קלוריות (קק"ל) <span className="text-error">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={directCalories}
                onChange={(e) => setDirectCalories(e.target.value)}
                placeholder="למשל: 550"
                className="w-full bg-surface-container-lowest text-on-surface text-base font-extrabold text-primary p-2.5 rounded-xl border border-surface-container-high outline-hidden focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-outline block mb-1">חלבון (גרם)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={directProtein}
                  onChange={(e) => setDirectProtein(e.target.value)}
                  placeholder="0"
                  className="w-full bg-surface-container-lowest text-on-surface font-bold p-2 rounded-xl border border-surface-container-high text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-outline block mb-1">פחמימות (גרם)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={directCarbs}
                  onChange={(e) => setDirectCarbs(e.target.value)}
                  placeholder="0"
                  className="w-full bg-surface-container-lowest text-on-surface font-bold p-2 rounded-xl border border-surface-container-high text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-outline block mb-1">שומן (גרם)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={directFat}
                  onChange={(e) => setDirectFat(e.target.value)}
                  placeholder="0"
                  className="w-full bg-surface-container-lowest text-on-surface font-bold p-2 rounded-xl border border-surface-container-high text-xs"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high/60 cursor-pointer">
              <input
                type="checkbox"
                checked={directSaveToDb}
                onChange={(e) => setDirectSaveToDb(e.target.checked)}
                className="w-4 h-4 rounded text-primary border-surface-container-high focus:ring-primary"
              />
              <span className="text-[11px] text-on-surface font-medium">
                שמור מאכל זה גם במאגר המאכלים האישי שלי
              </span>
            </label>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary font-headline font-bold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>הוסף ישירות ליומן היום</span>
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SEARCH IN DATABASE */}
        {/* ========================================================================= */}
        {activeTab === 'search' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Search Input Bar */}
            <div className="p-4 pb-2 space-y-2 flex-shrink-0">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="חפש מאכל במאגר הישראלי..."
                    className="w-full bg-surface-container text-on-surface py-2.5 pr-10 pl-4 rounded-2xl border border-surface-container-high focus:border-primary text-xs outline-hidden transition-all"
                  />
                  <Search className="w-4 h-4 text-outline absolute right-3.5 top-1/2 -translate-y-1/2" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1 text-outline hover:text-on-surface absolute left-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onOpenCustomFoodModal}
                  className="p-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high text-primary border border-surface-container-high flex items-center gap-1 text-xs font-bold transition-all flex-shrink-0"
                  title="צור מאכל חדש"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">מאכל חדש</span>
                </button>
              </div>

              {/* Visual Portion Guide (Collapsible) */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowPortionGuide(!showPortionGuide)}
                  className="text-[11px] text-primary hover:underline font-bold flex items-center gap-1 py-0.5"
                >
                  <Hand className="w-3.5 h-3.5" />
                  <span>{showPortionGuide ? 'הסתר מדריך כמויות' : 'מדריך כמויות מהיר (שיטת כף היד)'}</span>
                </button>

                {showPortionGuide && (
                  <div className="mt-1.5 p-3 rounded-2xl bg-surface-container-low border border-surface-container-high text-[11px] space-y-1.5 animate-in fade-in duration-150">
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="p-2 rounded-xl bg-surface-container-lowest border border-surface-container-high/60">
                        <span className="font-bold text-primary block">כף יד פתוחה</span>
                        <span className="text-outline">מנת חלבון (בשר, עוף, קציצות ~ 120-150g)</span>
                      </div>
                      <div className="p-2 rounded-xl bg-surface-container-lowest border border-surface-container-high/60">
                        <span className="font-bold text-primary block">אגרוף סגור</span>
                        <span className="text-outline">מנת פחמימה (אורז, פתיתים, פסטה ~ כוס)</span>
                      </div>
                      <div className="p-2 rounded-xl bg-surface-container-lowest border border-surface-container-high/60">
                        <span className="font-bold text-primary block">שתי כפות ידיים</span>
                        <span className="text-outline">סלט וירקות מבושלים (~ 200g)</span>
                      </div>
                      <div className="p-2 rounded-xl bg-surface-container-lowest border border-surface-container-high/60">
                        <span className="font-bold text-primary block">אגודל מלא</span>
                        <span className="text-outline">שומן וממרח (כף טחינה, שמן זית ~ 15g)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Category Chips with Icons */}
              <div className="flex gap-1.5 overflow-x-auto hide-scrollbar py-1">
                {categories.map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
                      selectedCategory === key
                        ? 'bg-primary text-white font-bold shadow-xs'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {icon}
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Food List */}
            <div className="flex-1 overflow-y-auto p-4 pt-1 space-y-2 min-h-[160px]">
              {filteredFoods.length === 0 ? (
                <div className="py-12 text-center text-outline">
                  <p className="text-sm font-semibold">לא נמצאו מאכלים התואמים לחיפוש</p>
                  <button
                    onClick={() => setActiveTab('direct')}
                    className="mt-3 px-4 py-1.5 rounded-full bg-primary text-white text-xs font-bold hover:opacity-90 inline-flex items-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>הזן קלוריות ומאקרו ישירות</span>
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
                          ? 'border-primary bg-primary/10 shadow-sm'
                          : 'border-surface-container-high bg-surface-container-low hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-on-surface truncate">{food.name}</span>
                          {food.isCustom && (
                            <span className="text-[10px] bg-secondary/15 text-secondary px-1.5 py-0.5 rounded font-bold">
                              אישי
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-outline mt-0.5">
                          <span className="font-bold text-primary">{food.calories} קק"ל / 100g</span>
                          <span>•</span>
                          <span>{food.servingUnit}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-outline/80 mt-1">
                          <span>ח: {food.protein}g</span>
                          <span>•</span>
                          <span>פ: {food.carbs}g</span>
                          <span>•</span>
                          <span>ש: {food.fat}g</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {food.isCustom && (
                          <>
                            {onEditCustomFood && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditCustomFood(food);
                                }}
                                className="p-1.5 rounded-xl hover:bg-surface-container text-outline hover:text-primary transition-all"
                                title="ערוך מאכל אישי"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            {onDeleteCustomFood && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`האם אתה בטוח שברצונך למחוק את "${food.name}" ממאגר המאכלים שלך?`)) {
                                    onDeleteCustomFood(food.id);
                                    if (selectedFood?.id === food.id) {
                                      setSelectedFood(null);
                                    }
                                  }
                                }}
                                className="p-1.5 rounded-xl hover:bg-surface-container text-outline hover:text-error transition-all"
                                title="מחק מאכל אישי"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(food.id);
                          }}
                          className={`p-2 rounded-xl hover:bg-surface-container transition-all ${
                            food.isFavorite ? 'text-error' : 'text-outline hover:text-on-surface'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${food.isFavorite ? 'fill-current' : ''}`} />
                        </button>
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-primary bg-primary text-white'
                              : 'border-outline/40'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Selected Food Portion Drawer (Sticky Bottom with guaranteed visibility) */}
            {selectedFood && (
              <div className="p-4 pb-6 sm:pb-4 bg-surface-container-lowest border-t-2 border-primary/40 space-y-3 flex-shrink-0 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] z-30 animate-in slide-in-from-bottom duration-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-headline font-bold text-sm text-on-surface">
                      {selectedFood.name}
                    </h4>
                    <span className="text-xs text-outline">
                      {selectedFood.servingUnit} (~{selectedFood.servingGrams}g)
                    </span>
                  </div>
                  <div className="text-left">
                    <span className="font-headline text-lg font-extrabold text-primary block">
                      {activeNutrition.calculatedCalories} קק"ל
                    </span>
                    <span className="text-[10px] text-outline">
                      ח: {activeNutrition.calculatedProtein}g | פ: {activeNutrition.calculatedCarbs}g | ש: {activeNutrition.calculatedFat}g
                    </span>
                  </div>
                </div>

                {/* Portion Mode Selector */}
                <div className="flex items-center gap-2">
                  <div className="flex bg-surface-container p-1 rounded-xl border border-surface-container-high">
                    <button
                      type="button"
                      onClick={() => setPortionMode('standard')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        portionMode === 'standard'
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-outline hover:text-on-surface'
                      }`}
                    >
                      לפי יחידות
                    </button>
                    <button
                      type="button"
                      onClick={() => setPortionMode('grams')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        portionMode === 'grams'
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-outline hover:text-on-surface'
                      }`}
                    >
                      לפי גרמים
                    </button>
                  </div>

                  {/* Quantity Input */}
                  {portionMode === 'standard' ? (
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <button
                        type="button"
                        onClick={() => setAmountValue(Math.max(0.5, amountValue - 0.5))}
                        className="w-8 h-8 rounded-xl bg-surface-container hover:bg-surface-container-high font-bold text-base flex items-center justify-center active:scale-95"
                      >
                        -
                      </button>
                      <span className="font-headline font-bold text-sm w-8 text-center">
                        {amountValue}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAmountValue(amountValue + 0.5)}
                        className="w-8 h-8 rounded-xl bg-surface-container hover:bg-surface-container-high font-bold text-base flex items-center justify-center active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 flex-1 justify-end">
                      <input
                        type="number"
                        min="1"
                        step="5"
                        value={customGrams}
                        onChange={(e) => setCustomGrams(Math.max(1, Number(e.target.value) || 0))}
                        className="w-20 bg-surface-container-low text-on-surface text-center font-bold p-1.5 rounded-xl border border-surface-container-high text-xs"
                      />
                      <span className="text-xs text-outline font-bold">גרם</span>
                    </div>
                  )}
                </div>

                {/* Confirm Button - Guaranteed to be visible! */}
                <button
                  type="button"
                  onClick={handleConfirmLog}
                  className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-white font-headline font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>הוסף לארוחה זו ({activeNutrition.calculatedCalories} קק"ל)</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
