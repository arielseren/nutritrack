import React, { useState } from 'react';
import {
  QrCode,
  Search,
  UtensilsCrossed,
  SlidersHorizontal,
} from 'lucide-react';
import type { DayLog, UserProfile, MealType, WorkoutDayType } from '../../types';
import {
  calculateDayTotals,
  getDailyAdjustedTargets,
  WORKOUT_CONFIGS,
} from '../../services/nutritionCalculator';
import { CalorieRing } from './CalorieRing';
import { MacroBreakdown } from './MacroBreakdown';
import { WaterTracker } from './WaterTracker';
import { RecentActivity } from './RecentActivity';
import { WorkoutModeModal } from './WorkoutModeModal';

interface DashboardViewProps {
  userProfile: UserProfile;
  dayLog: DayLog;
  onOpenQuickAdd: () => void;
  onOpenBarcodeScanner: () => void;
  onOpenMealPlans: () => void;
  onOpenProfile: () => void;
  onNavigateToDiary: () => void;
  onUpdateWater: (glasses: number) => void;
  onDeleteItem: (mealType: MealType, logId: string) => void;
  onUpdateDayWorkout?: (
    date: string,
    workoutType: WorkoutDayType,
    burnedCalories?: number,
    title?: string,
    durationMinutes?: number
  ) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProfile,
  dayLog,
  onOpenQuickAdd,
  onOpenBarcodeScanner,
  onOpenMealPlans,
  onOpenProfile,
  onNavigateToDiary,
  onUpdateWater,
  onDeleteItem,
  onUpdateDayWorkout,
}) => {
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const totals = calculateDayTotals(dayLog);
  const adjusted = getDailyAdjustedTargets(userProfile, dayLog, dayLog.date);

  const handleQuickSelectWorkout = (type: WorkoutDayType) => {
    if (onUpdateDayWorkout) {
      const cfg = WORKOUT_CONFIGS[type];
      onUpdateDayWorkout(dayLog.date, type, cfg.defaultBurnedKcal, cfg.title);
    }
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Greeting Header */}
      <section className="flex justify-between items-end pt-1">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">
            שלום, {userProfile.name} 👋
          </h2>
          <p className="text-sm text-outline">
            {totals.totalCalories === 0
              ? 'מוכן להתחיל לתעד את היום שלך?'
              : 'הנה תמונת המצב התזונתית שלך להיום.'}
          </p>
        </div>

        <button
          onClick={onOpenProfile}
          title="ערוך פרופיל"
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary-container text-white font-bold flex items-center justify-center shadow-sm text-sm"
        >
          {userProfile.name.charAt(0) || 'D'}
        </button>
      </section>

      {/* Dynamic Workout Mode Banner & Quick Selector */}
      <section className="p-3.5 rounded-3xl bg-surface-container-lowest ambient-shadow soft-ui-border space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <span className="text-base">{adjusted.workoutEmoji}</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-on-surface">
                  {adjusted.workoutTitle}
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-primary/10 text-primary font-bold text-[10px]">
                  {adjusted.workoutBadge}
                </span>
              </div>
              <p className="text-[10px] text-outline">
                {adjusted.isAdjusted
                  ? `תוספת אימון: +${adjusted.burnedCalories} קק"ל ליעד היומי`
                  : 'מאזן בסיסי ליום ללא אימון'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsWorkoutModalOpen(true)}
            className="p-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface transition-all flex items-center gap-1 text-[11px] font-bold"
            title="כיוונון אימון מדויק"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>התאם</span>
          </button>
        </div>

        {/* 1-Click Workout Type Pills */}
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pt-1">
          {(
            [
              { type: 'rest', label: '🛋️ מנוחה' },
              { type: 'light_strength', label: '🏋️ כוח (+250)' },
              { type: 'heavy_strength', label: '🔥 כבד (+450)' },
              { type: 'cardio', label: '🏃 אירובי (+350)' },
              { type: 'hiit', label: '⚡ HIIT (+400)' },
            ] as { type: WorkoutDayType; label: string }[]
          ).map((item) => (
            <button
              key={item.type}
              onClick={() => handleQuickSelectWorkout(item.type)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                adjusted.workoutType === item.type
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low hover:bg-surface-container text-outline hover:text-on-surface border border-surface-container-high/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* Quick Action Buttons Row */}
      <section className="grid grid-cols-3 gap-2">
        <button
          onClick={onOpenQuickAdd}
          className="p-3 rounded-2xl bg-surface-container-lowest ambient-shadow soft-ui-border flex flex-col items-center gap-1.5 hover:bg-surface-container-low transition-all active:scale-95 text-center"
        >
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-on-surface">חיפוש מאכל</span>
        </button>

        <button
          onClick={onOpenBarcodeScanner}
          className="p-3 rounded-2xl bg-surface-container-lowest ambient-shadow soft-ui-border flex flex-col items-center gap-1.5 hover:bg-surface-container-low transition-all active:scale-95 text-center"
        >
          <div className="w-9 h-9 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center">
            <QrCode className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-on-surface">סורק ברקוד</span>
        </button>

        <button
          onClick={onOpenMealPlans}
          className="p-3 rounded-2xl bg-surface-container-lowest ambient-shadow soft-ui-border flex flex-col items-center gap-1.5 hover:bg-surface-container-low transition-all active:scale-95 text-center"
        >
          <div className="w-9 h-9 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-on-surface">תפריט מוכן</span>
        </button>
      </section>

      {/* Calorie Ring with Adjusted Daily Target */}
      <CalorieRing
        consumed={totals.totalCalories}
        target={adjusted.targetCalories}
        baseCalories={adjusted.baseCalories}
        workoutBadge={adjusted.workoutBadge}
        workoutEmoji={adjusted.workoutEmoji}
        isAdjusted={adjusted.isAdjusted}
        onTargetClick={onOpenProfile}
        onWorkoutClick={() => setIsWorkoutModalOpen(true)}
      />

      {/* Macro Breakdown with Adjusted Targets */}
      <MacroBreakdown
        protein={totals.totalProtein}
        proteinTarget={adjusted.targetProtein}
        carbs={totals.totalCarbs}
        carbsTarget={adjusted.targetCarbs}
        fat={totals.totalFat}
        fatTarget={adjusted.targetFat}
      />

      {/* Water Tracker */}
      <WaterTracker
        glasses={dayLog.waterGlasses}
        targetGlasses={userProfile.dailyWaterTargetGlasses}
        onUpdateGlasses={onUpdateWater}
      />

      {/* Recent Activity */}
      <RecentActivity
        dayLog={dayLog}
        onNavigateToDiary={onNavigateToDiary}
        onDeleteItem={onDeleteItem}
      />

      {/* Workout Mode Detailed Customization Modal */}
      {onUpdateDayWorkout && (
        <WorkoutModeModal
          isOpen={isWorkoutModalOpen}
          onClose={() => setIsWorkoutModalOpen(false)}
          currentDate={dayLog.date}
          dayLog={dayLog}
          userProfile={userProfile}
          onSaveWorkout={onUpdateDayWorkout}
        />
      )}
    </div>
  );
};
