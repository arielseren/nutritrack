import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  Plus,
  Trash2,
  Edit2,
  Utensils,
  ChevronDown,
  ChevronUp,
  Calendar,
  ShoppingCart,
  Zap,
} from 'lucide-react';
import type { MealPlanPreset, FoodItem, WeeklyMealPlanSchedule } from '../../types';
import { PRESET_MEAL_PLANS } from '../../data/presetMenus';
import { StorageService } from '../../services/storageService';
import { CreateMealPlanModal } from './CreateMealPlanModal';
import { WeeklyGroceryModal } from './WeeklyGroceryModal';

interface MealPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPlan: (plan: MealPlanPreset) => void;
  onApplyFullWeek?: (schedule: WeeklyMealPlanSchedule) => void;
  foodDatabase?: FoodItem[];
  isInline?: boolean;
}

export const MealPlansModal: React.FC<MealPlansModalProps> = ({
  isOpen,
  onClose,
  onApplyPlan,
  onApplyFullWeek,
  foodDatabase = [],
  isInline = false,
}) => {
  const [activeTab, setActiveTab] = useState<'weekly' | 'presets' | 'custom'>('weekly');
  const [customPlans, setCustomPlans] = useState<MealPlanPreset[]>(() =>
    StorageService.getCustomMealPlans()
  );
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyMealPlanSchedule>(() =>
    StorageService.getWeeklyMealPlan()
  );

  // Modals & Drawers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MealPlanPreset | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [expandedDayIdx, setExpandedDayIdx] = useState<number | null>(null);
  const [isGroceryModalOpen, setIsGroceryModalOpen] = useState(false);

  // Day Assignment Sub-Modal
  const [assigningDayIdx, setAssigningDayIdx] = useState<number | null>(null);

  if (!isOpen) return null;

  const currentList = activeTab === 'presets' ? PRESET_MEAL_PLANS : customPlans;
  const allAvailablePlans = [...PRESET_MEAL_PLANS, ...customPlans];

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
    }
  };

  const handleEditPlan = (plan: MealPlanPreset, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPlan(plan);
    setIsCreateModalOpen(true);
  };

  const handleAssignPlanToDay = (dayIdx: number, plan: MealPlanPreset | null) => {
    const updated = StorageService.assignPlanToWeeklyDay(dayIdx, plan);
    setWeeklySchedule({ ...updated });
    setAssigningDayIdx(null);
  };

  const handleApplyPresetTemplateToWeek = (templateKey: 'cut' | 'bulk' | 'mediterranean') => {
    let selectedPreset: MealPlanPreset | undefined;
    if (templateKey === 'cut') {
      selectedPreset = PRESET_MEAL_PLANS.find((p) => p.id === 'cut_1800') || PRESET_MEAL_PLANS[0];
    } else if (templateKey === 'bulk') {
      selectedPreset = PRESET_MEAL_PLANS.find((p) => p.id === 'bulk_2400') || PRESET_MEAL_PLANS[1];
    } else {
      selectedPreset = PRESET_MEAL_PLANS.find((p) => p.id === 'mediterranean_2000') || PRESET_MEAL_PLANS[2];
    }

    if (!selectedPreset) return;

    const newSched: WeeklyMealPlanSchedule = {};
    const dayNames = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'];

    for (let i = 0; i < 7; i++) {
      newSched[i] = {
        dayOfWeek: i,
        dayName: dayNames[i],
        planId: selectedPreset.id,
        planTitle: selectedPreset.title,
        planBadge: selectedPreset.badge,
        totalCalories: selectedPreset.totalCalories,
        protein: selectedPreset.protein,
        carbs: selectedPreset.carbs,
        fat: selectedPreset.fat,
        meals: selectedPreset.meals,
      };
    }

    StorageService.saveWeeklyMealPlan(newSched);
    setWeeklySchedule(newSched);
  };

  const handleDuplicateDayPlan = (sourceDayIdx: number, targetDayIdx: number) => {
    const source = weeklySchedule[sourceDayIdx];
    if (!source || !source.planId) return;

    const targetPlan = allAvailablePlans.find((p) => p.id === source.planId);
    if (targetPlan) {
      handleAssignPlanToDay(targetDayIdx, targetPlan);
    }
  };

  const handleApplyFullWeekToDiary = () => {
    if (onApplyFullWeek) {
      onApplyFullWeek(weeklySchedule);
      if (!isInline) onClose();
    }
  };

  const mealLabels: Record<string, string> = {
    breakfast: 'ארוחת בוקר',
    lunch: 'ארוחת צהריים',
    dinner: 'ארוחת ערב',
    snack: 'נשנוש',
  };

  const assignedDaysCount = Object.values(weeklySchedule).filter((d) => d.planId).length;

  const contentMarkup = (
    <div className={`bg-surface w-full max-w-[480px] sm:max-w-xl flex flex-col border border-surface-container-high overflow-hidden ${
      isInline ? 'rounded-2xl sm:rounded-3xl shadow-xs animate-page-enter min-h-[calc(100dvh-13rem)]' : 'rounded-t-3xl sm:rounded-3xl shadow-2xl h-[94dvh] sm:h-[88dvh] sm:max-h-[90dvh] animate-modal-sheet modal-safe-bottom'
    }`}>
      
      {/* Header */}
      <div className="px-5 py-3.5 flex items-center justify-between border-b border-surface-container-high bg-surface-container-lowest flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-tertiary/15 flex items-center justify-center text-tertiary shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-headline font-bold text-sm text-on-surface">תפריטים ותכנון שבועי</h2>
            <p className="text-[10px] text-outline">תכנן את הארוחות לשבוע הקרוב ונהל תפריטים אישיים</p>
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

      {/* 3-Tab Switcher */}
      <div className="p-3 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between gap-2 flex-shrink-0">
        <div className="flex bg-surface-container p-1 rounded-2xl border border-surface-container-high flex-1">
          <button
            onClick={() => setActiveTab('weekly')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeTab === 'weekly'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>תכנון שבועי</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'presets'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            מומלצים
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeTab === 'custom'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            <span>שלי</span>
            {customPlans.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">
                {customPlans.length}
              </span>
            )}
          </button>
        </div>

        {activeTab !== 'weekly' && (
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
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: מתכנן תפריט שבועי (WEEKLY MEAL PLANNER) */}
      {/* ========================================================================= */}
      {activeTab === 'weekly' && (
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1 text-xs animate-in fade-in duration-150">
          
          {/* Action Toolbar */}
          <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container-high space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-on-surface block">
                  התפריט המתוכנן לשבוע הקרוב
                </span>
                <span className="text-[10px] text-outline">
                  שובצו {assignedDaysCount} מתוך 7 ימים
                </span>
              </div>

              <button
                onClick={() => setIsGroceryModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs flex items-center gap-1.5 border border-surface-container-high transition-all"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>רשימת קניות 🛒</span>
              </button>
            </div>

            {/* Quick Template Presets for Whole Week */}
            <div className="space-y-1 pt-1 border-t border-surface-container-high/60">
              <span className="text-[10px] font-bold text-outline block">שבץ תבנית לכל השבוע בלחיצה:</span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleApplyPresetTemplateToWeek('cut')}
                  className="p-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-[10px] text-center transition-all border border-surface-container-high/50"
                >
                  ✂️ שבוע חיטוב (1,800)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetTemplateToWeek('bulk')}
                  className="p-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-[10px] text-center transition-all border border-surface-container-high/50"
                >
                  💪 מסה נקייה (2,400)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetTemplateToWeek('mediterranean')}
                  className="p-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-[10px] text-center transition-all border border-surface-container-high/50"
                >
                  🌊 ים-תיכוני (2,000)
                </button>
              </div>
            </div>

            {/* Apply Whole Week to Diary Button */}
            {onApplyFullWeek && assignedDaysCount > 0 && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleApplyFullWeekToDiary}
                  className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all"
                >
                  <Zap className="w-4 h-4 stroke-[2.5]" />
                  <span>החל את כל התכנון השבועי על היומן (7 הימים הבאים)</span>
                </button>
              </div>
            )}
          </div>

          {/* 7 Day Cards List */}
          <div className="space-y-2.5">
            {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
              const dayNames = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'];
              const dayPlan = weeklySchedule[dayIdx] || { dayOfWeek: dayIdx, dayName: dayNames[dayIdx] };
              const isAssigned = !!dayPlan.planId;
              const isExpanded = expandedDayIdx === dayIdx;

              return (
                <div
                  key={dayIdx}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isAssigned
                      ? 'bg-surface-container-lowest border-surface-container-high'
                      : 'bg-surface-container-low/60 border-dashed border-surface-container-high/80'
                  }`}
                >
                  {/* Day Card Header */}
                  <div className="p-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                        isAssigned ? 'bg-primary/10 text-primary' : 'bg-surface-container text-outline'
                      }`}>
                        {dayIdx + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-on-surface">
                            {dayNames[dayIdx]}
                          </span>
                          {isAssigned && (
                            <span className="px-1.5 py-0.2 rounded-md bg-primary/10 text-primary font-bold text-[10px]">
                              {dayPlan.planBadge || 'שובץ'}
                            </span>
                          )}
                        </div>

                        {isAssigned ? (
                          <div className="flex items-center gap-2 text-[10px] text-outline mt-0.5 truncate">
                            <span className="font-bold text-tertiary truncate">{dayPlan.planTitle}</span>
                            <span>•</span>
                            <span>{dayPlan.totalCalories} קק"ל</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-outline block">טרם שובץ תפריט</span>
                        )}
                      </div>
                    </div>

                    {/* Day Action Buttons */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {isAssigned ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setExpandedDayIdx(isExpanded ? null : dayIdx)}
                            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface transition-all"
                            title="הצג פירוט ארוחות"
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => setAssigningDayIdx(dayIdx)}
                            className="px-2 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold text-[10px] transition-all"
                          >
                            החלף
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAssignPlanToDay(dayIdx, null)}
                            className="p-1.5 rounded-lg hover:bg-error-container/20 text-outline hover:text-error transition-all"
                            title="נקה יום זה"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAssigningDayIdx(dayIdx)}
                          className="px-3 py-1.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-1 shadow-xs hover:opacity-90 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>בחר תפריט</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Meals View */}
                  {isExpanded && dayPlan.meals && (
                    <div className="p-3 border-t border-surface-container-high/60 bg-surface-container-low/40 space-y-2 text-[11px] animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-[10px] text-outline pb-1 border-b border-surface-container-high/40">
                        <span>פירוט 4 הארוחות:</span>
                        <span>ח: {dayPlan.protein}g | פ: {dayPlan.carbs}g | ש: {dayPlan.fat}g</span>
                      </div>

                      <div className="space-y-1.5">
                        {dayPlan.meals.map((meal) => (
                          <div key={meal.mealType} className="p-2 rounded-xl bg-surface-container-lowest border border-surface-container-high/50">
                            <span className="font-bold text-[11px] text-primary block mb-0.5">
                              {mealLabels[meal.mealType] || meal.mealType}
                            </span>
                            <div className="space-y-0.5 text-[10px] text-outline">
                              {meal.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between">
                                  <span>• {item.name} ({item.amountDesc})</span>
                                  <span>{item.calories} קק"ל</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Duplicate to next days button */}
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[10px] text-outline font-medium">שכפל תפריט זה:</span>
                        <div className="flex gap-1">
                          {[0, 1, 2, 3, 4, 5, 6].filter((i) => i !== dayIdx).map((targetIdx) => (
                            <button
                              key={targetIdx}
                              type="button"
                              onClick={() => handleDuplicateDayPlan(dayIdx, targetIdx)}
                              className="px-1.5 py-0.5 rounded bg-surface-container text-outline hover:text-primary font-bold text-[9px] transition-all"
                              title={`שכפל ל${dayNames[targetIdx]}`}
                            >
                              {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'][targetIdx]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2 & 3: תפריטים מוכנים / התפריטים שלי (PRESETS & CUSTOM LIST) */}
      {/* ========================================================================= */}
      {activeTab !== 'weekly' && (
        <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs animate-in fade-in duration-150">
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
                          aria-label="ערוך תפריט"
                          className="p-1.5 rounded-lg text-outline hover:bg-surface-container hover:text-primary transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteCustomPlan(plan.id, e)}
                          aria-label="מחק תפריט"
                          className="p-1.5 rounded-lg text-outline hover:bg-error-container/20 hover:text-error transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Macro Badges Row */}
                  <div className="grid grid-cols-4 gap-1.5 bg-surface-container-low p-2 rounded-xl text-center">
                    <div>
                      <span className="text-[9px] text-outline block">קלוריות</span>
                      <span className="font-bold text-xs text-tertiary">{plan.totalCalories}</span>
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

                  {/* Expand / Collapse Meals Details */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-surface-container-high space-y-2 animate-in fade-in duration-150">
                      {plan.meals.map((meal) => (
                        <div key={meal.mealType} className="p-2 rounded-xl bg-surface-container-low/50">
                          <span className="font-bold text-[11px] text-primary block mb-1">
                            {mealLabels[meal.mealType] || meal.mealType}
                          </span>
                          <div className="space-y-1">
                            {meal.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-[11px] text-outline">
                                <span>• {item.name} ({item.amountDesc})</span>
                                <span>{item.calories} קק"ל</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bottom Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                      className="text-xs text-outline hover:text-on-surface font-semibold flex items-center gap-1 transition-all"
                    >
                      <span>{isExpanded ? 'הסתר פירוט' : 'הצג פירוט ארוחות'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => {
                        onApplyPlan(plan);
                        if (!isInline) onClose();
                      }}
                      className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>החל על יומן היום</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Day Plan Assignment Sub-Modal */}
      {assigningDayIdx !== null && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-surface rounded-3xl w-full max-w-[420px] max-h-[80dvh] flex flex-col shadow-2xl border border-surface-container-high overflow-hidden animate-modal-sheet text-xs">
            <div className="p-4 border-b border-surface-container-high bg-surface-container-low flex items-center justify-between">
              <div>
                <h4 className="font-headline font-bold text-sm text-on-surface">
                  בחר תפריט ל{['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'][assigningDayIdx]}
                </h4>
                <p className="text-[10px] text-outline">בחר מתוך התפריטים המוכנים או התפריטים שבנית</p>
              </div>
              <button
                onClick={() => setAssigningDayIdx(null)}
                className="p-1 text-outline hover:text-on-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 overflow-y-auto space-y-2 flex-1">
              {allAvailablePlans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => handleAssignPlanToDay(assigningDayIdx, plan)}
                  className="p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high/60 cursor-pointer transition-all flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-on-surface">{plan.title}</span>
                      <span className="px-1.5 py-0.2 rounded-md bg-primary/10 text-primary text-[10px] font-bold">
                        {plan.badge}
                      </span>
                    </div>
                    <span className="text-[10px] text-outline">
                      {plan.totalCalories} קק"ל | ח: {plan.protein}g | פ: {plan.carbs}g | ש: {plan.fat}g
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-primary flex-shrink-0">
                    שבץ ליום זה ←
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grocery List Modal */}
      <WeeklyGroceryModal
        isOpen={isGroceryModalOpen}
        onClose={() => setIsGroceryModalOpen(false)}
        weeklySchedule={weeklySchedule}
      />

      {/* Create / Edit Custom Plan Modal */}
      <CreateMealPlanModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingPlan(null);
        }}
        existingPlan={editingPlan}
        onSavePlan={handleSaveCustomPlan}
        foodDatabase={foodDatabase}
      />

    </div>
  );

  if (isInline) {
    return contentMarkup;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {contentMarkup}
    </div>
  );
};
