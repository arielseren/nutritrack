import React, { useState } from 'react';
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
  SlidersHorizontal,
} from 'lucide-react';
import type { DayLog, MealType, UserProfile, WorkoutDayType } from '../../types';
import {
  formatHebrewDate,
  calculateDayTotals,
  getTodayDateString,
  getDailyAdjustedTargets,
} from '../../services/nutritionCalculator';
import { WorkoutModeModal } from '../dashboard/WorkoutModeModal';

interface DayDiaryViewProps {
  currentDate: string;
  dayLog: DayLog;
  userProfile: UserProfile;
  onDateChange: (date: string) => void;
  onOpenDatePicker: () => void;
  onAddFoodToMeal: (mealType: MealType) => void;
  onDeleteItem: (mealType: MealType, logId: string) => void;
  onUpdateDayWorkout?: (
    date: string,
    workoutType: WorkoutDayType,
    burnedCalories?: number,
    title?: string,
    durationMinutes?: number
  ) => void;
}

export const DayDiaryView: React.FC<DayDiaryViewProps> = ({
  currentDate,
  dayLog,
  userProfile,
  onDateChange,
  onOpenDatePicker,
  onAddFoodToMeal,
  onDeleteItem,
  onUpdateDayWorkout,
}) => {
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const totals = calculateDayTotals(dayLog);
  const adjusted = getDailyAdjustedTargets(userProfile, dayLog, currentDate);
  const remainingCalories = adjusted.targetCalories - totals.totalCalories;

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

      {/* Daily Summary Banner & Workout Mode */}
      <div className="p-4 rounded-3xl bg-surface-container-lowest border border-surface-container-high shadow-sm space-y-2.5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-outline">סיכום יומי</span>
            {/* Workout badge button */}
            <button
              onClick={() => setIsWorkoutModalOpen(true)}
              className="px-2 py-0.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[10px] flex items-center gap-1 transition-all"
              title="שנה מצב אימון"
            >
              <span>{adjusted.workoutEmoji}</span>
              <span>{adjusted.workoutBadge}</span>
              {adjusted.isAdjusted && <span>(+{adjusted.burnedCalories})</span>}
              <SlidersHorizontal className="w-2.5 h-2.5 mr-0.5" />
            </button>
          </div>

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
            <span className="text-[9px] text-outline block">/ {adjusted.targetCalories}</span>
          </div>

          <div>
            <span className="text-[10px] text-outline block mb-0.5">חלבון</span>
            <span className="font-headline font-bold text-on-surface">
              {totals.totalProtein}g
            </span>
            <span className="text-[9px] text-outline block">/ {adjusted.targetProtein}g</span>
          </div>

          <div>
            <span className="text-[10px] text-outline block mb-0.5">פחמימות</span>
            <span className="font-headline font-bold text-on-surface">
              {totals.totalCarbs}g
            </span>
            <span className="text-[9px] text-outline block">/ {adjusted.targetCarbs}g</span>
          </div>

          <div>
            <span className="text-[10px] text-outline block mb-0.5">שומן</span>
            <span className="font-headline font-bold text-on-surface">
              {totals.totalFat}g
            </span>
            <span className="text-[9px] text-outline block">/ {adjusted.targetFat}g</span>
          </div>
        </div>
      </div>

      {/* 4 Meals Accordions/Cards */}
      <div className="space-y-3">
        {mealsConfig.map(({ type, title, icon }) => {
          const items = dayLog.meals[type] || [];
          const mealCalories = items.reduce((sum, i) => sum + (i.calculatedCalories || 0), 0);
          const mealProtein = items.reduce((sum, i) => sum + (i.calculatedProtein || 0), 0);
          const mealCarbs = items.reduce((sum, i) => sum + (i.calculatedCarbs || 0), 0);
          const mealFat = items.reduce((sum, i) => sum + (i.calculatedFat || 0), 0);

          return (
            <div
              key={type}
              className="rounded-3xl bg-surface-container-lowest border border-surface-container-high shadow-xs overflow-hidden"
            >
              {/* Meal Header */}
              <div className="p-3.5 flex items-center justify-between border-b border-surface-container-high/60 bg-surface-container-low/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center">
                    {icon}
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-xs text-on-surface">{title}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-outline mt-0.5">
                      <span>{Math.round(mealCalories)} קק"ל</span>
                      <span>•</span>
                      <span>ח: {Math.round(mealProtein * 10) / 10}g</span>
                      <span>•</span>
                      <span>פ: {Math.round(mealCarbs * 10) / 10}g</span>
                      <span>•</span>
                      <span>ש: {Math.round(mealFat * 10) / 10}g</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onAddFoodToMeal(type)}
                  className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs flex items-center gap-1 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>הוסף</span>
                </button>
              </div>

              {/* Meal Logged Items List */}
              <div className="p-2 divide-y divide-surface-container-high/40">
                {items.length === 0 ? (
                  <div className="py-4 text-center text-outline/60 text-xs">
                    טרם נרשמו מאכלים לארוחה זו
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.logId || item.id}
                      className="py-2.5 px-2 flex items-center justify-between gap-2 hover:bg-surface-container-low/40 rounded-xl transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between">
                          <span className="font-bold text-xs text-on-surface truncate">
                            {item.name}
                          </span>
                          <span className="font-bold text-xs text-primary flex-shrink-0">
                            {item.calculatedCalories} קק"ל
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-outline mt-0.5">
                          <span>
                            {item.amount} {item.unit} ({item.totalGrams}g)
                          </span>
                          <span>•</span>
                          <span>ח: {item.calculatedProtein}g</span>
                          <span>•</span>
                          <span>פ: {item.calculatedCarbs}g</span>
                          <span>•</span>
                          <span>ש: {item.calculatedFat}g</span>
                          {item.timestamp && (
                            <>
                              <span>•</span>
                              <span>{item.timestamp}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteItem(type, item.logId || item.id || '')}
                        aria-label="מחק פריט"
                        className="p-1.5 rounded-lg text-outline hover:bg-error-container/20 hover:text-error transition-all"
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

      {/* Workout Mode Customization Modal */}
      {onUpdateDayWorkout && (
        <WorkoutModeModal
          isOpen={isWorkoutModalOpen}
          onClose={() => setIsWorkoutModalOpen(false)}
          currentDate={currentDate}
          dayLog={dayLog}
          userProfile={userProfile}
          onSaveWorkout={onUpdateDayWorkout}
        />
      )}
    </div>
  );
};
