import React from 'react';
import { GlassWater, Plus, Minus, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WaterTrackerProps {
  glasses: number;
  targetGlasses: number;
  onUpdateGlasses: (newCount: number) => void;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({
  glasses,
  targetGlasses,
  onUpdateGlasses,
}) => {
  const mlPerGlass = 250;
  const currentMl = glasses * mlPerGlass;
  const targetMl = targetGlasses * mlPerGlass;
  const isGoalReached = glasses >= targetGlasses;

  const handleGlassClick = (index: number) => {
    if (index < glasses) {
      onUpdateGlasses(index);
    } else {
      const next = index + 1;
      onUpdateGlasses(next);
      if (next === targetGlasses) {
        triggerWaterConfetti();
      }
    }
  };

  const handleAdd = () => {
    const next = glasses + 1;
    onUpdateGlasses(next);
    if (next === targetGlasses) {
      triggerWaterConfetti();
    }
  };

  const handleSubtract = () => {
    if (glasses > 0) {
      onUpdateGlasses(glasses - 1);
    }
  };

  const triggerWaterConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#006b5f', '#2dd4bf', '#3cddc7', '#d8e5e2'],
      });
    } catch {
      // ignore
    }
  };

  return (
    <section className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 ambient-shadow soft-ui-border w-full">
      <div className="flex justify-between items-center mb-2.5">
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h3 className="text-sm sm:text-base font-bold text-on-surface">מעקב שתיית מים</h3>
            {isGoalReached && (
              <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] sm:text-xs font-extrabold shadow-2xs">
                <Check className="w-3 h-3" />
                היעד הושג!
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-outline mt-0.5 font-medium">
            {currentMl.toLocaleString()} מ"ל מתוך {targetMl.toLocaleString()} מ"ל ({glasses}/{targetGlasses} כוסות)
          </p>
        </div>

        {/* Quick +/- buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={handleSubtract}
            disabled={glasses <= 0}
            aria-label="הורד כוס"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface disabled:opacity-30 flex items-center justify-center active:scale-95 transition-all shadow-xs"
          >
            <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={handleAdd}
            aria-label="הוסף כוס"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-primary-container text-on-primary-container hover:opacity-90 flex items-center justify-center active:scale-95 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Glasses Row matching Stitch UI */}
      <div className="grid grid-cols-8 gap-1 sm:gap-1.5 pt-1">
        {Array.from({ length: targetGlasses }).map((_, index) => {
          const isFilled = index < glasses;
          return (
            <button
              key={index}
              onClick={() => handleGlassClick(index)}
              title={`כוס ${index + 1} (250 מ"ל)`}
              aria-label={`כוס ${index + 1}`}
              className={`h-11 sm:h-12 rounded-xl flex flex-col items-center justify-center transition-all duration-300 active:scale-90 shadow-xs ${
                isFilled
                  ? 'bg-gradient-to-t from-primary to-primary-container text-white shadow-sm shadow-primary/25 scale-[1.02]'
                  : 'bg-surface-container-high/60 text-outline hover:bg-surface-container-high'
              }`}
            >
              <GlassWater className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isFilled ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
            </button>
          );
        })}
      </div>
    </section>
  );
};
