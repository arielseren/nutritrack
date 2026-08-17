import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  Mic,
  ChefHat,
  Bot,
  Plus,
  ArrowLeft,
  SunMedium,
  Sun,
  Sunset,
  Apple,
} from 'lucide-react';
import type { DayLog, UserProfile, MealType, WorkoutDayType } from '../../types';
import {
  calculateDayTotals,
  getDailyAdjustedTargets,
} from '../../services/nutritionCalculator';
import { CalorieRing } from './CalorieRing';
import { MacroBreakdown } from './MacroBreakdown';
import { WaterTracker } from './WaterTracker';
import { RecentActivity } from './RecentActivity';
import { WorkoutModeModal } from './WorkoutModeModal';

interface DashboardViewProps {
  userProfile: UserProfile;
  dayLog: DayLog;
  onOpenQuickAdd: (mealType?: MealType) => void;
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
  onOpenAIHub?: () => void;
  onOpenAIVoice?: () => void;
  onOpenAIScanner?: (tab?: 'plate_vision' | 'label_ocr' | 'barcode') => void;
  onOpenAICoach?: () => void;
  onOpenAIMealGen?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProfile,
  dayLog,
  onOpenQuickAdd,
  onOpenProfile,
  onNavigateToDiary,
  onUpdateWater,
  onDeleteItem,
  onUpdateDayWorkout,
  onOpenAIHub,
  onOpenAIVoice,
  onOpenAIScanner,
  onOpenAICoach,
  onOpenAIMealGen,
}) => {
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);

  const totals = calculateDayTotals(dayLog);
  const adjusted = getDailyAdjustedTargets(userProfile, dayLog, dayLog.date);

  const mealsSummary: { type: MealType; label: string; icon: React.ReactNode; count: number; cals: number }[] = [
    {
      type: 'breakfast',
      label: 'בוקר',
      icon: <SunMedium className="w-3.5 h-3.5 text-amber-500" />,
      count: dayLog.meals.breakfast.length,
      cals: Math.round(dayLog.meals.breakfast.reduce((s, i) => s + (i.calculatedCalories || 0), 0)),
    },
    {
      type: 'lunch',
      label: 'צהריים',
      icon: <Sun className="w-3.5 h-3.5 text-primary" />,
      count: dayLog.meals.lunch.length,
      cals: Math.round(dayLog.meals.lunch.reduce((s, i) => s + (i.calculatedCalories || 0), 0)),
    },
    {
      type: 'dinner',
      label: 'ערב',
      icon: <Sunset className="w-3.5 h-3.5 text-tertiary" />,
      count: dayLog.meals.dinner.length,
      cals: Math.round(dayLog.meals.dinner.reduce((s, i) => s + (i.calculatedCalories || 0), 0)),
    },
    {
      type: 'snack',
      label: 'נשנוש',
      icon: <Apple className="w-3.5 h-3.5 text-secondary" />,
      count: dayLog.meals.snack.length,
      cals: Math.round(dayLog.meals.snack.reduce((s, i) => s + (i.calculatedCalories || 0), 0)),
    },
  ];

  return (
    <div className="space-y-4 pb-8 w-full animate-page-enter">
      
      {/* 1. Header Greeting (Clean & Minimal) */}
      <section className="flex items-center justify-between px-1 pt-1">
        <div>
          <h2 className="font-headline text-2xl font-black text-on-surface tracking-tight">
            שלום, {userProfile.name}
          </h2>
          <p className="text-xs text-outline font-medium mt-0.5">
            {totals.totalCalories === 0
              ? 'מוכן לתעד את הארוחה הראשונה שלך להיום?'
              : `נצרכו ${totals.totalCalories.toLocaleString()} מתוך ${adjusted.targetCalories.toLocaleString()} קק"ל`}
          </p>
        </div>

        {/* Workout Mode Compact Pill */}
        <button
          onClick={() => setIsWorkoutModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-surface-container-high text-xs font-bold text-on-surface transition-all active:scale-95 shadow-2xs"
          title="לחץ כדי לשנות עצימות אימון"
        >
          <span>{adjusted.workoutEmoji}</span>
          <span className="truncate max-w-[100px]">{adjusted.workoutTitle}</span>
          {adjusted.isAdjusted && (
            <span className="text-[10px] text-tertiary font-extrabold">(+{adjusted.burnedCalories})</span>
          )}
        </button>
      </section>

      {/* 2. Hero: Calorie Ring (Adjusted Targets & Progress) */}
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

      {/* 3. Three Macro Progress Bars */}
      <MacroBreakdown
        protein={totals.totalProtein}
        proteinTarget={adjusted.targetProtein}
        carbs={totals.totalCarbs}
        carbsTarget={adjusted.targetCarbs}
        fat={totals.totalFat}
        fatTarget={adjusted.targetFat}
      />

      {/* 4. AI Quick Actions Toolbar (Ultra Sleek Minimal Horizontal Pills) */}
      <section className="p-3 rounded-3xl bg-surface-container-lowest border border-surface-container-high/80 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span className="font-headline font-bold text-xs text-on-surface">
              כלי AI חכמים
            </span>
          </div>
          {onOpenAIHub && (
            <button
              onClick={onOpenAIHub}
              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              <span>מרכז בקרה</span>
              <ArrowLeft className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {onOpenAIVoice && (
            <button
              onClick={onOpenAIVoice}
              className="p-2.5 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high/60 flex flex-col items-center justify-center gap-1 text-center transition-all active:scale-95 group"
              title="הזנה קולית וחופשית"
            >
              <Mic className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold text-on-surface truncate w-full">קול</span>
            </button>
          )}

          {onOpenAIScanner && (
            <button
              onClick={() => onOpenAIScanner('plate_vision')}
              className="p-2.5 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high/60 flex flex-col items-center justify-center gap-1 text-center transition-all active:scale-95 group"
              title="סריקת צלחת ותמונה"
            >
              <Camera className="w-4 h-4 text-secondary group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold text-on-surface truncate w-full">צילום</span>
            </button>
          )}

          {onOpenAIMealGen && (
            <button
              onClick={onOpenAIMealGen}
              className="p-2.5 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high/60 flex flex-col items-center justify-center gap-1 text-center transition-all active:scale-95 group"
              title="השלמת מאקרו ומתכונים"
            >
              <ChefHat className="w-4 h-4 text-tertiary group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold text-on-surface truncate w-full">מתכון</span>
            </button>
          )}

          {onOpenAICoach && (
            <button
              onClick={onOpenAICoach}
              className="p-2.5 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high/60 flex flex-col items-center justify-center gap-1 text-center transition-all active:scale-95 group"
              title="התייעצות עם מאמן/ת תזונה"
            >
              <Bot className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold text-on-surface truncate w-full">יועץ</span>
            </button>
          )}
        </div>
      </section>

      {/* 5. Today's Meals Quick Overview Strip */}
      <section className="p-3.5 sm:p-4 rounded-3xl bg-surface-container-lowest border border-surface-container-high/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="font-headline font-bold text-xs sm:text-sm text-on-surface">
            ארוחות היום
          </span>
          <button
            onClick={onNavigateToDiary}
            className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5"
          >
            <span>פתח יומן מלא</span>
            <ArrowLeft className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {mealsSummary.map((m) => (
            <div
              key={m.type}
              onClick={() => onOpenQuickAdd(m.type)}
              className="p-2.5 sm:p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high/60 flex items-center justify-between cursor-pointer transition-all active:scale-98 group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0">
                  {m.icon}
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-xs text-on-surface block leading-tight truncate">
                    {m.label}
                  </span>
                  <span className="text-[10px] text-outline truncate block">
                    {m.count > 0 ? `${m.cals} קק"ל (${m.count})` : 'טרם תועד'}
                  </span>
                </div>
              </div>

              <div className="w-6 h-6 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors flex-shrink-0">
                <Plus className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Water Tracker */}
      <WaterTracker
        glasses={dayLog.waterGlasses}
        targetGlasses={userProfile.dailyWaterTargetGlasses || 8}
        onUpdateGlasses={onUpdateWater}
      />

      {/* 7. Recent Logged Activity */}
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
          onSaveWorkout={(date, type, burned, title, duration) => {
            onUpdateDayWorkout(date, type, burned, title, duration);
            setIsWorkoutModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
