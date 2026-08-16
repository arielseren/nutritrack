import React from 'react';
import { QrCode, Search, UtensilsCrossed } from 'lucide-react';
import type { DayLog, UserProfile, MealType } from '../../types';
import { calculateDayTotals } from '../../services/nutritionCalculator';
import { CalorieRing } from './CalorieRing';
import { MacroBreakdown } from './MacroBreakdown';
import { WaterTracker } from './WaterTracker';
import { RecentActivity } from './RecentActivity';

interface DashboardViewProps {
  userProfile: UserProfile;
  dayLog: DayLog;
  onOpenQuickAdd: () => void;
  onOpenBarcodeScanner: () => void;
  onOpenMealPlans: () => void;
  onOpenProfile: () => void;
  onNavigateToDiary: () => void;
  onUpdateWater: (glasses: number) => void;
  onDeleteItem: (mealType: MealType, logId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProfile,
  dayLog,
  onOpenQuickAdd,
  onOpenBarcodeScanner,
  onOpenMealPlans,
  onOpenProfile,
  onNavigateToDiary,
  onUpdateWater,
  onDeleteItem,
}) => {
  const totals = calculateDayTotals(dayLog);

  return (
    <div className="space-y-4 pb-4">
      {/* Greeting Header matching Stitch */}
      <section className="flex justify-between items-end pt-1">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">
            שלום, {userProfile.name} 👋
          </h2>
          <p className="text-sm text-outline">
            {totals.totalCalories === 0
              ? 'מוכן להתחיל לתעד את היום שלך?'
              : 'הנה תמונת המצב התזונתית שלך להיום.'}
          </p>
        </div>

        <button
          onClick={onOpenProfile}
          title="ערוך פרופיל"
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary-container text-white font-bold flex items-center justify-center shadow-sm text-sm"
        >
          {userProfile.name.charAt(0) || 'D'}
        </button>
      </section>

      {/* Quick Action Buttons Row */}
      <section className="grid grid-cols-3 gap-2">
        <button
          onClick={onOpenQuickAdd}
          className="p-3 rounded-2xl bg-surface-container-lowest ambient-shadow soft-ui-border flex flex-col items-center gap-1.5 hover:bg-surface-container-low transition-all active:scale-95 text-center"
        >
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-on-surface">חיפוש מאכל</span>
        </button>

        <button
          onClick={onOpenBarcodeScanner}
          className="p-3 rounded-2xl bg-surface-container-lowest ambient-shadow soft-ui-border flex flex-col items-center gap-1.5 hover:bg-surface-container-low transition-all active:scale-95 text-center"
        >
          <div className="w-9 h-9 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center">
            <QrCode className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-on-surface">סורק ברקוד</span>
        </button>

        <button
          onClick={onOpenMealPlans}
          className="p-3 rounded-2xl bg-surface-container-lowest ambient-shadow soft-ui-border flex flex-col items-center gap-1.5 hover:bg-surface-container-low transition-all active:scale-95 text-center"
        >
          <div className="w-9 h-9 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-on-surface">תפריט מוכן</span>
        </button>
      </section>

      {/* Calorie Ring */}
      <CalorieRing
        consumed={totals.totalCalories}
        target={userProfile.dailyCalorieTarget}
        onTargetClick={onOpenProfile}
      />

      {/* Macro Breakdown */}
      <MacroBreakdown
        protein={totals.totalProtein}
        proteinTarget={userProfile.dailyProteinTarget}
        carbs={totals.totalCarbs}
        carbsTarget={userProfile.dailyCarbsTarget}
        fat={totals.totalFat}
        fatTarget={userProfile.dailyFatTarget}
      />

      {/* Water Tracker */}
      <WaterTracker
        glasses={dayLog.waterGlasses}
        targetGlasses={userProfile.dailyWaterTargetGlasses}
        onUpdateGlasses={onUpdateWater}
      />

      {/* Recent Activity */}
      <RecentActivity
        dayLog={dayLog}
        onNavigateToDiary={onNavigateToDiary}
        onDeleteItem={onDeleteItem}
      />
    </div>
  );
};
