import React, { useState, useMemo } from 'react';
import {
  X,
  ShoppingCart,
  Check,
  CheckCheck,
  Share2,
} from 'lucide-react';
import type { WeeklyMealPlanSchedule } from '../../types';

interface WeeklyGroceryModalProps {
  isOpen: boolean;
  onClose: () => void;
  weeklySchedule: WeeklyMealPlanSchedule;
}

interface GroceryItem {
  id: string;
  name: string;
  totalGrams: number;
  occurrences: number;
  units: string[];
}

export const WeeklyGroceryModal: React.FC<WeeklyGroceryModalProps> = ({
  isOpen,
  onClose,
  weeklySchedule,
}) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  // Aggregate items from all 7 days
  const groceryItems = useMemo(() => {
    const map: Record<string, GroceryItem> = {};

    Object.values(weeklySchedule).forEach((day) => {
      if (day.meals) {
        day.meals.forEach((meal) => {
          meal.items.forEach((item) => {
            const key = item.name.trim().toLowerCase();
            if (!map[key]) {
              map[key] = {
                id: key,
                name: item.name.trim(),
                totalGrams: 0,
                occurrences: 0,
                units: [],
              };
            }
            map[key].totalGrams += item.grams || 100;
            map[key].occurrences += 1;
            if (item.amountDesc && !map[key].units.includes(item.amountDesc)) {
              map[key].units.push(item.amountDesc);
            }
          });
        });
      }
    });

    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name, 'he'));
  }, [weeklySchedule]);

  if (!isOpen) return null;

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyList = () => {
    if (groceryItems.length === 0) return;
    const text = [
      '🛒 *רשימת קניות שבועית - NutriTrack*',
      '--------------------------------',
      ...groceryItems.map((item) => {
        const isChecked = checkedItems[item.id] ? '✅' : '▫️';
        const gramsStr = item.totalGrams >= 1000 ? `${(item.totalGrams / 1000).toFixed(1)} ק"ג` : `${item.totalGrams} גרם`;
        return `${isChecked} ${item.name} - ${gramsStr} (${item.occurrences} ארוחות)`;
      }),
      '--------------------------------',
      'נבנה באמצעות NutriTrack Daily Nutrition Tracker 🥗',
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPct = groceryItems.length > 0 ? Math.round((completedCount / groceryItems.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg sm:max-w-xl max-h-[92dvh] bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-surface-container-high animate-modal-sheet modal-safe-bottom">
        
        {/* Header */}
        <div className="p-4 border-b border-surface-container-high bg-surface-container-low flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-on-surface">רשימת קניות שבועית</h3>
              <p className="text-[11px] text-outline">
                מחושב אוטומטית מכל המאכלים שתוכננו לשבוע ({groceryItems.length} מצרכים)
              </p>
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

        {/* Progress Bar */}
        {groceryItems.length > 0 && (
          <div className="px-4 py-2.5 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1">
              <span className="font-bold text-outline text-[11px]">נאספו בסופר:</span>
              <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            <span className="font-bold text-primary text-[11px]">
              {completedCount} מתוך {groceryItems.length} ({progressPct}%)
            </span>
          </div>
        )}

        {/* Item List */}
        <div className="p-4 space-y-2 overflow-y-auto flex-1 text-xs">
          {groceryItems.length === 0 ? (
            <div className="py-12 text-center text-outline space-y-2">
              <ShoppingCart className="w-10 h-10 mx-auto opacity-40 text-outline" />
              <p className="text-sm font-bold text-on-surface">טרם שובצו תפריטים לשבוע</p>
              <p className="text-xs text-outline max-w-[260px] mx-auto">
                שבץ תפריטים בימי השבוע במתכנן כדי לקבל רשימת קניות מרוכזת אוטומטית
              </p>
            </div>
          ) : (
            groceryItems.map((item) => {
              const isChecked = !!checkedItems[item.id];
              const gramsStr = item.totalGrams >= 1000
                ? `${(item.totalGrams / 1000).toFixed(1)} ק"ג`
                : `${item.totalGrams} גרם`;

              return (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isChecked
                      ? 'bg-surface-container/50 border-surface-container-high opacity-60 line-through'
                      : 'bg-surface-container-low hover:bg-surface-container border-surface-container-high/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                        isChecked
                          ? 'bg-primary border-primary text-white'
                          : 'border-outline/40 bg-surface-container-lowest'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div className="min-w-0">
                      <span className={`font-bold text-xs block truncate ${
                        isChecked ? 'text-outline' : 'text-on-surface'
                      }`}>
                        {item.name}
                      </span>
                      <span className="text-[10px] text-outline block">
                        ל-{item.occurrences} ארוחות שבועיות
                      </span>
                    </div>
                  </div>

                  <div className="text-left flex-shrink-0">
                    <span className="font-bold text-xs text-primary block">{gramsStr}</span>
                    {item.units.length > 0 && (
                      <span className="text-[9px] text-outline truncate block max-w-[120px]">
                        {item.units.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        {groceryItems.length > 0 && (
          <div className="p-3.5 bg-surface-container-lowest border-t border-surface-container-high flex gap-2">
            <button
              onClick={handleCopyList}
              className="flex-1 py-3 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs flex items-center justify-center gap-2 border border-surface-container-high transition-all active:scale-98"
            >
              {copied ? (
                <>
                  <CheckCheck className="w-4 h-4 text-primary" />
                  <span className="text-primary">הרשימה הועתקה ללוח!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-primary" />
                  <span>העתק רשימה ל-WhatsApp / פתקים</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
