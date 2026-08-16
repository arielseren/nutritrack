import React from 'react';
import { Target, TrendingUp } from 'lucide-react';

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
  const radius = 58;
  const circumference = 2 * Math.PI * radius; // ~364.42
  const strokeDashoffset = isOver
    ? 0
    : circumference - (percentage / 100) * circumference;

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-6 ambient-shadow soft-ui-border flex flex-col items-center justify-center relative overflow-hidden">
      {/* Target Badge & Workout Indicator */}
      <div className="w-full flex justify-between items-center mb-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-outline">
          <Target className="w-3.5 h-3.5 text-primary" />
          <span>יעד: {target.toLocaleString()} קק"ל</span>
          {isAdjusted && baseCalories && (
            <span className="text-[10px] text-tertiary font-bold">
              (+{target - baseCalories})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {onWorkoutClick && (
            <button
              onClick={onWorkoutClick}
              className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center gap-1 transition-all"
            >
              <span>{workoutEmoji || '⚡'}</span>
              <span>{workoutBadge || 'מצב אימון'}</span>
            </button>
          )}
          {onTargetClick && (
            <button
              onClick={onTargetClick}
              className="text-[10px] font-bold text-outline hover:text-primary transition-all"
            >
              ערוך
            </button>
          )}
        </div>
      </div>

      {/* Main Circular Progress Bar */}
      <div className="relative w-52 h-52 my-1 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
          {/* Background Track Circle */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-surface-container-high"
          />

          {/* Animated Filled Progress Circle */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="url(#gradient-primary)"
            strokeWidth="10"
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
          <span className="font-display text-4xl font-extrabold text-on-surface tracking-tight leading-none">
            {consumed.toLocaleString()}
          </span>
          <span className="text-xs font-medium text-outline mt-1">
            מתוך {target.toLocaleString()} קק"ל
          </span>

          <div
            className={`mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
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
      <div className="w-full mt-2 pt-3 border-t border-surface-container-high/60 flex justify-around text-center">
        <div>
          <span className="text-[11px] text-outline block">הושלמו</span>
          <span className="text-sm font-bold text-on-surface">{percentage}%</span>
        </div>
        <div className="w-px h-8 bg-surface-container-high"></div>
        <div>
          <span className="text-[11px] text-outline block">סטטוס</span>
          <span className="text-sm font-bold text-primary flex items-center gap-1 justify-center">
            <TrendingUp className="w-3.5 h-3.5" />
            {percentage >= 100 ? 'היעד הושלם!' : 'בדרך ליעד'}
          </span>
        </div>
      </div>
    </section>
  );
};
