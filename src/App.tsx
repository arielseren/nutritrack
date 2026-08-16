import { useState, useEffect } from 'react';
import type { FoodItem, MealType, MealPlanPreset, UserProfile, DayLog, NotificationItem } from './types';
import { StorageService } from './services/storageService';
import { getTodayDateString } from './services/nutritionCalculator';
import { NotificationService } from './services/notificationService';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import type { NavTab } from './components/layout/BottomNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { DayDiaryView } from './components/diary/DayDiaryView';
import { FoodSearchModal } from './components/search/FoodSearchModal';
import { BarcodeScannerModal } from './components/scanner/BarcodeScannerModal';
import { CustomFoodModal } from './components/custom/CustomFoodModal';
import { MealPlansModal } from './components/plans/MealPlansModal';
import { ProfileSettingsModal } from './components/profile/ProfileSettingsModal';
import { NotificationsModal } from './components/notifications/NotificationsModal';
import { DatePickerModal } from './components/common/DatePickerModal';
import { AuthModal } from './components/auth/AuthModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function App() {
  // Main state
  const [userProfile, setUserProfile] = useState<UserProfile>(() => StorageService.getProfile());
  const [currentDate, setCurrentDate] = useState<string>(() => getTodayDateString());
  const [dayLogs, setDayLogs] = useState<Record<string, DayLog>>(() => StorageService.getAllDayLogs());
  const [foodDatabase, setFoodDatabase] = useState<FoodItem[]>(() => StorageService.getFoodDatabase());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => StorageService.getNotifications());
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Modal open states
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchDefaultMealType, setSearchDefaultMealType] = useState<MealType>('lunch');
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [isCustomFoodModalOpen, setIsCustomFoodModalOpen] = useState(false);
  const [isMealPlansOpen, setIsMealPlansOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isDatePickerModalOpen, setIsDatePickerModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Register ServiceWorker and setup reminder checks
  useEffect(() => {
    NotificationService.registerServiceWorker();

    // Check reminders every 60 seconds
    const interval = setInterval(() => {
      const currentLog = StorageService.getDayLog(getTodayDateString());
      NotificationService.checkAndTriggerReminders(
        !!userProfile.waterReminderEnabled && !!userProfile.pushNotificationsEnabled,
        currentLog.waterGlasses,
        userProfile.dailyWaterTargetGlasses,
        {
          breakfast: userProfile.mealReminderBreakfast,
          lunch: userProfile.mealReminderLunch,
          dinner: userProfile.mealReminderDinner,
        }
      );
    }, 60000);

    return () => clearInterval(interval);
  }, [userProfile]);

  // Sync theme with html class
  useEffect(() => {
    if (userProfile.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userProfile.theme]);

  const handleToggleTheme = () => {
    const nextTheme: 'light' | 'dark' = userProfile.theme === 'dark' ? 'light' : 'dark';
    const updated: UserProfile = { ...userProfile, theme: nextTheme };
    setUserProfile(updated);
    StorageService.saveProfile(updated);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    showToast(nextTheme === 'dark' ? 'מצב לילה הופעל 🌙' : 'מצב יום הופעל ☀️');
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const currentDayLog: DayLog = dayLogs[currentDate] || {
    date: currentDate,
    waterGlasses: 0,
    meals: { breakfast: [], lunch: [], dinner: [], snack: [] },
  };

  const handleOpenQuickAdd = (mealType: MealType = 'lunch') => {
    setSearchDefaultMealType(mealType);
    setIsSearchModalOpen(true);
  };

  const handleLogFood = (
    mealType: MealType,
    food: FoodItem,
    grams: number,
    amount: number,
    unit: string
  ) => {
    const updated = StorageService.addFoodToMeal(currentDate, mealType, food, grams, amount, unit);
    setDayLogs({ ...dayLogs, [currentDate]: updated });
    showToast(`נוסף בהצלחה: ${food.name} (${Math.round((food.calories * grams) / 100)} קק"ל)`);
  };

  const handleDeleteItem = (mealType: MealType, logId: string) => {
    const updated = StorageService.removeFoodFromMeal(currentDate, mealType, logId);
    setDayLogs({ ...dayLogs, [currentDate]: updated });
    showToast('המאכל הוסר מהיומן');
  };

  const handleUpdateWater = (newCount: number) => {
    const updated = StorageService.updateWater(currentDate, newCount);
    setDayLogs({ ...dayLogs, [currentDate]: updated });
  };

  const handleApplyMealPlan = (plan: MealPlanPreset) => {
    plan.meals.forEach((planMeal) => {
      planMeal.items.forEach((item) => {
        const food = foodDatabase.find((f) => f.id === item.foodId) || {
          id: item.foodId,
          name: item.name,
          calories: Math.round((item.calories / item.grams) * 100),
          protein: Math.round((item.protein / item.grams) * 100),
          carbs: Math.round((item.carbs / item.grams) * 100),
          fat: Math.round((item.fat / item.grams) * 100),
          servingUnit: item.amountDesc,
          servingGrams: item.grams,
          category: 'proteins' as const,
        };

        StorageService.addFoodToMeal(
          currentDate,
          planMeal.mealType,
          food,
          item.grams,
          1,
          item.amountDesc
        );
      });
    });

    setDayLogs(StorageService.getAllDayLogs());
    showToast(`תפריט "${plan.title}" הוחל בהצלחה על יומן היום! 🎉`);
  };

  const handleSaveProfile = (newProfile: UserProfile) => {
    StorageService.saveProfile(newProfile);
    setUserProfile(newProfile);
    showToast('הפרופיל והיעדים עודכנו בהצלחה!');
  };

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    StorageService.saveProfile(loggedInUser);
    setUserProfile(loggedInUser);
    showToast(`ברוך הבא, ${loggedInUser.name}! 👋`);
  };

  const handleLogout = () => {
    const guest = StorageService.logout();
    setUserProfile(guest);
    setIsProfileModalOpen(false);
    showToast('התנתקת מהחשבון בהצלחה');
  };

  const handleSaveCustomFood = (newFood: Omit<FoodItem, 'id'>) => {
    const saved = StorageService.saveCustomFood(newFood);
    setFoodDatabase(StorageService.getFoodDatabase());
    showToast(`מאכל חדש נוסף למאגר: ${saved.name}`);
  };

  const handleToggleFavorite = (foodId: string) => {
    StorageService.toggleFavorite(foodId);
    setFoodDatabase(StorageService.getFoodDatabase());
  };

  const handleMarkNotificationsAsRead = () => {
    StorageService.markNotificationsAsRead();
    setNotifications(StorageService.getNotifications());
  };

  const handleExportData = () => {
    const jsonStr = StorageService.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutritrack_backup_${getTodayDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('קובץ הגיבוי הורד בהצלחה!');
  };

  const handleImportData = (jsonStr: string) => {
    const success = StorageService.importAllData(jsonStr);
    if (success) {
      setUserProfile(StorageService.getProfile());
      setDayLogs(StorageService.getAllDayLogs());
      setFoodDatabase(StorageService.getFoodDatabase());
      showToast('הנתונים יובאו בהצלחה!');
    } else {
      showToast('שגיאה בייבוא הנתונים. ודא שמבנה ה-JSON תקין.', 'error');
    }
  };

  const handleResetData = () => {
    StorageService.resetAllData();
    setUserProfile(StorageService.getProfile());
    setDayLogs(StorageService.getAllDayLogs());
    setFoodDatabase(StorageService.getFoodDatabase());
    setNotifications(StorageService.getNotifications());
    showToast('הנתונים אופסו לברירת המחדל');
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col antialiased selection:bg-primary-container selection:text-on-primary-container">
      {/* Top Header */}
      <Header
        currentDate={currentDate}
        onOpenDatePicker={() => setIsDatePickerModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        unreadNotificationsCount={unreadNotifsCount}
        userName={userProfile.name}
        isLoggedIn={userProfile.isLoggedIn !== false}
        currentTheme={userProfile.theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[480px] mx-auto px-4 pt-3 pb-24">
        {activeTab === 'dashboard' && (
          <DashboardView
            userProfile={userProfile}
            dayLog={currentDayLog}
            onOpenQuickAdd={() => handleOpenQuickAdd('lunch')}
            onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
            onOpenMealPlans={() => setIsMealPlansOpen(true)}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onNavigateToDiary={() => setActiveTab('diary')}
            onUpdateWater={handleUpdateWater}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {activeTab === 'diary' && (
          <DayDiaryView
            currentDate={currentDate}
            dayLog={currentDayLog}
            userProfile={userProfile}
            onDateChange={(newDate) => setCurrentDate(newDate)}
            onOpenDatePicker={() => setIsDatePickerModalOpen(true)}
            onAddFoodToMeal={(mealType) => handleOpenQuickAdd(mealType)}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {activeTab === 'plans' && (
          <div className="space-y-4">
            <div className="pt-2">
              <h2 className="font-headline text-2xl font-bold text-on-surface">תפריטי תזונה מוכנים</h2>
              <p className="text-xs text-outline">בחר תפריט מומלץ והחל אותו על היומן שלך בלחיצה אחת</p>
            </div>
            <MealPlansModal
              isOpen={true}
              onClose={() => setActiveTab('dashboard')}
              onApplyPlan={handleApplyMealPlan}
            />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="pt-2">
              <h2 className="font-headline text-2xl font-bold text-on-surface">פרופיל והגדרות</h2>
              <p className="text-xs text-outline">נהל את יעדי הקלוריות, המאקרו, ההתראות והאבטחה שלך</p>
            </div>
            <ProfileSettingsModal
              isOpen={true}
              onClose={() => setActiveTab('dashboard')}
              userProfile={userProfile}
              onSaveProfile={handleSaveProfile}
              onExportData={handleExportData}
              onImportData={handleImportData}
              onResetData={handleResetData}
              onLogout={handleLogout}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-on-surface text-surface text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-primary-container" />
          ) : (
            <AlertCircle className="w-4 h-4 text-error" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenQuickAdd={() => handleOpenQuickAdd('lunch')}
      />

      {/* Modals */}
      <FoodSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        foodDatabase={foodDatabase}
        defaultMealType={searchDefaultMealType}
        onLogFood={handleLogFood}
        onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
        onOpenCustomFoodModal={() => setIsCustomFoodModalOpen(true)}
        onToggleFavorite={handleToggleFavorite}
      />

      <BarcodeScannerModal
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        foodDatabase={foodDatabase}
        defaultMealType={searchDefaultMealType}
        onLogFood={handleLogFood}
      />

      <CustomFoodModal
        isOpen={isCustomFoodModalOpen}
        onClose={() => setIsCustomFoodModalOpen(false)}
        onSaveCustomFood={handleSaveCustomFood}
      />

      {activeTab !== 'plans' && (
        <MealPlansModal
          isOpen={isMealPlansOpen}
          onClose={() => setIsMealPlansOpen(false)}
          onApplyPlan={handleApplyMealPlan}
        />
      )}

      {activeTab !== 'profile' && (
        <ProfileSettingsModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          userProfile={userProfile}
          onSaveProfile={handleSaveProfile}
          onExportData={handleExportData}
          onImportData={handleImportData}
          onResetData={handleResetData}
          onLogout={handleLogout}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
      )}

      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkNotificationsAsRead}
      />

      <DatePickerModal
        isOpen={isDatePickerModalOpen}
        onClose={() => setIsDatePickerModalOpen(false)}
        currentDate={currentDate}
        onSelectDate={(date) => setCurrentDate(date)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={userProfile}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default App;
