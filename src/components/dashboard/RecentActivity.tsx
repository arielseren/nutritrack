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
    breakfast: 'ארוחת בוקר',
    lunch: 'ארוחת צהריים',
    dinner: 'ארוחת ערב',
    snack: 'נשנוש',
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-primary" />
          <h3 className="font-headline font-bold text-sm text-on-surface">פעילות אחרונה ביומן</h3>
        </div>
        <button
          onClick={onNavigateToDiary}
          className="text-xs text-primary font-bold hover:underline"
        >
          לכל היומן
        </button>
      </div>

      {allLogs.length === 0 ? (
        <div className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high text-center">
          <Utensils className="w-6 h-6 text-outline mx-auto mb-1.5 opacity-60" />
          <p className="text-xs font-semibold text-outline">עדיין לא נרשמו מאכלים היום</p>
          <p className="text-[11px] text-outline/80 mt-0.5">לחץ על כפתור הפלוס (+) למטה כדי להוסיף מזון</p>
        </div>
      ) : (
        <div className="space-y-2">
          {allLogs.slice(-5).reverse().map(({ item, mealType }) => (
            <div
              key={item.logId || item.id || `${item.name}-${Math.random()}`}
              className="p-3 rounded-2xl bg-surface-container-lowest border border-surface-container-high flex items-center justify-between gap-3 hover:bg-surface-container-low/40 transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-10 h-10 rounded-xl object-cover bg-surface-container flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-outline flex-shrink-0">
                    <Utensils className="w-4 h-4" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-on-surface truncate">{item.name}</h4>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-primary/10 text-primary font-semibold flex-shrink-0">
                      {mealLabels[mealType]}
                    </span>
                  </div>
                  <div className="text-[11px] text-outline flex items-center gap-2 mt-0.5">
                    <span>{item.amount} {item.unit} ({item.totalGrams || item.grams || 100}g)</span>
                    <span>•</span>
                    <span className="font-bold text-tertiary">{item.calculatedCalories || item.calories || 0} קק"ל</span>
                    <span>•</span>
                    <span>{item.calculatedProtein || item.protein || 0}g חלבון</span>
                  </div>
                </div>
              </div>

              {onDeleteItem && (
                <button
                  onClick={() => onDeleteItem(mealType, item.logId || item.id || '')}
                  className="p-1.5 text-outline hover:text-error hover:bg-error-container/20 rounded-lg transition-all"
                  title="הסר מהיומן"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
