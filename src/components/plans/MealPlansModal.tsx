import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  Flame,
  Plus,
  Trash2,
  Edit2,
  Utensils,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { MealPlanPreset, FoodItem } from '../../types';
import { PRESET_MEAL_PLANS } from '../../data/presetMenus';
import { StorageService } from '../../services/storageService';
import { CreateMealPlanModal } from './CreateMealPlanModal';

interface MealPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPlan: (plan: MealPlanPreset) => void;
  foodDatabase?: FoodItem[];
}

export const MealPlansModal: React.FC<MealPlansModalProps> = ({
  isOpen,
  onClose,
  onApplyPlan,
  foodDatabase = [],
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [customPlans, setCustomPlans] = useState<MealPlanPreset[]>(() =>
    StorageService.getCustomMealPlans()
  );
  const [selectedPlan, setSelectedPlan] = useState<MealPlanPreset | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MealPlanPreset | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentList = activeTab === 'presets' ? PRESET_MEAL_PLANS : customPlans;

  const handleSaveCustomPlan = (newPlan: MealPlanPreset, andApply: boolean = false) => {
    StorageService.saveCustomMealPlan(newPlan);
    const updated = StorageService.getCustomMealPlans();
    setCustomPlans(updated);
    if (andApply) {
      onApplyPlan(newPlan);
    }
  };

  const handleDeleteCustomPlan = (planId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('האם אתה בטוח שברצונך למחוק תפריט זה?')) {
      StorageService.deleteCustomMealPlan(planId);
      setCustomPlans(StorageService.getCustomMealPlans());
      if (selectedPlan?.id === planId) {
        setSelectedPlan(null);
      }
    }
  };

  const handleEditPlan = (plan: MealPlanPreset, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPlan(plan);
    setIsCreateModalOpen(true);
  };

  const mealLabels: Record<string, string> = {
    breakfast: 'ארוחת בוקר',
    lunch: 'ארוחת צהריים',
    dinner: 'ארוחת ערב',
    snack: 'נשנוש',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface rounded-3xl w-full max-w-[480px] max-h-[92vh] flex flex-col shadow-2xl border border-outline-variant/30 overflow-hidden animate-modal-sheet">
        
        {/* Header */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-surface-container-high bg-surface-container-lowest flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-tertiary/15 flex items-center justify-center text-tertiary shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-sm text-on-surface">תפריטי תזונה</h2>
              <p className="text-[10px] text-outline">תפריטים מוכנים או תפריטים מותאמים אישית שבנית</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="סגור"
            className="p-1.5 rounded-xl text-outline hover:bg-surface-container-high hover:text-on-surface transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher & Create Plan Button */}
        <div className="p-3 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex bg-surface-container p-1 rounded-2xl border border-surface-container-high flex-1">
            <button
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'presets'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              תפריטים מומלצים
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'custom'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              התפריטים שלי ({customPlans.length})
            </button>
          </div>

          <button
            onClick={() => {
              setEditingPlan(null);
              setIsCreateModalOpen(true);
            }}
            className="px-3 py-2 rounded-2xl bg-primary text-on-primary font-headline font-bold text-xs flex items-center gap-1.5 shadow-sm hover:opacity-90 active:scale-95 transition-all flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>בנה תפריט</span>
          </button>
        </div>

        {/* Scrollable Plans List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {currentList.length === 0 ? (
            <div className="py-12 text-center bg-surface-container-low/50 rounded-3xl border border-surface-container-high p-6">
              <Utensils className="w-8 h-8 text-outline mx-auto mb-2 opacity-50" />
              <h4 className="font-bold text-xs text-on-surface mb-1">עדיין אין תפריטים מותאמים אישית</h4>
              <p className="text-[11px] text-outline mb-4">בנה תפריט תזונה מותאם משלך בדיוק לפי העדפותיך</p>
              <button
                onClick={() => {
                  setEditingPlan(null);
                  setIsCreateModalOpen(true);
                }}
                className="px-4 py-2 rounded-2xl bg-primary text-on-primary font-bold text-xs inline-flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>צור תפריט ראשון עכשיו</span>
              </button>
            </div>
          ) : (
            currentList.map((plan) => {
              const isSelected = selectedPlan?.id === plan.id;
              const isExpanded = expandedPlanId === plan.id;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`rounded-3xl border transition-all cursor-pointer overflow-hidden ${
                    isSelected
                      ? 'bg-surface-container-lowest border-primary shadow-md ring-1 ring-primary/30'
                      : 'bg-surface-container-lowest border-surface-container-high hover:border-outline-variant/60 shadow-xs'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-headline font-bold text-sm text-on-surface">{plan.title}</h3>
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                            {plan.badge}
                          </span>
                        </div>
                        <p className="text-xs text-outline mt-0.5">{plan.description}</p>
                      </div>

                      {/* Custom Plan actions (Edit / Delete) */}
                      {plan.isCustom && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleEditPlan(plan, e)}
                            className="p-1.5 text-outline hover:text-primary rounded-lg transition-all"
                            title="ערוך תפריט"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteCustomPlan(plan.id, e)}
                            className="p-1.5 text-outline hover:text-error rounded-lg transition-all"
                            title="מחק תפריט"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Macro Badges Row */}
                    <div className="grid grid-cols-4 gap-1.5 bg-surface-container-low p-2.5 rounded-2xl border border-surface-container-high text-center text-xs">
                      <div>
                        <span className="text-[9px] text-outline block">קלוריות</span>
                        <span className="font-headline font-extrabold text-tertiary flex items-center justify-center gap-0.5">
                          <Flame className="w-3 h-3 fill-tertiary" />
                          {plan.totalCalories}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-outline block">חלבון</span>
                        <span className="font-bold text-on-surface">{plan.protein}g</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-outline block">פחמימה</span>
                        <span className="font-bold text-on-surface">{plan.carbs}g</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-outline block">שומן</span>
                        <span className="font-bold text-on-surface">{plan.fat}g</span>
                      </div>
                    </div>

                    {/* Expand Breakdown Toggle */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-surface-container-high text-xs">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedPlanId(isExpanded ? null : plan.id);
                        }}
                        className="text-[11px] font-bold text-outline hover:text-on-surface flex items-center gap-1"
                      >
                        <span>{isExpanded ? 'הסתר פירוט ארוחות' : 'הצג פירוט ארוחות ומאכלים'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onApplyPlan(plan);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>החל על היומן</span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Meals Breakdown List */}
                  {isExpanded && (
                    <div className="p-3 bg-surface-container-low/70 border-t border-surface-container-high space-y-2 animate-in fade-in duration-150">
                      {plan.meals.map((meal) => (
                        <div key={meal.mealType} className="p-2 rounded-xl bg-surface-container-lowest border border-surface-container-high text-xs">
                          <span className="font-bold text-primary block text-[11px] mb-1">
                            {mealLabels[meal.mealType] || meal.mealType}
                          </span>
                          <div className="space-y-1">
                            {meal.items.map((item, i) => (
                              <div key={i} className="flex justify-between text-[11px] text-outline">
                                <span>• {item.name} ({item.amountDesc || `${item.grams}g`})</span>
                                <span className="font-medium text-on-surface">{item.calories} קק"ל</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-container-lowest border-t border-surface-container-high flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface font-headline font-bold text-xs transition-all border border-surface-container-high"
          >
            סגור
          </button>
        </div>

      </div>

      {/* Custom Meal Plan Builder Submodal */}
      <CreateMealPlanModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingPlan(null);
        }}
        foodDatabase={foodDatabase}
        onSavePlan={handleSaveCustomPlan}
        existingPlan={editingPlan}
      />
    </div>
  );
};
