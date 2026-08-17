import React from 'react';
import { Clock, Trash2, Utensils } from 'lucide-react';
import type { DayLog, MealType } from '../../types';

interface RecentActivityProps {
  dayLog: DayLog;
  onNavigateToDiary: () => void;
  onDeleteItem?: (mealType: MealType, logId: string) => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  dayLog,
  onNavigateToDiary,
  onDeleteItem,
}) => {
  // Collect all logged items across meals and sort by timestamp
  const allLogs: { item: any; mealType: MealType }[] = [];

  (['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).forEach((meal) => {
    (dayLog.meals[meal] || []).forEach((item) => {
      allLogs.push({ item, mealType: meal });
    });
  });

  const mealLabels: Record<MealType, string> = {
    breakfast: 'בוקר',
    lunch: 'צהריים',
    dinner: 'ערב',
    snack: 'נשנוש',
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <Clock className="w-4.5 h-4.5 text-primary" />
          <h3 className="font-headline font-bold text-base text-on-surface">פעילות אחרונה ביומן</h3>
        </div>
        <button
          onClick={onNavigateToDiary}
          className="text-xs sm:text-sm text-primary font-bold hover:underline"
        >
          לכל היומן ←
        </button>
      </div>

      {allLogs.length === 0 ? (
        <div className="p-7 rounded-3xl bg-surface-container-low border border-surface-container-high text-center">
          <Utensils className="w-7 h-7 text-outline mx-auto mb-2 opacity-60" />
          <p className="text-sm font-bold text-outline">עדיין לא נרשמו מאכלים היום</p>
          <p className="text-xs text-outline/80 mt-1">לחץ על כפתור הפלוס (+) למטה כדי להוסיף מזון</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {allLogs.slice(-5).reverse().map(({ item, mealType }) => (
            <div
              key={item.logId || item.id || `${item.name}-${Math.random()}`}
              className="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container-high flex items-center justify-between gap-3 hover:bg-surface-container-low/40 transition-all shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-11 h-11 rounded-xl object-cover bg-surface-container flex-shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-outline flex-shrink-0">
                    <Utensils className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-on-surface truncate">{item.name}</h4>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold flex-shrink-0">
                      {mealLabels[mealType]}
                    </span>
                  </div>
                  <div className="text-xs text-outline flex items-center gap-2 mt-1 font-medium">
                    <span>{item.amount} {item.unit} ({item.totalGrams || item.grams || 100}g)</span>
                    <span>•</span>
                    <span className="font-extrabold text-tertiary">{item.calculatedCalories || item.calories || 0} קק"ל</span>
                    <span>•</span>
                    <span>{item.calculatedProtein || item.protein || 0}g חלבון</span>
                  </div>
                </div>
              </div>

              {onDeleteItem && (
                <button
                  onClick={() => onDeleteItem(mealType, item.logId || item.id || '')}
                  className="p-2 text-outline hover:text-error hover:bg-error-container/20 rounded-xl transition-all"
                  title="הסר מהיומן"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
