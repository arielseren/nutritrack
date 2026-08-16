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
  isInline?: boolean;
}

export const MealPlansModal: React.FC<MealPlansModalProps> = ({
  isOpen,
  onClose,
  onApplyPlan,
  foodDatabase = [],
  isInline = false,
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

  const contentMarkup = (
    <div className={`bg-surface rounded-3xl w-full max-w-[480px] flex flex-col border border-surface-container-high overflow-hidden ${
      isInline ? 'shadow-xs animate-page-enter' : 'shadow-2xl max-h-[90dvh] animate-modal-sheet'
    }`}>
      
      {/* Header */}
      <div className="px-5 py-3.5 flex items-center justify-between border-b border-surface-container-high bg-surface-container-lowest flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-tertiary/15 flex items-center justify-center text-tertiary shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-headline font-bold text-sm text-on-surface">תפריטי תזונה</h2>
            <p className="text-[10px] text-outline">תפריטים מומלצים או תפריטים שבנית בהתאמה אישית</p>
          </div>
        </div>
        {!isInline && (
          <button
            onClick={onClose}
            aria-label="סגור"
            className="p-1.5 rounded-xl text-outline hover:bg-surface-container-high hover:text-on-surface transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}
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
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeTab === 'custom'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            <span>התפריטים שלי</span>
            {customPlans.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">
                {customPlans.length}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={() => {
            setEditingPlan(null);
            setIsCreateModalOpen(true);
          }}
          className="px-3 py-1.5 rounded-2xl bg-primary text-on-primary font-bold text-xs flex items-center gap-1 shadow-sm hover:opacity-90 active:scale-95 transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>בנה תפריט</span>
        </button>
      </div>

      {/* List of Plans */}
      <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
        {currentList.length === 0 ? (
          <div className="py-12 text-center text-outline space-y-3">
            <Utensils className="w-10 h-10 mx-auto opacity-30" />
            <p className="text-sm font-bold text-on-surface">עדיין לא בנית תפריטים מותאמים אישית</p>
            <p className="text-xs max-w-xs mx-auto">
              תוכל להרכיב תפריט יומי עם המאכלים והכמויות המדויקות שאתה אוהב, ולשמור אותו לשימוש מהיר.
            </p>
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
            const isExpanded = expandedPlanId === plan.id;
            return (
              <div
                key={plan.id}
                className="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container-high hover:border-primary/40 transition-all space-y-3"
              >
                {/* Top Info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold text-[10px]">
                        {plan.badge}
                      </span>
                      {plan.isCustom && (
                        <span className="px-1.5 py-0.5 rounded-md bg-tertiary/10 text-tertiary font-bold text-[10px]">
                          אישי שלי
                        </span>
                      )}
                    </div>
                    <h3 className="font-headline font-bold text-sm text-on-surface truncate">
                      {plan.title}
                    </h3>
                    <p className="text-[11px] text-outline line-clamp-2 mt-0.5">
                      {plan.description}
                    </p>
                  </div>

                  {plan.isCustom && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => handleEditPlan(plan, e)}
                        title="ערוך תפריט"
                        className="p-1.5 rounded-xl hover:bg-surface-container text-outline hover:text-primary transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteCustomPlan(plan.id, e)}
                        title="מחק תפריט"
                        className="p-1.5 rounded-xl hover:bg-error-container/20 text-outline hover:text-error transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Macro Summary Chips */}
                <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-center">
                  <div>
                    <span className="text-[9px] text-outline block">קלוריות</span>
                    <span className="font-bold text-xs text-tertiary flex items-center justify-center gap-0.5">
                      <Flame className="w-3 h-3 inline" />
                      {plan.totalCalories}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-outline block">חלבון</span>
                    <span className="font-bold text-xs text-on-surface">{plan.protein}g</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-outline block">פחמימות</span>
                    <span className="font-bold text-xs text-on-surface">{plan.carbs}g</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-outline block">שומן</span>
                    <span className="font-bold text-xs text-on-surface">{plan.fat}g</span>
                  </div>
                </div>

                {/* Actions: Toggle Details & Apply */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                    className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface font-bold text-xs flex items-center gap-1 transition-all"
                  >
                    <span>{isExpanded ? 'הסתר פירוט' : 'הצג פירוט'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => {
                      onApplyPlan(plan);
                      if (!isInline) onClose();
                    }}
                    className="flex-1 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-headline font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>החל תפריט על יומן היום</span>
                  </button>
                </div>

                {/* Expanded Meal Items */}
                {isExpanded && (
                  <div className="pt-2 border-t border-surface-container-high space-y-2 animate-in fade-in duration-150">
                    {plan.meals.map((m, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-surface-container-low border border-surface-container-high/60">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-[11px] text-primary">
                            {mealLabels[m.mealType] || m.mealType}
                          </span>
                          <span className="text-[10px] text-outline">
                            {m.items.reduce((acc, it) => acc + it.calories, 0)} קק"ל
                          </span>
                        </div>
                        <div className="space-y-1">
                          {m.items.map((item, itemIdx) => (
                            <div key={itemIdx} className="flex justify-between text-[11px] text-on-surface">
                              <span>• {item.name} ({item.amountDesc})</span>
                              <span className="text-outline">{item.calories} קק"ל</span>
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
      {!isInline && (
        <div className="p-4 bg-surface-container-lowest border-t border-surface-container-high flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface font-headline font-bold text-xs transition-all border border-surface-container-high"
          >
            סגור
          </button>
        </div>
      )}

    </div>
  );

  return (
    <>
      {isInline ? (
        contentMarkup
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          {contentMarkup}
        </div>
      )}

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
    </>
  );
};
