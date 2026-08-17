import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Calendar,
  Plus,
  Trash2,
  SunMedium,
  Sun,
  Sunset,
  Apple,
  SlidersHorizontal,
  Dumbbell,
  Flame,
  Activity,
  Zap,
  BedDouble,
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

  const getWorkoutIcon = (type: WorkoutDayType) => {
    switch (type) {
      case 'light_strength':
        return <Dumbbell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case 'heavy_strength':
        return <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case 'cardio':
        return <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case 'hiit':
        return <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case 'custom':
        return <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case 'rest':
      default:
        return <BedDouble className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    }
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
      icon: <SunMedium className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-tertiary" />,
      color: 'border-tertiary/20',
    },
    {
      type: 'lunch',
      title: 'ארוחת צהריים',
      icon: <Sun className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-primary" />,
      color: 'border-primary/20',
    },
    {
      type: 'dinner',
      title: 'ארוחת ערב',
      icon: <Sunset className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-secondary" />,
      color: 'border-secondary/20',
    },
    {
      type: 'snack',
      title: 'נשנושים וביניים',
      icon: <Apple className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-amber-500" />,
      color: 'border-amber-500/20',
    },
  ];

  return (
    <div className="space-y-3.5 sm:space-y-4 pb-8 w-full">
      {/* Date Switcher Bar */}
      <div className="p-2.5 sm:p-3 bg-surface-container-low rounded-2xl sm:rounded-3xl border border-surface-container-high flex items-center justify-between shadow-xs w-full">
        <button
          onClick={handlePrevDay}
          aria-label="יום קודם"
          className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant active:scale-95 transition-all shadow-xs"
        >
          <ChevronRight className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <button
            onClick={onOpenDatePicker}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-surface-container-lowest hover:bg-surface-container text-on-surface font-headline font-bold text-xs sm:text-sm shadow-xs transition-all truncate"
          >
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
            <span className="truncate">{formatHebrewDate(currentDate)}</span>
          </button>

          {!isToday && (
            <button
              onClick={() => onDateChange(getTodayDateString())}
              className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-[11px] sm:text-xs font-bold transition-all shadow-2xs flex-shrink-0"
            >
              היום
            </button>
          )}
        </div>

        <button
          onClick={handleNextDay}
          aria-label="יום הבא"
          className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant active:scale-95 transition-all shadow-xs"
        >
          <ChevronLeft className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Daily Summary Banner & Workout Mode */}
      <div className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-surface-container-lowest border border-surface-container-high shadow-xs space-y-2.5 w-full">
        <div className="flex justify-between items-center gap-1.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-xs sm:text-sm font-bold text-outline flex-shrink-0">סיכום יומי</span>
            {/* Workout badge button */}
            <button
              onClick={() => setIsWorkoutModalOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[11px] sm:text-xs flex items-center gap-1 transition-all shadow-2xs truncate"
              title="שנה מצב אימון"
            >
              {getWorkoutIcon(adjusted.workoutType)}
              <span className="truncate">{adjusted.workoutBadge}</span>
              {adjusted.isAdjusted && <span className="flex-shrink-0">(+{adjusted.burnedCalories})</span>}
              <SlidersHorizontal className="w-3 h-3 mr-0.5 flex-shrink-0" />
            </button>
          </div>

          <span
            className={`text-xs font-extrabold px-2.5 sm:px-3 py-1 rounded-full flex-shrink-0 ${
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

        <div className="grid grid-cols-4 gap-1 sm:gap-1.5 text-center bg-surface-container-low p-2.5 rounded-xl sm:rounded-2xl border border-surface-container-high text-xs">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] text-outline block mb-0.5 truncate">קלוריות</span>
            <span className="font-headline font-black text-tertiary text-xs sm:text-sm truncate block">
              {totals.totalCalories}
            </span>
            <span className="text-[9px] sm:text-[10px] text-outline block truncate">/{adjusted.targetCalories}</span>
          </div>

          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] text-outline block mb-0.5 truncate">חלבון</span>
            <span className="font-headline font-black text-on-surface text-xs sm:text-sm truncate block">
              {totals.totalProtein}g
            </span>
            <span className="text-[9px] sm:text-[10px] text-outline block truncate">/{adjusted.targetProtein}g</span>
          </div>

          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] text-outline block mb-0.5 truncate">פחמימות</span>
            <span className="font-headline font-black text-on-surface text-xs sm:text-sm truncate block">
              {totals.totalCarbs}g
            </span>
            <span className="text-[9px] sm:text-[10px] text-outline block truncate">/{adjusted.targetCarbs}g</span>
          </div>

          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] text-outline block mb-0.5 truncate">שומן</span>
            <span className="font-headline font-black text-on-surface text-xs sm:text-sm truncate block">
              {totals.totalFat}g
            </span>
            <span className="text-[9px] sm:text-[10px] text-outline block truncate">/{adjusted.targetFat}g</span>
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
              className="rounded-2xl sm:rounded-3xl bg-surface-container-lowest border border-surface-container-high shadow-xs overflow-hidden w-full"
            >
              {/* Meal Header */}
              <div className="p-3 sm:p-3.5 flex items-center justify-between border-b border-surface-container-high/60 bg-surface-container-low/50 gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-surface-container flex items-center justify-center flex-shrink-0">
                    {icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-headline font-bold text-xs sm:text-sm text-on-surface truncate">{title}</h3>
                    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-outline mt-0.5 font-medium truncate">
                      <span className="font-bold text-primary flex-shrink-0">{Math.round(mealCalories)} קק"ל</span>
                      <span>•</span>
                      <span className="truncate">ח:{Math.round(mealProtein * 10) / 10} פ:{Math.round(mealCarbs * 10) / 10} ש:{Math.round(mealFat * 10) / 10}g</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onAddFoodToMeal(type)}
                  className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs flex items-center gap-1 active:scale-95 transition-all shadow-xs flex-shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>הוסף</span>
                </button>
              </div>

              {/* Meal Logged Items List */}
              <div className="p-2 divide-y divide-surface-container-high/40">
                {items.length === 0 ? (
                  <div className="py-4 text-center text-outline text-xs font-medium">
                    טרם נרשמו מאכלים לארוחה זו
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.logId || item.id}
                      className="py-2.5 px-2 flex items-center justify-between gap-2 hover:bg-surface-container-low/40 rounded-xl transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-bold text-xs sm:text-sm text-on-surface truncate">
                            {item.name}
                          </span>
                          <span className="font-extrabold text-xs sm:text-sm text-primary flex-shrink-0">
                            {item.calculatedCalories} קק"ל
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-outline mt-0.5 font-medium truncate">
                          <span className="truncate">
                            {item.amount} {item.unit} ({item.totalGrams}g)
                          </span>
                          <span>•</span>
                          <span className="flex-shrink-0">ח: {item.calculatedProtein}g</span>
                          <span>•</span>
                          <span className="flex-shrink-0">פ: {item.calculatedCarbs}g</span>
                          <span>•</span>
                          <span className="flex-shrink-0">ש: {item.calculatedFat}g</span>
                          {item.timestamp && (
                            <>
                              <span>•</span>
                              <span className="flex-shrink-0">{item.timestamp}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteItem(type, item.logId || item.id || '')}
                        aria-label="מחק פריט"
                        className="p-1.5 rounded-lg text-outline hover:bg-error-container/20 hover:text-error transition-all flex-shrink-0"
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
