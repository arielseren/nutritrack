import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Heart,
  QrCode,
  PlusCircle,
  Check,
  Zap,
  Sparkles,
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
  onOpenBarcodeScanner,
  onOpenCustomFoodModal,
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

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cals = Number(directCalories);
    if (!directCalories || isNaN(cals) || cals < 0) return;

    const prot = Number(directProtein) || 0;
    const carbs = Number(directCarbs) || 0;
    const fat = Number(directFat) || 0;
    const foodName = directName.trim() || 'מנה מהירה';

    if (onLogDirectMeal) {
      onLogDirectMeal(
        selectedMealType,
        foodName,
        cals,
        prot,
        carbs,
        fat,
        directSaveToDb
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[480px] max-h-[92dvh] bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-surface-container-high animate-modal-sheet modal-safe-bottom">
        
        {/* Header */}
        <div className="p-4 border-b border-surface-container-high bg-surface-container-low flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              {activeTab === 'search' ? <Search className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-on-surface">
                {activeTab === 'search' ? 'הוספת מזון ליומן' : 'הזנת קלוריות ומאקרו ישירה'}
              </h3>
              <p className="text-xs text-outline">
                {activeTab === 'search'
                  ? 'חפש מאגר עשיר, סרוק ברקוד או הזן ישירות'
                  : 'הזן קלוריות, חלבון, פחמימה ושומן ישירות ללא חישוב 100 גרם'}
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

        {/* Top Tab Mode Switcher: Search vs Direct Entry */}
        <div className="p-2.5 bg-surface-container-low border-b border-surface-container-high flex gap-2">
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
            <span>⚡ הזנה ישירה (ללא 100 גרם)</span>
          </button>
        </div>

        {/* Meal Selector Tabs */}
        <div className="px-4 pt-3 pb-1">
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-surface-container-low rounded-2xl border border-surface-container-high">
            {(
              [
                { type: 'breakfast', label: 'בוקר 🌅' },
                { type: 'lunch', label: 'צהריים ☀️' },
                { type: 'dinner', label: 'ערב 🌙' },
                { type: 'snack', label: 'נשנוש 🍪' },
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

        {/* ========================================================================= */}
        {/* TAB 1: DIRECT MACROS ENTRY (NO 100g REQUIREMENT) */}
        {/* ========================================================================= */}
        {activeTab === 'direct' && (
          <form onSubmit={handleDirectSubmit} className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs animate-in fade-in duration-150">
            <div>
              <label className="font-bold text-on-surface block mb-1">
                שם המאכל / הארוחה <span className="text-outline font-normal">(אופציונלי)</span>
              </label>
              <input
                type="text"
                value={directName}
                onChange={(e) => setDirectName(e.target.value)}
                placeholder="לדוגמה: ארוחה בחוץ / שייק חלבון / מנה ביתית"
                className="w-full bg-surface-container-low text-on-surface p-2.5 rounded-xl border border-surface-container-high focus:border-primary outline-hidden text-xs"
                autoFocus
              />
            </div>

            {/* Macro Card */}
            <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container-high space-y-3">
              <div className="flex items-center gap-1.5 text-primary font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>ערכים תזונתיים של המנה:</span>
              </div>

              {/* Direct Calories */}
              <div>
                <label className="font-bold text-on-surface block mb-1">
                  קלוריות (קק"ל) <span className="text-primary">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={directCalories}
                  onChange={(e) => setDirectCalories(e.target.value)}
                  placeholder="למשל: 450"
                  className="w-full bg-surface-container-lowest text-tertiary font-extrabold text-base p-2.5 rounded-xl border border-surface-container-high focus:border-primary outline-hidden"
                />
              </div>

              {/* 3 Macros */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-outline block mb-1">חלבון (גרם)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={directProtein}
                    onChange={(e) => setDirectProtein(e.target.value)}
                    placeholder="0"
                    className="w-full bg-surface-container-lowest text-on-surface font-bold p-2 rounded-xl border border-surface-container-high focus:border-primary outline-hidden text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-outline block mb-1">פחמימות (גרם)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={directCarbs}
                    onChange={(e) => setDirectCarbs(e.target.value)}
                    placeholder="0"
                    className="w-full bg-surface-container-lowest text-on-surface font-bold p-2 rounded-xl border border-surface-container-high focus:border-primary outline-hidden text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-outline block mb-1">שומן (גרם)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={directFat}
                    onChange={(e) => setDirectFat(e.target.value)}
                    placeholder="0"
                    className="w-full bg-surface-container-lowest text-on-surface font-bold p-2 rounded-xl border border-surface-container-high focus:border-primary outline-hidden text-xs"
                  />
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high/60 cursor-pointer hover:bg-surface-container transition-all">
              <input
                type="checkbox"
                checked={directSaveToDb}
                onChange={(e) => setDirectSaveToDb(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <span className="text-xs text-on-surface font-semibold">
                שמור גם במאגר המאכלים שלי לשימוש חוזר
              </span>
            </label>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary font-headline font-bold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>הוסף ישירות ליומן היום 🎉</span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: DATABASE SEARCH & QUICK ACTIONS */}
        {/* ========================================================================= */}
        {activeTab === 'search' && (
          <>
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

              {/* Action pills: Barcode scanner + Direct entry switch + Custom Food */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenBarcodeScanner();
                  }}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-tertiary-container/30 hover:bg-tertiary-container/50 text-tertiary font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  <span>סרוק ברקוד</span>
                </button>

                <button
                  onClick={() => setActiveTab('direct')}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Zap className="w-4 h-4" />
                  <span>הזנה ישירה</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenCustomFoodModal();
                  }}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs flex items-center justify-center gap-1.5 border border-surface-container-high transition-all"
                >
                  <PlusCircle className="w-4 h-4 text-primary" />
                  <span>מאכל מותאם</span>
                </button>
              </div>

              {/* Smart Visual Portion Guide Banner */}
              <div className="rounded-2xl bg-surface-container-low border border-surface-container-high overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowPortionGuide(!showPortionGuide)}
                  className="w-full p-2.5 flex items-center justify-between text-xs font-bold text-on-surface hover:bg-surface-container transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🖐️</span>
                    <span className="text-[11px] text-primary">לא שוקל במאזניים? לחץ למדריך כמויות מהיר</span>
                  </div>
                  <span className="text-[10px] text-outline">{showPortionGuide ? 'סגור' : 'הצג מדריך'}</span>
                </button>

                {showPortionGuide && (
                  <div className="p-3 pt-1 border-t border-surface-container-high/60 bg-surface-container-lowest text-[11px] space-y-2 animate-in fade-in duration-150">
                    <p className="text-outline text-[10px] leading-relaxed">
                      אינך צריך משקל מטבח! השתמש בהערכות ויזואליות או בחר באפשרות <strong>"לפי יחידות"</strong>:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="p-2 rounded-xl bg-surface-container-low border border-surface-container-high/60">
                        <span className="font-bold text-primary block">🖐️ כף יד פתוחה</span>
                        <span className="text-outline">מנת חלבון (בשר, עוף, קציצות ~ 120-150g)</span>
                      </div>
                      <div className="p-2 rounded-xl bg-surface-container-low border border-surface-container-high/60">
                        <span className="font-bold text-primary block">✊ אגרוף סגור</span>
                        <span className="text-outline">מנת פחמימה (אורז, פתיתים, פסטה ~ כוס)</span>
                      </div>
                      <div className="p-2 rounded-xl bg-surface-container-low border border-surface-container-high/60">
                        <span className="font-bold text-primary block">🤲 שתי כפות ידיים</span>
                        <span className="text-outline">סלט וירקות מבושלים (~ 200g)</span>
                      </div>
                      <div className="p-2 rounded-xl bg-surface-container-low border border-surface-container-high/60">
                        <span className="font-bold text-primary block">👍 אגודל מלא</span>
                        <span className="text-outline">שומן וממרח (כף טחינה, שמן זית ~ 15g)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Category Chips */}
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

            {/* Selected Food Portion Drawer */}
            {selectedFood && (
              <div className="p-4 bg-surface-container-low border-t border-surface-container-high space-y-3 animate-in slide-in-from-bottom duration-200">
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
                        className="w-20 bg-surface-container-lowest text-on-surface text-center font-bold p-1.5 rounded-xl border border-surface-container-high text-xs"
                      />
                      <span className="text-xs text-outline font-bold">גרם</span>
                    </div>
                  )}
                </div>

                {/* Confirm Button */}
                <button
                  onClick={handleConfirmLog}
                  className="w-full py-3 rounded-2xl bg-primary hover:bg-primary/90 text-white font-headline font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>הוסף לארוחה זו ({activeNutrition.calculatedCalories} קק"ל)</span>
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};
