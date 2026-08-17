import React, { useState } from 'react';
import {
  Search,
  UtensilsCrossed,
  SlidersHorizontal,
  Dumbbell,
  Flame,
  Zap,
  Activity,
  BedDouble,
  ChevronDown,
  ChevronUp,
  Edit3,
  Scale,
  TrendingDown,
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
  onOpenMealPlans: () => void;
  onOpenProfile: () => void;
  onOpenWeightProgress?: () => void;
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
  onOpenMealPlans,
  onOpenProfile,
  onOpenWeightProgress,
  onNavigateToDiary,
  onUpdateWater,
  onDeleteItem,
  onUpdateDayWorkout,
}) => {
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [showWorkoutOptions, setShowWorkoutOptions] = useState(false);

  const totals = calculateDayTotals(dayLog);
  const adjusted = getDailyAdjustedTargets(userProfile, dayLog, dayLog.date);

  const handleQuickSelectWorkout = (type: WorkoutDayType) => {
    if (onUpdateDayWorkout) {
      const cfg = WORKOUT_CONFIGS[type];
      onUpdateDayWorkout(dayLog.date, type, cfg.defaultBurnedKcal, cfg.title);
      setShowWorkoutOptions(false);
    }
  };

  const getWorkoutIcon = (type: WorkoutDayType, className: string = 'w-5 h-5') => {
    switch (type) {
      case 'rest':
        return <BedDouble className={className} />;
      case 'light_strength':
        return <Dumbbell className={className} />;
      case 'heavy_strength':
        return <Flame className={className} />;
      case 'cardio':
        return <Activity className={className} />;
      case 'hiit':
        return <Zap className={className} />;
      default:
        return <Dumbbell className={className} />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-8">
      {/* Greeting Banner */}
      <section className="pt-1 px-1">
        <h2 className="font-headline text-2xl sm:text-3xl font-black text-on-surface">
          שלום, {userProfile.name}
        </h2>
        <p className="text-sm text-outline mt-0.5 font-medium">
          {totals.totalCalories === 0
            ? 'מוכן להתחיל לתעד את היום שלך?'
            : 'הנה תמונת המצב התזונתית שלך להיום.'}
        </p>
      </section>

      {/* Dynamic Workout Mode Banner with Hidden Options by Default */}
      <section className="p-4 rounded-3xl bg-surface-container-lowest ambient-shadow soft-ui-border space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
              {getWorkoutIcon(adjusted.workoutType, 'w-5 h-5')}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-on-surface truncate">
                  {adjusted.workoutTitle}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-xs">
                  {adjusted.workoutBadge}
                </span>
              </div>
              <p className="text-xs text-outline truncate mt-0.5">
                {adjusted.isAdjusted
                  ? `תוספת אימון: +${adjusted.burnedCalories} קק"ל ליעד היומי`
                  : 'מאזן בסיסי ליום מנוחה'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowWorkoutOptions(!showWorkoutOptions)}
              className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
              title="שנה מצב אימון"
            >
              <Edit3 className="w-4 h-4" />
              <span>שינוי</span>
              {showWorkoutOptions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 1-Click Workout Type Options (Hidden by default, toggled via 'שינוי') */}
        {showWorkoutOptions && (
          <div className="pt-2.5 border-t border-surface-container-high/60 space-y-2.5 animate-in fade-in duration-150">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(
                [
                  { type: 'rest', label: 'מנוחה' },
                  { type: 'light_strength', label: 'כוח (+250)' },
                  { type: 'heavy_strength', label: 'כבד (+450)' },
                  { type: 'cardio', label: 'אירובי (+350)' },
                  { type: 'hiit', label: 'HIIT (+400)' },
                ] as { type: WorkoutDayType; label: string }[]
              ).map((item) => (
                <button
                  key={item.type}
                  onClick={() => handleQuickSelectWorkout(item.type)}
                  className={`p-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 border ${
                    adjusted.workoutType === item.type
                      ? 'bg-primary text-on-primary border-primary shadow-xs'
                      : 'bg-surface-container-low hover:bg-surface-container text-on-surface border-surface-container-high/60'
                  }`}
                >
                  {getWorkoutIcon(item.type, 'w-4 h-4')}
                  <span>{item.label}</span>
                </button>
              ))}

              {/* Precise Adjuster Modal trigger */}
              <button
                onClick={() => {
                  setShowWorkoutOptions(false);
                  setIsWorkoutModalOpen(true);
                }}
                className="p-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface border border-surface-container-high/60"
                title="הזנת קלוריות ודקות אימון ידנית"
              >
                <SlidersHorizontal className="w-4 h-4 text-secondary" />
                <span>התאמה אישית</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Quick Action Buttons Row (2 Columns: Food Search & Meal Plans) */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4">
        <button
          onClick={onOpenQuickAdd}
          className="p-4 rounded-3xl bg-surface-container-lowest ambient-shadow soft-ui-border flex items-center justify-center gap-2.5 hover:bg-surface-container-low transition-all active:scale-95 text-center"
        >
          <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <span className="text-sm font-extrabold text-on-surface">חיפוש מאכל</span>
        </button>

        <button
          onClick={onOpenMealPlans}
          className="p-4 rounded-3xl bg-surface-container-lowest ambient-shadow soft-ui-border flex items-center justify-center gap-2.5 hover:bg-surface-container-low transition-all active:scale-95 text-center"
        >
          <div className="w-9 h-9 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <span className="text-sm font-extrabold text-on-surface">תפריט מוכן</span>
        </button>
      </section>

      {/* Quick Weight & Progress Banner */}
      {onOpenWeightProgress && (
        <section
          onClick={onOpenWeightProgress}
          className="p-4 rounded-3xl bg-surface-container-lowest ambient-shadow soft-ui-border flex items-center justify-between gap-3 cursor-pointer hover:bg-surface-container-low transition-all active:scale-98"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-on-surface">מעקב משקל וגרפים</span>
                <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-md font-bold">
                  {userProfile.currentWeight} ק"ג
                </span>
              </div>
              <p className="text-xs text-outline mt-0.5 font-medium">
                התחלה: {userProfile.initialWeight || userProfile.currentWeight}kg • יעד: {userProfile.targetWeight}kg
              </p>
            </div>
          </div>

          <span className="text-xs sm:text-sm font-extrabold text-primary flex items-center gap-1">
            <span>גרף התקדמות</span>
            <TrendingDown className="w-4 h-4" />
          </span>
        </section>
      )}

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

      {/* 3 Macro Progress Bars */}
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
        targetGlasses={userProfile.dailyWaterTargetGlasses || 8}
        onUpdateGlasses={onUpdateWater}
      />

      {/* Recent Logged Activity */}
      <RecentActivity
        dayLog={dayLog}
        onNavigateToDiary={onNavigateToDiary}
        onDeleteItem={onDeleteItem}
      />

      {/* Workout Adjuster Modal */}
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
