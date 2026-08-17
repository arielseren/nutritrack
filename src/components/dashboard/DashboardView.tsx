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
  Sparkles,
  Camera,
  Mic,
  ChefHat,
  Bot,
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
  onOpenMealPlans,
  onOpenProfile,
  onOpenWeightProgress,
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

  const getWorkoutIcon = (type: WorkoutDayType, className: string = 'w-4.5 h-4.5') => {
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
    <div className="space-y-3.5 sm:space-y-4 pb-8 w-full">
      {/* Greeting Banner */}
      <section className="pt-0.5 px-0.5">
        <h2 className="font-headline text-2xl sm:text-3xl font-black text-on-surface">
          שלום, {userProfile.name}
        </h2>
        <p className="text-xs sm:text-sm text-outline mt-0.5 font-medium">
          {totals.totalCalories === 0
            ? 'מוכן להתחיל לתעד את היום שלך?'
            : 'הנה תמונת המצב התזונתית שלך להיום.'}
        </p>
      </section>

      {/* Dynamic Workout Mode Banner with Hidden Options by Default */}
      <section className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-surface-container-lowest ambient-shadow soft-ui-border space-y-2.5 w-full">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
              {getWorkoutIcon(adjusted.workoutType, 'w-4.5 h-4.5')}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-on-surface truncate">
                  {adjusted.workoutTitle}
                </span>
                <span className="px-1.5 py-0.2 rounded-full bg-primary/10 text-primary font-bold text-[10px] sm:text-xs flex-shrink-0">
                  {adjusted.workoutBadge}
                </span>
              </div>
              <p className="text-[11px] text-outline truncate mt-0.5">
                {adjusted.isAdjusted
                  ? `תוספת אימון: +${adjusted.burnedCalories} קק"ל ליעד היומי`
                  : 'מאזן בסיסי ליום מנוחה'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setShowWorkoutOptions(!showWorkoutOptions)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs flex items-center gap-1 transition-all active:scale-95 shadow-xs"
              title="שנה מצב אימון"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>שינוי</span>
              {showWorkoutOptions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* 1-Click Workout Type Options (Hidden by default, toggled via 'שינוי') */}
        {showWorkoutOptions && (
          <div className="pt-2 border-t border-surface-container-high/60 space-y-2 animate-in fade-in duration-150">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
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
                  className={`p-2 sm:p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                    adjusted.workoutType === item.type
                      ? 'bg-primary text-on-primary border-primary shadow-xs'
                      : 'bg-surface-container-low hover:bg-surface-container text-on-surface border-surface-container-high/60'
                  }`}
                >
                  {getWorkoutIcon(item.type, 'w-3.5 h-3.5')}
                  <span>{item.label}</span>
                </button>
              ))}

              {/* Precise Adjuster Modal trigger */}
              <button
                onClick={() => {
                  setShowWorkoutOptions(false);
                  setIsWorkoutModalOpen(true);
                }}
                className="p-2 sm:p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface border border-surface-container-high/60"
                title="הזנת קלוריות ודקות אימון ידנית"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-secondary" />
                <span>התאמה אישית</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Quick Action Buttons Row (2 Columns: Food Search & Meal Plans) */}
      <section className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full">
        <button
          onClick={onOpenQuickAdd}
          className="p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl bg-surface-container-lowest ambient-shadow soft-ui-border flex items-center justify-center gap-2 hover:bg-surface-container-low transition-all active:scale-95 text-center min-w-0"
        >
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-on-surface truncate">חיפוש מאכל</span>
        </button>

        <button
          onClick={onOpenMealPlans}
          className="p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl bg-surface-container-lowest ambient-shadow soft-ui-border flex items-center justify-center gap-2 hover:bg-surface-container-low transition-all active:scale-95 text-center min-w-0"
        >
          <div className="w-8 h-8 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0">
            <UtensilsCrossed className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-on-surface truncate">תפריט מוכן</span>
        </button>
      </section>

      {/* AI Smart Nutrition Suite Bar */}
      <section className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary/10 via-surface-container-lowest to-secondary/10 border border-primary/20 shadow-xs space-y-2.5 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-primary text-on-primary flex items-center justify-center font-black text-xs shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-headline font-black text-xs sm:text-sm text-on-surface">
              עוזר תזונה חכם ב-AI
            </span>
          </div>

          {onOpenAIHub && (
            <button
              onClick={onOpenAIHub}
              className="text-[11px] font-extrabold text-primary hover:underline flex items-center gap-0.5"
            >
              <span>מרכז AI</span>
              <Sparkles className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {onOpenAIVoice && (
            <button
              onClick={onOpenAIVoice}
              className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container-high/60 flex flex-col items-center justify-center gap-1 text-center transition-all active:scale-95 shadow-2xs group"
              title="הזנה קולית וחופשית"
            >
              <Mic className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold text-on-surface truncate w-full">הזנה קולית</span>
            </button>
          )}

          {onOpenAIScanner && (
            <button
              onClick={() => onOpenAIScanner('plate_vision')}
              className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container-high/60 flex flex-col items-center justify-center gap-1 text-center transition-all active:scale-95 shadow-2xs group"
              title="סריקת צלחת ותמונה"
            >
              <Camera className="w-4 h-4 text-secondary group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold text-on-surface truncate w-full">סריקת צלחת</span>
            </button>
          )}

          {onOpenAIMealGen && (
            <button
              onClick={onOpenAIMealGen}
              className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container-high/60 flex flex-col items-center justify-center gap-1 text-center transition-all active:scale-95 shadow-2xs group"
              title="השלמת מאקרו ומתכונים"
            >
              <ChefHat className="w-4 h-4 text-tertiary group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold text-on-surface truncate w-full">השלם מאקרו</span>
            </button>
          )}

          {onOpenAICoach && (
            <button
              onClick={onOpenAICoach}
              className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container-high/60 flex flex-col items-center justify-center gap-1 text-center transition-all active:scale-95 shadow-2xs group"
              title="התייעצות עם מאמן תזונה"
            >
              <Bot className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold text-on-surface truncate w-full">מאמן אישי</span>
            </button>
          )}
        </div>
      </section>

      {/* Quick Weight & Progress Banner */}
      {onOpenWeightProgress && (
        <section
          onClick={onOpenWeightProgress}
          className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-surface-container-lowest ambient-shadow soft-ui-border flex items-center justify-between gap-2.5 cursor-pointer hover:bg-surface-container-low transition-all active:scale-98 w-full"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
              <Scale className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-on-surface truncate">מעקב משקל וגרפים</span>
                <span className="text-[10px] sm:text-xs px-1.5 py-0.2 bg-primary/10 text-primary rounded-md font-bold flex-shrink-0">
                  {userProfile.currentWeight} ק"ג
                </span>
              </div>
              <p className="text-[11px] text-outline mt-0.5 font-medium truncate">
                התחלה: {userProfile.initialWeight || userProfile.currentWeight}kg • יעד: {userProfile.targetWeight}kg
              </p>
            </div>
          </div>

          <span className="text-xs sm:text-sm font-extrabold text-primary flex items-center gap-1 flex-shrink-0">
            <span>גרף התקדמות</span>
            <TrendingDown className="w-3.5 h-3.5" />
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
