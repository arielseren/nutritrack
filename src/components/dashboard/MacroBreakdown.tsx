import React from 'react';
import { Dumbbell, Utensils, Droplets } from 'lucide-react';

interface MacroBreakdownProps {
  protein: number;
  proteinTarget: number;
  carbs: number;
  carbsTarget: number;
  fat: number;
  fatTarget: number;
}

export const MacroBreakdown: React.FC<MacroBreakdownProps> = ({
  protein,
  proteinTarget,
  carbs,
  carbsTarget,
  fat,
  fatTarget,
}) => {
  const proteinPct = Math.min(100, Math.round((protein / Math.max(1, proteinTarget)) * 100));
  const carbsPct = Math.min(100, Math.round((carbs / Math.max(1, carbsTarget)) * 100));
  const fatPct = Math.min(100, Math.round((fat / Math.max(1, fatTarget)) * 100));

  return (
    <section className="grid grid-cols-3 gap-3">
      {/* Protein Card */}
      <div className="bg-surface-container-lowest rounded-3xl p-4 ambient-shadow soft-ui-border flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-on-surface">חלבון</span>
          <div className="w-6 h-6 rounded-lg bg-tertiary-container/30 flex items-center justify-center text-tertiary">
            <Dumbbell className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2.5">
          <div className="font-display text-2xl font-black text-on-surface leading-none">
            {protein}
            <span className="text-xs font-semibold text-outline mr-0.5">/{proteinTarget}g</span>
          </div>
        </div>

        <div>
          <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-tertiary rounded-full transition-all duration-700 ease-out"
              style={{ width: `${proteinPct}%` }}
            />
          </div>
          <span className="text-xs text-outline font-bold mt-1.5 block text-left">
            {proteinPct}%
          </span>
        </div>
      </div>

      {/* Carbs Card */}
      <div className="bg-surface-container-lowest rounded-3xl p-4 ambient-shadow soft-ui-border flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-on-surface">פחמימה</span>
          <div className="w-6 h-6 rounded-lg bg-primary-container/30 flex items-center justify-center text-primary">
            <Utensils className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2.5">
          <div className="font-display text-2xl font-black text-on-surface leading-none">
            {carbs}
            <span className="text-xs font-semibold text-outline mr-0.5">/{carbsTarget}g</span>
          </div>
        </div>

        <div>
          <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
              style={{ width: `${carbsPct}%` }}
            />
          </div>
          <span className="text-xs text-outline font-bold mt-1.5 block text-left">
            {carbsPct}%
          </span>
        </div>
      </div>

      {/* Fat Card */}
      <div className="bg-surface-container-lowest rounded-3xl p-4 ambient-shadow soft-ui-border flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-on-surface">שומן</span>
          <div className="w-6 h-6 rounded-lg bg-secondary-container/40 flex items-center justify-center text-secondary">
            <Droplets className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2.5">
          <div className="font-display text-2xl font-black text-on-surface leading-none">
            {fat}
            <span className="text-xs font-semibold text-outline mr-0.5">/{fatTarget}g</span>
          </div>
        </div>

        <div>
          <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full transition-all duration-700 ease-out"
              style={{ width: `${fatPct}%` }}
            />
          </div>
          <span className="text-xs text-outline font-bold mt-1.5 block text-left">
            {fatPct}%
          </span>
        </div>
      </div>
    </section>
  );
};
