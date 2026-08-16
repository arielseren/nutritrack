import React, { useState } from 'react';
import { BookMarked, X, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import type { MealPlanPreset } from '../../types';
import { PRESET_MEAL_PLANS } from '../../data/presetMenus';

interface MealPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPlan: (plan: MealPlanPreset) => void;
}

export const MealPlansModal: React.FC<MealPlansModalProps> = ({
  isOpen,
  onClose,
  onApplyPlan,
}) => {
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>('plan_cutting_1800');

  if (!isOpen) return null;

  const toggleExpand = (id: string) => {
    setExpandedPlanId(expandedPlanId === id ? null : id);
  };

  const handleApply = (plan: MealPlanPreset) => {
    if (window.confirm(`האם להחיל את תפריט "${plan.title}" (${plan.totalCalories} קק"ל) על יומן היום שלך?`)) {
      onApplyPlan(plan);
      onClose();
    }
  };

  const mealLabels: Record<string, string> = {
    breakfast: 'ארוחת בוקר',
    lunch: 'ארוחת צהריים',
    dinner: 'ארוחת ערב',
    snack: 'נשנושים',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[480px] max-h-[92vh] bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-surface-container-high">
        {/* Header */}
        <div className="p-4 border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <BookMarked className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-on-surface">תפריטי תזונה מוכנים</h3>
              <p className="text-xs text-outline">תפריטים מאוזנים שנבנו לפי יעדי קלוריות ומקרו</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="סגור"
            className="p-1.5 rounded-full hover:bg-surface-container text-outline hover:text-on-surface transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {PRESET_MEAL_PLANS.map((plan) => {
            const isExpanded = expandedPlanId === plan.id;
            return (
              <div
                key={plan.id}
                className="rounded-2xl border border-surface-container-high bg-surface-container-lowest overflow-hidden transition-all ambient-shadow"
              >
                {/* Plan Main Card Header */}
                <div
                  onClick={() => toggleExpand(plan.id)}
                  className="p-4 cursor-pointer hover:bg-surface-container-low/40 transition-all flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                        {plan.badge}
                      </span>
                      <h4 className="font-headline font-bold text-sm text-on-surface">{plan.title}</h4>
                    </div>
                    <p className="text-xs text-outline leading-relaxed">{plan.description}</p>

                    {/* Macro pills */}
                    <div className="flex items-center gap-2 pt-1 text-xs">
                      <span className="font-bold text-tertiary">{plan.totalCalories} קק"ל</span>
                      <span>•</span>
                      <span className="text-outline">חלבון: {plan.protein}g</span>
                      <span>•</span>
                      <span className="text-outline">פחמימה: {plan.carbs}g</span>
                      <span>•</span>
                      <span className="text-outline">שומן: {plan.fat}g</span>
                    </div>
                  </div>

                  <button className="p-1 text-outline hover:text-on-surface">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {/* Expanded Details & Meals */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-surface-container-high/60 bg-surface-container-low/30 space-y-3">
                    <div className="space-y-2 pt-3">
                      {plan.meals.map((meal) => (
                        <div key={meal.mealType} className="p-2.5 rounded-xl bg-surface-container-lowest border border-surface-container-high/50 text-xs">
                          <span className="font-bold text-primary block mb-1">
                            {mealLabels[meal.mealType] || meal.mealType}
                          </span>
                          <div className="space-y-1 text-outline">
                            {meal.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[11px]">
                                <span>{item.name} ({item.amountDesc})</span>
                                <span className="font-semibold text-on-surface">{item.calories} קק"ל</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Apply Button */}
                    <button
                      onClick={() => handleApply(plan)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-container text-white font-bold text-xs shadow-md shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>החל תפריט זה על היומן של היום</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
