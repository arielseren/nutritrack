import React from 'react';
import { Target, TrendingUp, Sparkles } from 'lucide-react';

interface CalorieRingProps {
  consumed: number;
  target: number;
  baseCalories?: number;
  workoutBadge?: string;
  workoutEmoji?: string;
  isAdjusted?: boolean;
  onTargetClick?: () => void;
  onWorkoutClick?: () => void;
}

export const CalorieRing: React.FC<CalorieRingProps> = ({
  consumed,
  target,
  baseCalories,
  workoutBadge,
  workoutEmoji,
  isAdjusted = false,
  onTargetClick,
  onWorkoutClick,
}) => {
  const percentage = Math.min(100, Math.round((consumed / target) * 100));
  const remaining = target - consumed;
  const isOver = remaining < 0;

  // SVG Circle calculations
  const radius = 62;
  const circumference = 2 * Math.PI * radius; // ~389.55
  const strokeDashoffset = isOver
    ? 0
    : circumference - (percentage / 100) * circumference;

  return (
    <section className="bg-surface-container-lowest rounded-3xl p-4 sm:p-5 ambient-shadow soft-ui-border flex flex-col items-center justify-center relative overflow-hidden w-full">
      {/* Target Badge & Workout Indicator */}
      <div className="w-full flex justify-between items-center mb-2">
        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-outline">
          <Target className="w-4 h-4 text-primary" />
          <span>יעד: {target.toLocaleString()} קק"ל</span>
          {isAdjusted && baseCalories && (
            <span className="text-xs text-tertiary font-extrabold">
              (+{target - baseCalories})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onWorkoutClick && (
            <button
              onClick={onWorkoutClick}
              className="text-xs font-bold px-2 sm:px-2.5 py-1 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary flex items-center gap-1 transition-all shadow-2xs"
            >
              <span>{workoutEmoji || '⚡'}</span>
              <span>{workoutBadge || 'מצב אימון'}</span>
            </button>
          )}
          {onTargetClick && (
            <button
              onClick={onTargetClick}
              className="text-xs font-bold text-outline hover:text-primary transition-all px-1"
            >
              ערוך
            </button>
          )}
        </div>
      </div>

      {/* Main Circular Progress Bar */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 my-1 sm:my-2 flex items-center justify-center max-w-full">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 150 150">
          {/* Background Track Circle */}
          <circle
            cx="75"
            cy="75"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="11"
            className="text-surface-container-high"
          />

          {/* Animated Filled Progress Circle */}
          <circle
            cx="75"
            cy="75"
            r={radius}
            fill="none"
            stroke="url(#gradient-primary)"
            strokeWidth="11"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="gradient-primary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#006b5f" />
              <stop offset="100%" stopColor="#2dd4bf" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          <span className="font-display text-4xl sm:text-5xl font-black text-on-surface tracking-tight leading-none">
            {consumed.toLocaleString()}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-outline mt-1.5">
            מתוך {target.toLocaleString()} קק"ל
          </span>

          <div
            className={`mt-2.5 px-3 py-1 rounded-full text-xs font-extrabold inline-flex items-center gap-1 shadow-2xs ${
              isOver
                ? 'bg-error-container text-error'
                : 'bg-primary/10 text-primary'
            }`}
          >
            {isOver ? (
              <span>חריגה של {Math.abs(remaining).toLocaleString()} קק"ל</span>
            ) : (
              <span>נשארו {remaining.toLocaleString()} קק"ל</span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Footer */}
      <div className="w-full mt-2 pt-3.5 border-t border-surface-container-high/60 flex justify-around text-center">
        <div>
          <span className="text-xs text-outline block mb-0.5">הושלמו</span>
          <span className="text-base font-black text-on-surface">{percentage}%</span>
        </div>
        <div className="w-px h-9 bg-surface-container-high"></div>
        <div>
          <span className="text-xs text-outline block mb-0.5">סטטוס יעד</span>
          <span className="text-base font-black text-primary flex items-center gap-1.5 justify-center">
            {percentage >= 100 ? (
              <>
                <Sparkles className="w-4 h-4 text-tertiary" />
                <span>היעד הושלם!</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                <span>בדרך ליעד</span>
              </>
            )}
          </span>
        </div>
      </div>
    </section>
  );
};
