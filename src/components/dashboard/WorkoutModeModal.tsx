import React, { useState } from 'react';
import {
  X,
  Dumbbell,
  Flame,
  Check,
  Sparkles,
  Activity,
  Zap,
  BedDouble,
  SlidersHorizontal,
} from 'lucide-react';
import type { WorkoutDayType, DayLog, UserProfile } from '../../types';
import { WORKOUT_CONFIGS, getDailyAdjustedTargets } from '../../services/nutritionCalculator';

interface WorkoutModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: string;
  dayLog: DayLog;
  userProfile: UserProfile;
  onSaveWorkout: (
    date: string,
    workoutType: WorkoutDayType,
    burnedCalories?: number,
    title?: string,
    durationMinutes?: number
  ) => void;
}

export const WorkoutModeModal: React.FC<WorkoutModeModalProps> = ({
  isOpen,
  onClose,
  currentDate,
  dayLog,
  userProfile,
  onSaveWorkout,
}) => {
  const currentAdjusted = getDailyAdjustedTargets(userProfile, dayLog, currentDate);

  const [selectedType, setSelectedType] = useState<WorkoutDayType>(
    dayLog.workoutType || currentAdjusted.workoutType || 'rest'
  );
  const [customBurned, setCustomBurned] = useState<number>(
    dayLog.workoutBurnedCalories ?? (WORKOUT_CONFIGS[selectedType]?.defaultBurnedKcal || 0)
  );
  const [customTitle, setCustomTitle] = useState<string>(
    dayLog.workoutTitle || WORKOUT_CONFIGS[selectedType]?.title || ''
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(
    dayLog.workoutDurationMinutes ?? 45
  );

  if (!isOpen) return null;

  const handleSelectType = (type: WorkoutDayType) => {
    setSelectedType(type);
    const config = WORKOUT_CONFIGS[type];
    setCustomBurned(config.defaultBurnedKcal);
    setCustomTitle(config.title);
  };

  const getWorkoutIcon = (type: WorkoutDayType) => {
    switch (type) {
      case 'light_strength':
        return <Dumbbell className="w-5 h-5 text-primary" />;
      case 'heavy_strength':
        return <Flame className="w-5 h-5 text-tertiary" />;
      case 'cardio':
        return <Activity className="w-5 h-5 text-emerald-500" />;
      case 'hiit':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'custom':
        return <SlidersHorizontal className="w-5 h-5 text-secondary" />;
      case 'rest':
      default:
        return <BedDouble className="w-5 h-5 text-slate-500" />;
    }
  };

  const handleApply = () => {
    onSaveWorkout(
      currentDate,
      selectedType,
      customBurned,
      customTitle.trim() || WORKOUT_CONFIGS[selectedType].title,
      selectedType === 'rest' ? 0 : durationMinutes
    );
    onClose();
  };

  // Temporary mock dayLog for live calculation preview
  const previewDayLog: DayLog = {
    ...dayLog,
    workoutType: selectedType,
    workoutBurnedCalories: customBurned,
  };
  const previewAdjusted = getDailyAdjustedTargets(userProfile, previewDayLog, currentDate);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-surface rounded-t-3xl sm:rounded-3xl w-full max-w-[480px] max-h-[92dvh] sm:max-h-[90dvh] flex flex-col shadow-2xl border border-surface-container-high overflow-hidden animate-modal-sheet modal-safe-bottom">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-surface-container-high bg-surface-container-lowest flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xs">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-headline text-base font-bold text-on-surface">
                התאמת יום אימון וסייקלינג קלוריות
              </h2>
              <p className="text-[11px] text-outline">
                התאם את צריכת הקלוריות והפחמימות בהתאם לעצימות הפעילות
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="סגור"
            className="p-2 rounded-xl text-outline hover:bg-surface-container hover:text-on-surface transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Quick Workout Type Selector Cards */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-outline block mb-1">
              בחר את סוג הפעילות ליום זה:
            </label>
            {(Object.keys(WORKOUT_CONFIGS) as WorkoutDayType[]).map((type) => {
              const cfg = WORKOUT_CONFIGS[type];
              const isSelected = selectedType === type;
              return (
                <div
                  key={type}
                  onClick={() => handleSelectType(type)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-primary/10 border-primary shadow-xs'
                      : 'bg-surface-container-low border-surface-container-high/60 hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0">
                      {getWorkoutIcon(type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-on-surface truncate">
                          {cfg.title}
                        </span>
                        <span className="px-1.5 py-0.2 rounded-md bg-surface-container text-outline text-[10px] font-bold">
                          {cfg.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-outline mt-0.5 truncate">{cfg.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`font-bold text-xs ${cfg.defaultBurnedKcal > 0 ? 'text-tertiary' : 'text-outline'}`}>
                      {cfg.defaultBurnedKcal > 0 ? `+${cfg.defaultBurnedKcal} קק"ל` : 'בסיס'}
                    </span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-primary bg-primary text-white' : 'border-outline/40'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Calorie & Duration Adjuster (If not rest) */}
          {selectedType !== 'rest' && (
            <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container-high space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-1.5 text-primary">
                <Flame className="w-4 h-4" />
                <span className="font-bold text-xs">כוונון עצימות ושריפת קלוריות באימון:</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-outline block mb-1">
                    תוספת קלוריות לאימון (קק"ל)
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      value={customBurned === 0 ? '' : customBurned}
                      onChange={(e) => setCustomBurned(e.target.value === '' ? 0 : Number(e.target.value))}
                      placeholder="250"
                      className="w-full pl-2 pr-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-outline block mb-1">
                    משך האימון (דקות)
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      value={durationMinutes === 0 ? '' : durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value === '' ? 0 : Number(e.target.value))}
                      placeholder="45"
                      className="w-full pl-2 pr-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-xs font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Live Calorie & Macro Target Impact Card */}
          <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-primary/30 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-primary">
                <Sparkles className="w-4 h-4" />
                <span className="font-bold text-xs">יעד יומי מותאם לפעילות:</span>
              </div>
              <span className="text-[10px] font-bold text-outline">
                {previewAdjusted.isAdjusted
                  ? `(בסיס: ${previewAdjusted.baseCalories} + ${customBurned} קק"ל)`
                  : 'מאזן בסיס'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div className="p-2 rounded-xl bg-surface-container-low border border-surface-container-high/60">
                <span className="text-[9px] text-outline block">קלוריות</span>
                <span className="font-bold text-sm text-tertiary">
                  {previewAdjusted.targetCalories}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-surface-container-low border border-surface-container-high/60">
                <span className="text-[9px] text-outline block">חלבון</span>
                <span className="font-bold text-xs text-on-surface">
                  {previewAdjusted.targetProtein}g
                </span>
              </div>
              <div className="p-2 rounded-xl bg-surface-container-low border border-surface-container-high/60">
                <span className="text-[9px] text-outline block">פחמימות</span>
                <span className="font-bold text-xs text-on-surface">
                  {previewAdjusted.targetCarbs}g
                </span>
              </div>
              <div className="p-2 rounded-xl bg-surface-container-low border border-surface-container-high/60">
                <span className="text-[9px] text-outline block">שומן</span>
                <span className="font-bold text-xs text-on-surface">
                  {previewAdjusted.targetFat}g
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-surface-container-lowest border-t border-surface-container-high flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface font-bold text-xs transition-all"
          >
            ביטול
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary font-headline font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>החל מצב אימון על היום</span>
          </button>
        </div>

      </div>
    </div>
  );
};
