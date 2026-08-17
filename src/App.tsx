import { useState, useEffect } from 'react';
import type { FoodItem, MealType, MealPlanPreset, UserProfile, DayLog, NotificationItem, WorkoutDayType, WeeklyMealPlanSchedule, AIParsedFoodItem } from './types';
import { StorageService } from './services/storageService';
import { getTodayDateString, WORKOUT_CONFIGS, calculateLoggingStreak } from './services/nutritionCalculator';
import { NotificationService } from './services/notificationService';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import type { NavTab } from './components/layout/BottomNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { DayDiaryView } from './components/diary/DayDiaryView';
import { FoodSearchModal } from './components/search/FoodSearchModal';
import { CustomFoodModal } from './components/custom/CustomFoodModal';
import { MealPlansModal } from './components/plans/MealPlansModal';
import { ProfileSettingsModal } from './components/profile/ProfileSettingsModal';
import { NotificationsModal } from './components/notifications/NotificationsModal';
import { DatePickerModal } from './components/common/DatePickerModal';
import { AuthModal } from './components/auth/AuthModal';
import { UserGuideModal } from './components/guide/UserGuideModal';
import { WeightProgressModal } from './components/progress/WeightProgressModal';
import { AIHubModal } from './components/ai/AIHubModal';
import { AINaturalLanguageModal } from './components/ai/AINaturalLanguageModal';
import { AIPhotoScannerModal } from './components/ai/AIPhotoScannerModal';
import type { AIScannerTab } from './components/ai/AIPhotoScannerModal';
import { AIMealGeneratorModal } from './components/ai/AIMealGeneratorModal';
import { AICoachModal } from './components/ai/AICoachModal';
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
  const [isCustomFoodModalOpen, setIsCustomFoodModalOpen] = useState(false);
  const [editingCustomFood, setEditingCustomFood] = useState<FoodItem | null>(null);
  const [isMealPlansOpen, setIsMealPlansOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isDatePickerModalOpen, setIsDatePickerModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);
  const [isWeightProgressModalOpen, setIsWeightProgressModalOpen] = useState(false);

  // AI Modals State
  const [isAIHubOpen, setIsAIHubOpen] = useState(false);
  const [isAIVoiceModalOpen, setIsAIVoiceModalOpen] = useState(false);
  const [isAIScannerModalOpen, setIsAIScannerModalOpen] = useState(false);
  const [aiScannerDefaultTab, setAiScannerDefaultTab] = useState<AIScannerTab>('plate_vision');
  const [isAIMealGenModalOpen, setIsAIMealGenModalOpen] = useState(false);
  const [isAICoachModalOpen, setIsAICoachModalOpen] = useState(false);
  const [aiDefaultMealType, setAiDefaultMealType] = useState<MealType>('lunch');

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Register ServiceWorker and setup reminder checks
  useEffect(() => {
    NotificationService.registerServiceWorker();

    // Check reminders every 60 seconds
    const interval = setInterval(() => {
      const todayStr = getTodayDateString();
      const currentLog = StorageService.getDayLog(todayStr, userProfile.id);
      NotificationService.checkAndTriggerReminders(
        !!userProfile.waterReminderEnabled && !!userProfile.pushNotificationsEnabled,
        currentLog.waterGlasses,
        userProfile.dailyWaterTargetGlasses || 8,
        {
          breakfast: userProfile.mealReminderBreakfast,
          lunch: userProfile.mealReminderLunch,
          dinner: userProfile.mealReminderDinner,
        },
        {
          enabled: userProfile.weeklyWeightReminderEnabled && userProfile.pushNotificationsEnabled,
          day: userProfile.weeklyWeightReminderDay,
          time: userProfile.weeklyWeightReminderTime,
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
    const updated = StorageService.addFoodToMeal(
      currentDate,
      mealType,
      food,
      grams,
      amount,
      unit,
      userProfile.id
    );
    setDayLogs({ ...dayLogs, [currentDate]: updated });
    showToast(`נוסף בהצלחה: ${food.name} (${Math.round((food.calories * grams) / 100)} קק"ל)`);
  };

  const handleLogDirectMeal = (
    mealType: MealType,
    name: string,
    calories: number,
    protein: number,
    carbs: number,
    fat: number,
    saveToDb?: boolean
  ) => {
    const updated = StorageService.addDirectItemToMeal(
      currentDate,
      mealType,
      name,
      calories,
      protein,
      carbs,
      fat,
      'מנה',
      userProfile.id
    );
    setDayLogs({ ...dayLogs, [currentDate]: updated });

    if (saveToDb) {
      StorageService.saveCustomFood(
        {
          name: name.trim() || 'מנה אישית',
          calories: Math.round(calories),
          protein: Math.round(protein * 10) / 10,
          carbs: Math.round(carbs * 10) / 10,
          fat: Math.round(fat * 10) / 10,
          servingUnit: 'מנה',
          servingGrams: 100,
          category: 'proteins',
          isCustom: true,
        },
        userProfile.id
      );
      setFoodDatabase(StorageService.getFoodDatabase(userProfile.id));
    }

    showToast(`נוסף ליומן: ${name || 'מנה ישירה'} (${Math.round(calories)} קק"ל) 🎉`);
  };

  const handleDeleteItem = (mealType: MealType, logId: string) => {
    const updated = StorageService.removeFoodFromMeal(currentDate, mealType, logId, userProfile.id);
    setDayLogs({ ...dayLogs, [currentDate]: updated });
    showToast('המאכל הוסר מהיומן');
  };

  const handleUpdateWater = (newCount: number) => {
    const updated = StorageService.updateWater(currentDate, newCount, userProfile.id);
    setDayLogs({ ...dayLogs, [currentDate]: updated });
    // Live update or dismiss notification in the phone's notification tray
    NotificationService.syncWaterStatus(newCount, userProfile.dailyWaterTargetGlasses || 8);
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
          item.amountDesc,
          userProfile.id
        );
      });
    });

    setDayLogs(StorageService.getAllDayLogs(userProfile.id));
    showToast(`תפריט "${plan.title}" הוחל בהצלחה על יומן היום! 🎉`);
  };

  const handleApplyFullWeek = (schedule: WeeklyMealPlanSchedule) => {
    const today = new Date();
    const dayLogsToUpdate: Record<string, DayLog> = { ...dayLogs };

    for (let i = 0; i < 7; i++) {
      const targetDateObj = new Date(today);
      targetDateObj.setDate(today.getDate() + i);
      const dateStr = targetDateObj.toISOString().split('T')[0];
      const dayOfWeek = targetDateObj.getDay();

      const planDay = schedule[dayOfWeek];
      if (planDay && planDay.planId && planDay.meals) {
        const updatedDayLog = StorageService.applyWeeklyDayToCalendarDate(
          dateStr,
          planDay,
          foodDatabase,
          userProfile.id
        );
        dayLogsToUpdate[dateStr] = updatedDayLog;
      }
    }

    setDayLogs(dayLogsToUpdate);
    showToast('התפריט השבועי שובץ והוחל בהצלחה על 7 הימים הקרובים! 🎉');
  };

  const handleUpdateDayWorkout = (
    date: string,
    workoutType: WorkoutDayType,
    burnedCalories?: number,
    title?: string,
    durationMinutes?: number
  ) => {
    const updated = StorageService.setDayWorkout(
      date,
      workoutType,
      burnedCalories,
      title,
      durationMinutes,
      userProfile.id
    );
    setDayLogs({ ...dayLogs, [date]: updated });
    const cfg = WORKOUT_CONFIGS[workoutType];
    showToast(`מצב אימון עודכן: ${cfg.emoji} ${title || cfg.title}`);
  };

  const handleOpenAIScanner = (tab: AIScannerTab = 'plate_vision', mealType: MealType = 'lunch') => {
    setAiScannerDefaultTab(tab);
    setAiDefaultMealType(mealType);
    setIsAIScannerModalOpen(true);
  };

  const handleOpenAIVoice = (mealType: MealType = 'lunch') => {
    setAiDefaultMealType(mealType);
    setIsAIVoiceModalOpen(true);
  };

  const handleOpenAIMealGen = (mealType: MealType = 'dinner') => {
    setAiDefaultMealType(mealType);
    setIsAIMealGenModalOpen(true);
  };

  const handleLogParsedItems = (mealType: MealType, items: AIParsedFoodItem[]) => {
    let updated = dayLogs[currentDate] || StorageService.getDayLog(currentDate, userProfile.id);
    let totalCaloriesAdded = 0;

    items.forEach((item) => {
      const foodItem: FoodItem = {
        id: `ai_item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: item.name,
        calories: Math.round((item.calories / (item.grams || 100)) * 100),
        protein: Math.round(((item.protein / (item.grams || 100)) * 100) * 10) / 10,
        carbs: Math.round(((item.carbs / (item.grams || 100)) * 100) * 10) / 10,
        fat: Math.round(((item.fat / (item.grams || 100)) * 100) * 10) / 10,
        servingUnit: item.amountDesc || `${item.grams} גרם`,
        servingGrams: item.grams || 100,
        category: 'popular',
        isCustom: true,
      };

      updated = StorageService.addFoodToMeal(
        currentDate,
        mealType,
        foodItem,
        item.grams || 100,
        1,
        item.amountDesc || `${item.grams} גרם`,
        userProfile.id
      );
      totalCaloriesAdded += item.calories;
    });

    setDayLogs({ ...dayLogs, [currentDate]: updated });
    showToast(`ה-AI תיעד בהצלחה ${items.length} מאכלים ליומן (${Math.round(totalCaloriesAdded)} קק"ל) 🎉`);
  };

  const handleAdjustDayTargets = (calorieDelta: number) => {
    const newCal = Math.max(1200, (userProfile.dailyCalorieTarget || 2000) + calorieDelta);
    const updated: UserProfile = {
      ...userProfile,
      dailyCalorieTarget: newCal,
    };
    handleSaveProfile(updated);
    showToast(`יעד הקלוריות היומי הותאם ל-${newCal} קק"ל עפ"י המלצת המאמן!`);
  };

  const handleSaveApiKey = (apiKey: string) => {
    const updated: UserProfile = {
      ...userProfile,
      aiApiKey: apiKey,
    };
    handleSaveProfile(updated);
    showToast('מפתח Google Gemini נשמר בהצלחה!');
  };

  const syncUserData = (user: UserProfile) => {
    setUserProfile(user);
    setDayLogs(StorageService.getAllDayLogs(user.id));
    setFoodDatabase(StorageService.getFoodDatabase(user.id));
    setNotifications(StorageService.getNotifications(user.id));
  };

  const handleSaveProfile = (newProfile: UserProfile) => {
    StorageService.saveProfile(newProfile);
    syncUserData(newProfile);
    showToast('הפרופיל והיעדים עודכנו בהצלחה!');
  };

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    StorageService.saveProfile(loggedInUser);

    if (loggedInUser.isOnboarded) {
      const today = getTodayDateString();
      const cleanDayLog: DayLog = {
        date: today,
        waterGlasses: 0,
        meals: { breakfast: [], lunch: [], dinner: [], snack: [] },
      };
      StorageService.saveDayLog(cleanDayLog, loggedInUser.id);
    }

    syncUserData(loggedInUser);
    showToast(`ברוך הבא, ${loggedInUser.name}! 👋`);
  };

  const handleLogout = () => {
    const guest = StorageService.logout();
    syncUserData(guest);
    setIsProfileModalOpen(false);
    showToast('התנתקת מהחשבון בהצלחה');
  };

  const handleSaveCustomFood = (newFood: Omit<FoodItem, 'id'>) => {
    const saved = StorageService.saveCustomFood(newFood, userProfile.id);
    setFoodDatabase(StorageService.getFoodDatabase(userProfile.id));
    showToast(`מאכל חדש נוסף למאגר: ${saved.name}`);
  };

  const handleUpdateCustomFood = (updatedFood: FoodItem) => {
    StorageService.updateCustomFood(updatedFood, userProfile.id);
    setFoodDatabase(StorageService.getFoodDatabase(userProfile.id));
    setEditingCustomFood(null);
    showToast(`המאכל "${updatedFood.name}" עודכן בהצלחה!`);
  };

  const handleDeleteCustomFood = (foodId: string) => {
    const updated = StorageService.deleteCustomFood(foodId, userProfile.id);
    setFoodDatabase(updated);
    showToast('המאכל נמחק ממאגר המאכלים שלך');
  };

  const handleEditCustomFood = (food: FoodItem) => {
    setEditingCustomFood(food);
    setIsCustomFoodModalOpen(true);
  };

  const handleSaveWeight = (weight: number, date?: string, note?: string) => {
    const updated = StorageService.logWeight(weight, date, note, userProfile.id);
    syncUserData(updated);
    showToast(`השקילה נשמרה בהצלחה (${weight} ק"ג) ⚖️`);
  };

  const handleDeleteWeightLog = (logId: string) => {
    const updated = StorageService.deleteWeightLog(logId, userProfile.id);
    syncUserData(updated);
    showToast('השקילה נמחקה מההיסטוריה');
  };

  const handleUpdateWeightReminder = (settings: {
    weeklyWeightReminderEnabled: boolean;
    weeklyWeightReminderDay: number;
    weeklyWeightReminderTime: string;
  }) => {
    const updated: UserProfile = { ...userProfile, ...settings };
    StorageService.saveProfile(updated);
    setUserProfile(updated);
    showToast('הגדרות תזכורת השקילה השבועית עודכנו');
  };

  const handleToggleFavorite = (foodId: string) => {
    StorageService.toggleFavorite(foodId, userProfile.id);
    setFoodDatabase(StorageService.getFoodDatabase(userProfile.id));
  };

  const handleMarkNotificationsAsRead = () => {
    StorageService.markNotificationsAsRead(userProfile.id);
    setNotifications(StorageService.getNotifications(userProfile.id));
  };

  const handleExportData = () => {
    const jsonStr = StorageService.exportAllData(userProfile.id);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutritrack_backup_${userProfile.name || 'user'}_${getTodayDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('קובץ הגיבוי הורד בהצלחה!');
  };

  const handleImportData = (jsonStr: string) => {
    const success = StorageService.importAllData(jsonStr, userProfile.id);
    if (success) {
      const profile = StorageService.getProfile(userProfile.id);
      syncUserData(profile);
      showToast('הנתונים יובאו בהצלחה!');
    } else {
      showToast('שגיאה בייבוא הנתונים. ודא שמבנה ה-JSON תקין.', 'error');
    }
  };

  const handleResetData = () => {
    StorageService.resetAllData(userProfile.id);
    const defaultProf = StorageService.getProfile(userProfile.id);
    syncUserData(defaultProf);
    showToast('הנתונים אופסו לברירת המחדל');
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;
  const streakCount = calculateLoggingStreak(dayLogs, currentDate);

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col antialiased selection:bg-primary-container selection:text-on-primary-container w-full">
      {/* Top Header */}
      <Header
        currentDate={currentDate}
        onOpenDatePicker={() => setIsDatePickerModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        onOpenAIHub={() => setIsAIHubOpen(true)}
        unreadNotificationsCount={unreadNotifsCount}
        streakCount={streakCount}
        currentTheme={userProfile.theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Container with Page Fade Transition & iPhone Safe Bottom Scroll */}
      <main className="flex-1 w-full max-w-[480px] mx-auto px-3.5 sm:px-4 pt-3 pb-24 main-scroll-padding">
        <div key={activeTab} className="animate-page-enter">
          {activeTab === 'dashboard' && (
            <DashboardView
              userProfile={userProfile}
              dayLog={currentDayLog}
              onOpenQuickAdd={(mealType) => handleOpenQuickAdd(mealType || 'lunch')}
              onOpenMealPlans={() => setIsMealPlansOpen(true)}
              onOpenProfile={() => setIsProfileModalOpen(true)}
              onOpenWeightProgress={() => setIsWeightProgressModalOpen(true)}
              onNavigateToDiary={() => setActiveTab('diary')}
              onUpdateWater={handleUpdateWater}
              onDeleteItem={handleDeleteItem}
              onUpdateDayWorkout={handleUpdateDayWorkout}
              onOpenAIHub={() => setIsAIHubOpen(true)}
              onOpenAIVoice={() => handleOpenAIVoice('lunch')}
              onOpenAIScanner={(tab) => handleOpenAIScanner(tab || 'plate_vision', 'lunch')}
              onOpenAICoach={() => setIsAICoachModalOpen(true)}
              onOpenAIMealGen={() => handleOpenAIMealGen('dinner')}
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
              onUpdateDayWorkout={handleUpdateDayWorkout}
              onOpenAIVoiceForMeal={(mealType) => handleOpenAIVoice(mealType)}
              onOpenAIScannerForMeal={(mealType) => handleOpenAIScanner('plate_vision', mealType)}
            />
          )}

          {activeTab === 'plans' && (
            <MealPlansModal
              isOpen={true}
              isInline={true}
              onClose={() => setActiveTab('dashboard')}
              onApplyPlan={handleApplyMealPlan}
              onApplyFullWeek={handleApplyFullWeek}
              foodDatabase={foodDatabase}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileSettingsModal
              isOpen={true}
              isInline={true}
              onClose={() => setActiveTab('dashboard')}
              userProfile={userProfile}
              onSaveProfile={handleSaveProfile}
              onExportData={handleExportData}
              onImportData={handleImportData}
              onResetData={handleResetData}
              onLogout={handleLogout}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onOpenUserGuide={() => setIsUserGuideOpen(true)}
              onOpenWeightProgress={() => setIsWeightProgressModalOpen(true)}
            />
          )}
        </div>
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
        onOpenCustomFoodModal={() => {
          setEditingCustomFood(null);
          setIsCustomFoodModalOpen(true);
        }}
        onEditCustomFood={handleEditCustomFood}
        onDeleteCustomFood={handleDeleteCustomFood}
        onToggleFavorite={handleToggleFavorite}
        onLogDirectMeal={handleLogDirectMeal}
        onOpenAIVoice={(mealType) => handleOpenAIVoice(mealType)}
        onOpenAIScanner={(mealType) => handleOpenAIScanner('plate_vision', mealType)}
      />

      <CustomFoodModal
        isOpen={isCustomFoodModalOpen}
        onClose={() => {
          setIsCustomFoodModalOpen(false);
          setEditingCustomFood(null);
        }}
        defaultMealType={searchDefaultMealType}
        editingFood={editingCustomFood}
        onSaveCustomFood={handleSaveCustomFood}
        onUpdateCustomFood={handleUpdateCustomFood}
        onLogDirect={handleLogDirectMeal}
      />

      {activeTab !== 'plans' && (
        <MealPlansModal
          isOpen={isMealPlansOpen}
          onClose={() => setIsMealPlansOpen(false)}
          onApplyPlan={handleApplyMealPlan}
          onApplyFullWeek={handleApplyFullWeek}
          foodDatabase={foodDatabase}
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
          onOpenUserGuide={() => setIsUserGuideOpen(true)}
          onOpenWeightProgress={() => setIsWeightProgressModalOpen(true)}
        />
      )}

      {/* Weight & Progress Tracker Modal */}
      <WeightProgressModal
        isOpen={isWeightProgressModalOpen}
        onClose={() => setIsWeightProgressModalOpen(false)}
        userProfile={userProfile}
        onSaveWeight={handleSaveWeight}
        onDeleteWeightLog={handleDeleteWeightLog}
        onUpdateReminderSettings={handleUpdateWeightReminder}
      />

      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkNotificationsAsRead}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
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

      <UserGuideModal
        isOpen={isUserGuideOpen}
        onClose={() => setIsUserGuideOpen(false)}
      />

      {/* ========================================================================= */}
      {/* AI SUITE MODALS                                                           */}
      {/* ========================================================================= */}
      <AIHubModal
        isOpen={isAIHubOpen}
        onClose={() => setIsAIHubOpen(false)}
        userProfile={userProfile}
        dayLog={currentDayLog}
        onOpenVoiceModal={() => handleOpenAIVoice(searchDefaultMealType)}
        onOpenPhotoScannerModal={(tab) => handleOpenAIScanner(tab || 'plate_vision', searchDefaultMealType)}
        onOpenMealGeneratorModal={() => handleOpenAIMealGen('dinner')}
        onOpenCoachModal={() => setIsAICoachModalOpen(true)}
        onSaveApiKey={handleSaveApiKey}
      />

      <AINaturalLanguageModal
        isOpen={isAIVoiceModalOpen}
        onClose={() => setIsAIVoiceModalOpen(false)}
        defaultMealType={aiDefaultMealType}
        apiKey={userProfile.aiApiKey}
        onLogParsedItems={handleLogParsedItems}
      />

      <AIPhotoScannerModal
        isOpen={isAIScannerModalOpen}
        onClose={() => setIsAIScannerModalOpen(false)}
        defaultTab={aiScannerDefaultTab}
        defaultMealType={aiDefaultMealType}
        foodDatabase={foodDatabase}
        apiKey={userProfile.aiApiKey}
        onLogParsedItems={handleLogParsedItems}
        onSaveCustomFood={handleSaveCustomFood}
        onLogFood={handleLogFood}
      />

      <AIMealGeneratorModal
        isOpen={isAIMealGenModalOpen}
        onClose={() => setIsAIMealGenModalOpen(false)}
        userProfile={userProfile}
        dayLog={currentDayLog}
        apiKey={userProfile.aiApiKey}
        defaultMealType={aiDefaultMealType}
        onLogParsedItems={handleLogParsedItems}
      />

      <AICoachModal
        isOpen={isAICoachModalOpen}
        onClose={() => setIsAICoachModalOpen(false)}
        userProfile={userProfile}
        dayLog={currentDayLog}
        apiKey={userProfile.aiApiKey}
        onOpenMealGenerator={() => handleOpenAIMealGen('dinner')}
        onLogParsedItems={handleLogParsedItems}
        onAdjustDayTargets={handleAdjustDayTargets}
      />
    </div>
  );
}

export default App;
