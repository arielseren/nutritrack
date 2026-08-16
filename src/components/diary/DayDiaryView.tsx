import React from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Calendar,
  Plus,
  Trash2,
  Utensils,
  Sun,
  Sunset,
  Cookie,
} from 'lucide-react';
import type { DayLog, MealType, UserProfile } from '../../types';
import {
  formatHebrewDate,
  calculateDayTotals,
  getTodayDateString,
} from '../../services/nutritionCalculator';

interface DayDiaryViewProps {
  currentDate: string;
  dayLog: DayLog;
  userProfile: UserProfile;
  onDateChange: (date: string) => void;
  onOpenDatePicker: () => void;
  onAddFoodToMeal: (mealType: MealType) => void;
  onDeleteItem: (mealType: MealType, logId: string) => void;
}

export const DayDiaryView: React.FC<DayDiaryViewProps> = ({
  currentDate,
  dayLog,
  userProfile,
  onDateChange,
  onOpenDatePicker,
  onAddFoodToMeal,
  onDeleteItem,
}) => {
  const totals = calculateDayTotals(dayLog);
  const remainingCalories = userProfile.dailyCalorieTarget - totals.totalCalories;

  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const isToday = currentDate === getTodayDateString();

  const mealsConfig: {
    type: MealType;
    title: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      type: 'breakfast',
      title: 'ארוחת בוקר',
      icon: <Sun className="w-4 h-4 text-tertiary" />,
      color: 'border-tertiary/20',
    },
    {
      type: 'lunch',
      title: 'ארוחת צהריים',
      icon: <Utensils className="w-4 h-4 text-primary" />,
      color: 'border-primary/20',
    },
    {
      type: 'dinner',
      title: 'ארוחת ערב',
      icon: <Sunset className="w-4 h-4 text-secondary" />,
      color: 'border-secondary/20',
    },
    {
      type: 'snack',
      title: 'נשנושים וביניים',
      icon: <Cookie className="w-4 h-4 text-tertiary" />,
      color: 'border-tertiary/20',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Date Switcher Bar */}
      <div className="p-3 bg-surface-container-low rounded-2xl border border-surface-container-high flex items-center justify-between">
        <button
          onClick={handlePrevDay}
          aria-label="יום קודם"
          className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant active:scale-95 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDatePicker}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-on-surface font-headline font-bold text-xs shadow-xs transition-all"
          >
            <Calendar className="w-4 h-4 text-primary" />
            <span>{formatHebrewDate(currentDate)}</span>
          </button>

          {!isToday && (
            <button
              onClick={() => onDateChange(getTodayDateString())}
              className="px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold transition-all"
            >
              היום
            </button>
          )}
        </div>

        <button
          onClick={handleNextDay}
          aria-label="יום הבא"
          className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant active:scale-95 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Daily Summary Banner */}
      <div className="p-4 rounded-3xl bg-surface-container-lowest border border-surface-container-high shadow-sm space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-outline">סיכום תזונה יומי</span>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              remainingCalories >= 0
                ? 'bg-primary/10 text-primary'
                : 'bg-error-container/40 text-error'
            }`}
          >
            {remainingCalories >= 0
              ? `נותרו ${remainingCalories} קק"ל`
              : `חריגה של ${Math.abs(remainingCalories)} קק"ל`}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1 text-center bg-surface-container-low p-2.5 rounded-2xl border border-surface-container-high text-xs">
          <div>
            <span className="text-[10px] text-outline block mb-0.5">קלוריות</span>
            <span className="font-headline font-extrabold text-tertiary">
              {totals.totalCalories}
            </span>
            <span className="text-[9px] text-outline block">/ {userProfile.dailyCalorieTarget}</span>
          </div>

          <div>
            <span className="text-[10px] text-outline block mb-0.5">חלבון</span>
            <span className="font-headline font-bold text-on-surface">
              {totals.totalProtein}g
            </span>
            <span className="text-[9px] text-outline block">/ {userProfile.dailyProteinTarget}g</span>
          </div>

          <div>
            <span className="text-[10px] text-outline block mb-0.5">פחמימות</span>
            <span className="font-headline font-bold text-on-surface">
              {totals.totalCarbs}g
            </span>
            <span className="text-[9px] text-outline block">/ {userProfile.dailyCarbsTarget}g</span>
          </div>

          <div>
            <span className="text-[10px] text-outline block mb-0.5">שומנים</span>
            <span className="font-headline font-bold text-on-surface">
              {totals.totalFat}g
            </span>
            <span className="text-[9px] text-outline block">/ {userProfile.dailyFatTarget}g</span>
          </div>
        </div>
      </div>

      {/* 4 Meal Cards */}
      <div className="space-y-3">
        {mealsConfig.map(({ type, title, icon }) => {
          const items = dayLog.meals[type] || [];
          const mealCalories = items.reduce(
            (acc, curr) => acc + (curr.calculatedCalories || curr.calories || 0),
            0
          );
          const mealProtein = items.reduce(
            (acc, curr) => acc + (curr.calculatedProtein || curr.protein || 0),
            0
          );

          return (
            <div
              key={type}
              className="rounded-3xl bg-surface-container-lowest border border-surface-container-high shadow-xs overflow-hidden transition-all"
            >
              {/* Meal Card Header */}
              <div className="p-3.5 flex items-center justify-between border-b border-surface-container-high/60 bg-surface-container-low/40">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-surface-container-lowest shadow-xs flex items-center justify-center">
                    {icon}
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-xs text-on-surface">{title}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-outline">
                      <span className="font-bold text-tertiary">{mealCalories} קק"ל</span>
                      <span>•</span>
                      <span>{mealProtein}g חלבון</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onAddFoodToMeal(type)}
                  className="px-2.5 py-1 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs flex items-center gap-1 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>הוסף</span>
                </button>
              </div>

              {/* Items List */}
              <div className="p-2 space-y-1.5">
                {items.length === 0 ? (
                  <div className="py-4 text-center">
                    <p className="text-[11px] text-outline">אין פריטים רשומים בארוחה זו</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.logId || item.id || `${item.name}-${Math.random()}`}
                      className="p-2.5 rounded-2xl bg-surface-container-low/60 hover:bg-surface-container-low border border-surface-container-high/50 flex items-center justify-between gap-2.5 transition-all text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-9 h-9 rounded-lg object-cover bg-surface-container flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-outline flex-shrink-0">
                            <Utensils className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-on-surface truncate text-xs">{item.name}</h4>
                          <div className="text-[11px] text-outline flex items-center gap-1.5 mt-0.5">
                            <span>
                              {item.amount} {item.unit} ({item.totalGrams || item.grams || 100}g)
                            </span>
                            <span>•</span>
                            <span className="font-bold text-tertiary">
                              {item.calculatedCalories || item.calories || 0} קק"ל
                            </span>
                            <span>•</span>
                            <span>{item.calculatedProtein || item.protein || 0}g חלבון</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteItem(type, item.logId || item.id || '')}
                        className="p-1.5 text-outline hover:text-error hover:bg-error-container/20 rounded-lg transition-all"
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
  );
};
