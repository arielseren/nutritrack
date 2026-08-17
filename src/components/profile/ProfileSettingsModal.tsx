import React, { useState } from 'react';
import {
  X,
  User,
  Target,
  Bell,
  Shield,
  Database,
  ChevronDown,
  ChevronUp,
  Edit2,
  Check,
  RotateCcw,
  Download,
  Upload,
  Fingerprint,
  LogOut,
  Send,
  Sparkles,
  Info,
  Dumbbell,
  Flame,
  BookOpen,
  Scale,
} from 'lucide-react';
import type { UserProfile, FitnessGoal, ActivityLevel, WorkoutDayType } from '../../types';
import {
  calculateScientificTargets,
  DEFAULT_WEEKLY_WORKOUT_SCHEDULE,
} from '../../services/nutritionCalculator';
import { NotificationService } from '../../services/notificationService';
import { BiometricAuthService } from '../../services/biometricAuthService';
import { StorageService } from '../../services/storageService';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => void;
  onResetData: () => void;
  onLogout?: () => void;
  onOpenAuth?: () => void;
  onOpenUserGuide?: () => void;
  onOpenWeightProgress?: () => void;
  isInline?: boolean;
}

type AccordionSection = 'personal' | 'targets' | 'schedule' | 'notifications' | 'security' | 'backup';

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  onExportData,
  onImportData,
  onResetData,
  onLogout,
  onOpenAuth,
  onOpenUserGuide,
  onOpenWeightProgress,
  isInline = false,
}) => {
  // Active open accordion section
  const [openSections, setOpenSections] = useState<Record<AccordionSection, boolean>>({
    personal: true,
    targets: false,
    schedule: false,
    notifications: false,
    security: false,
    backup: false,
  });

  // Edit mode tracking per section
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingTargets, setIsEditingTargets] = useState(false);

  // Form State
  const [formData, setFormData] = useState<UserProfile>(userProfile);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [biometricMessage, setBiometricMessage] = useState<string | null>(null);
  const [pushTestMessage, setPushTestMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSection = (section: AccordionSection) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSavePersonal = () => {
    const calculated = calculateScientificTargets(
      formData.gender,
      formData.age,
      formData.height,
      formData.currentWeight,
      formData.activityLevel,
      formData.goal
    );

    const initialW = formData.initialWeight || formData.currentWeight;

    const updated: UserProfile = {
      ...formData,
      initialWeight: initialW,
      dailyCalorieTarget: calculated.calories,
      dailyProteinTarget: calculated.protein,
      dailyCarbsTarget: calculated.carbs,
      dailyFatTarget: calculated.fat,
    };

    setFormData(updated);
    onSaveProfile(updated);
    setIsEditingPersonal(false);
  };

  const handleCancelPersonal = () => {
    setFormData(userProfile);
    setIsEditingPersonal(false);
  };

  const handleSaveTargets = () => {
    onSaveProfile(formData);
    setIsEditingTargets(false);
  };

  const handleCancelTargets = () => {
    setFormData(userProfile);
    setIsEditingTargets(false);
  };

  const handleAutoRecalculateTargets = () => {
    const calculated = calculateScientificTargets(
      formData.gender,
      formData.age,
      formData.height,
      formData.currentWeight,
      formData.activityLevel,
      formData.goal
    );

    const updated: UserProfile = {
      ...formData,
      dailyCalorieTarget: calculated.calories,
      dailyProteinTarget: calculated.protein,
      dailyCarbsTarget: calculated.carbs,
      dailyFatTarget: calculated.fat,
    };

    setFormData(updated);
    onSaveProfile(updated);
  };

  const handleTogglePushNotifications = async () => {
    if (!formData.pushNotificationsEnabled) {
      const granted = await NotificationService.requestPermission();
      const updated: UserProfile = {
        ...formData,
        pushNotificationsEnabled: granted,
      };
      setFormData(updated);
      onSaveProfile(updated);
      if (granted) {
        setPushTestMessage('התראות ה-Push הופעלו בהצלחה במכשיר!');
        await NotificationService.sendTestPushNotification();
      } else {
        setPushTestMessage('נא לאשר קבלת התראות בהגדרות הדפדפן של המכשיר.');
      }
    } else {
      const updated: UserProfile = {
        ...formData,
        pushNotificationsEnabled: false,
      };
      setFormData(updated);
      onSaveProfile(updated);
      setPushTestMessage('התראות ה-Push כובו.');
    }
  };

  const handleSendTestPush = async () => {
    setPushTestMessage('שולח התראת בדיקה למכשיר...');
    const sent = await NotificationService.sendTestPushNotification();
    if (sent) {
      setPushTestMessage('התראת בדיקה נשלחה בהצלחה! 🔔');
    } else {
      setPushTestMessage('יש לאשר הרשאות התראה תחילה.');
    }
    setTimeout(() => setPushTestMessage(null), 4000);
  };

  const handleToggleBiometrics = async () => {
    setBiometricLoading(true);
    setBiometricMessage(null);

    if (!formData.hasBiometrics) {
      const res = await BiometricAuthService.registerBiometrics(
        formData.id || formData.email || 'user_1',
        formData.name
      );
      if (res.success && res.credentialId) {
        const updated: UserProfile = {
          ...formData,
          hasBiometrics: true,
          biometricCredentialId: res.credentialId,
        };
        setFormData(updated);
        onSaveProfile(updated);
        setBiometricMessage('טביעת אצבע / Face ID הוגדרו בהצלחה! תוכל להתחבר בלחיצה אחת.');
      } else {
        setBiometricMessage(res.error || 'הגדרת זיהוי ביומטרי נכשלה');
      }
    } else {
      const updated: UserProfile = {
        ...formData,
        hasBiometrics: false,
        biometricCredentialId: undefined,
      };
      setFormData(updated);
      onSaveProfile(updated);
      setBiometricMessage('התחברות ביומטרית בוטלה.');
    }
    setBiometricLoading(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportData(content);
      }
    };
    reader.readAsText(file);
  };

  const activityLabels: Record<ActivityLevel, string> = {
    sedentary: 'יושבני (ללא אימונים)',
    light: 'קל (1-3 אימונים בשבוע)',
    moderate: 'בינוני (3-5 אימונים בשבוע)',
    active: 'גבוה (6-7 אימונים בשבוע)',
    extra_active: 'גבוה מאוד (אתלטים / עבודה פיזית)',
  };

  const goalLabels: Record<FitnessGoal, string> = {
    lose_weight: 'ירידה במשקל וחיטוב (גירעון קלורי)',
    maintain: 'שמירה על משקל נוכחי (מאזן ניטרלי)',
    lean_bulk: 'עלייה נקייה במסת שריר (Lean Bulk - עודף קלורי מתון)',
    gain_muscle: 'עלייה במסת שריר ומסה (עודף קלורי מלא)',
  };

  const contentMarkup = (
    <div className={`bg-surface rounded-3xl w-full max-w-[480px] sm:max-w-xl flex flex-col border border-surface-container-high overflow-hidden ${
      isInline ? 'shadow-xs animate-page-enter' : 'shadow-2xl max-h-[90dvh] animate-modal-sheet'
    }`}>
      
      {/* Modal / Card Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-surface-container-high bg-surface-container-lowest flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-base shadow-xs">
            {formData.name ? formData.name.charAt(0) : 'U'}
          </div>
          <div>
            <h2 className="font-headline font-bold text-base text-on-surface">פרופיל והגדרות</h2>
            <p className="text-[11px] text-outline">
              {formData.email ? formData.email : 'משתמש רשום ב-NutriTrack'}
            </p>
          </div>
        </div>
        {!isInline && (
          <button
            onClick={onClose}
            aria-label="סגור"
            className="p-2 rounded-xl text-outline hover:bg-surface-container-high hover:text-on-surface active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 divide-y divide-surface-container-high/40">
          
          {/* User Guide Quick Banner */}
          {onOpenUserGuide && (
            <div className="pb-1">
              <button
                type="button"
                onClick={onOpenUserGuide}
                className="w-full p-3 rounded-2xl bg-primary/10 hover:bg-primary/15 border border-primary/20 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold shadow-xs">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-xs text-primary block group-hover:underline">
                      מדריך למשתמש ומרכז עזרה 📖
                    </span>
                    <span className="text-[10px] text-outline block">
                      הסברים מקיפים על אימונים, תפריט שבועי, הזנה ישירה ועוד
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-primary">פתח ←</span>
              </button>
            </div>
          )}

          {/* Weight & Progress Tracker Quick Banner */}
          {onOpenWeightProgress && (
            <div className="pb-1">
              <button
                type="button"
                onClick={onOpenWeightProgress}
                className="w-full p-3 rounded-2xl bg-secondary/10 hover:bg-secondary/15 border border-secondary/20 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-secondary text-on-secondary flex items-center justify-center font-bold shadow-xs">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-xs text-on-surface block group-hover:underline">
                      מעקב משקל, גרפים והתקדמות ⚖️
                    </span>
                    <span className="text-[10px] text-outline block">
                      התחלה: {formData.initialWeight || formData.currentWeight}kg • נוכחי: <strong>{formData.currentWeight}kg</strong> • יעד: {formData.targetWeight}kg
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-secondary">פתח גרפים ←</span>
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ACCORDION 1: פרטים אישיים (Personal Details) */}
          {/* ========================================================================= */}
          <div className="pt-2">
            {/* Header / Toggle Bar */}
            <div
              onClick={() => toggleSection('personal')}
              className="p-3.5 rounded-2xl bg-surface-container-low hover:bg-surface-container flex items-center justify-between cursor-pointer transition-all border border-surface-container-high"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-xs text-on-surface">פרטים אישיים ומדדי גוף</h3>
                  <p className="text-[10px] text-outline">משקל, גיל, גובה ומטרת תזונה</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {openSections.personal ? (
                  <ChevronUp className="w-4 h-4 text-outline" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-outline" />
                )}
              </div>
            </div>

            {/* Accordion Content */}
            {openSections.personal && (
              <div className="mt-2.5 p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container-high space-y-3 animate-in fade-in duration-150">
                <div className="flex justify-between items-center pb-2 border-b border-surface-container-high">
                  <span className="text-[11px] font-bold text-outline">נתוני המשתמש</span>
                  {!isEditingPersonal ? (
                    <button
                      onClick={() => setIsEditingPersonal(true)}
                      className="px-2.5 py-1 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold flex items-center gap-1 transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>ערוך</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleCancelPersonal}
                        className="px-2 py-1 rounded-xl text-outline hover:bg-surface-container text-xs font-bold transition-all"
                      >
                        ביטול
                      </button>
                      <button
                        onClick={handleSavePersonal}
                        className="px-3 py-1 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>שמור</span>
                      </button>
                    </div>
                  )}
                </div>

                {!isEditingPersonal ? (
                  /* READ ONLY / SUMMARY MODE */
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high/60">
                      <span className="text-[10px] text-outline block">שם מלא</span>
                      <span className="font-bold text-on-surface">{formData.name}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high/60">
                      <span className="text-[10px] text-outline block">מין וגיל</span>
                      <span className="font-bold text-on-surface">
                        {formData.gender === 'male' ? 'גבר' : 'אישה'}, {formData.age} שנים
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high/60">
                      <span className="text-[10px] text-outline block">גובה</span>
                      <span className="font-bold text-on-surface">{formData.height} ס"מ</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high/60">
                      <span className="text-[10px] text-outline block">משקלים (התחלה / נוכחי / יעד)</span>
                      <span className="font-bold text-on-surface">
                        {formData.initialWeight || formData.currentWeight}kg → <strong>{formData.currentWeight}kg</strong> → {formData.targetWeight}kg
                      </span>
                    </div>
                    <div className="col-span-2 p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high/60">
                      <span className="text-[10px] text-outline block">מטרת תזונה</span>
                      <span className="font-bold text-primary">{goalLabels[formData.goal]}</span>
                    </div>
                    <div className="col-span-2 p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high/60">
                      <span className="text-[10px] text-outline block">רמת פעילות גופנית</span>
                      <span className="font-bold text-on-surface">{activityLabels[formData.activityLevel]}</span>
                    </div>
                  </div>
                ) : (
                  /* EDITABLE INPUTS MODE */
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-outline block mb-1">שם מלא</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-xs focus:outline-hidden focus:border-primary"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-outline block mb-1">מין</label>
                        <select
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-xs"
                        >
                          <option value="male">גבר</option>
                          <option value="female">אישה</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-outline block mb-1">גיל</label>
                        <input
                          type="number"
                          value={formData.age === 0 ? '' : formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value === '' ? 0 : Number(e.target.value) })}
                          placeholder="0"
                          className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-outline block mb-1">גובה (ס"מ)</label>
                        <input
                          type="number"
                          value={formData.height === 0 ? '' : formData.height}
                          onChange={(e) => setFormData({ ...formData, height: e.target.value === '' ? 0 : Number(e.target.value) })}
                          placeholder="0"
                          className="w-full px-2.5 py-2 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-outline block mb-1">משקל התחלתי</label>
                        <input
                          type="number"
                          value={(formData.initialWeight ?? formData.currentWeight) === 0 ? '' : (formData.initialWeight ?? formData.currentWeight)}
                          onChange={(e) => setFormData({ ...formData, initialWeight: e.target.value === '' ? 0 : Number(e.target.value) })}
                          placeholder="0"
                          className="w-full px-2.5 py-2 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-outline block mb-1">משקל נוכחי (ק"ג)</label>
                        <input
                          type="number"
                          value={formData.currentWeight === 0 ? '' : formData.currentWeight}
                          onChange={(e) => setFormData({ ...formData, currentWeight: e.target.value === '' ? 0 : Number(e.target.value) })}
                          placeholder="0"
                          className="w-full px-2.5 py-2 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-outline block mb-1">משקל יעד</label>
                        <input
                          type="number"
                          value={formData.targetWeight === 0 ? '' : formData.targetWeight}
                          onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value === '' ? 0 : Number(e.target.value) })}
                          placeholder="0"
                          className="w-full px-2.5 py-2 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-outline block mb-1">מטרת תזונה</label>
                      <select
                        value={formData.goal}
                        onChange={(e) => setFormData({ ...formData, goal: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-xs"
                      >
                        <option value="lose_weight">ירידה במשקל וחיטוב (גירעון קלורי)</option>
                        <option value="maintain">שמירה על משקל נוכחי (מאזן ניטרלי)</option>
                        <option value="lean_bulk">עלייה נקייה במסת שריר (Lean Bulk - עודף קלורי מתון)</option>
                        <option value="gain_muscle">עלייה במסת שריר ומסה (עודף קלורי מלא)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-outline block mb-1">רמת פעילות גופנית</label>
                      <select
                        value={formData.activityLevel}
                        onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-xs"
                      >
                        <option value="sedentary">יושבני (ללא אימונים)</option>
                        <option value="light">קל (1-3 אימונים בשבוע)</option>
                        <option value="moderate">בינוני (3-5 אימונים בשבוע)</option>
                        <option value="active">גבוה (6-7 אימונים בשבוע)</option>
                        <option value="extra_active">גבוה מאוד (אתלטים / עבודה פיזית)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* ACCORDION 2: יעדים תזונתיים יומיים (Daily Targets) */}
          {/* ========================================================================= */}
          <div className="pt-2">
            <div
              onClick={() => toggleSection('targets')}
              className="p-3.5 rounded-2xl bg-surface-container-low hover:bg-surface-container flex items-center justify-between cursor-pointer transition-all border border-surface-container-high"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-tertiary/15 flex items-center justify-center text-tertiary">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-xs text-on-surface">יעדים תזונתיים יומיים</h3>
                  <p className="text-[10px] text-outline">קלוריות, חלבון, פחמימות, שומן ומים</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {openSections.targets ? (
                  <ChevronUp className="w-4 h-4 text-outline" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-outline" />
                )}
              </div>
            </div>

            {openSections.targets && (
              <div className="mt-2.5 p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container-high space-y-3 animate-in fade-in duration-150">
                <div className="flex justify-between items-center pb-2 border-b border-surface-container-high">
                  <span className="text-[11px] font-bold text-outline">יעדי יעד יומי</span>
                  {!isEditingTargets ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleAutoRecalculateTargets}
                        className="px-2.5 py-1 rounded-xl bg-tertiary/10 hover:bg-tertiary/20 text-tertiary text-[11px] font-bold flex items-center gap-1 transition-all"
                        title="חישוב מדעי BMR/TDEE לפי הנתונים האישיים"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>חשב אוטומטית</span>
                      </button>
                      <button
                        onClick={() => setIsEditingTargets(true)}
                        className="px-2.5 py-1 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold flex items-center gap-1 transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>ערוך</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleCancelTargets}
                        className="px-2 py-1 rounded-xl text-outline hover:bg-surface-container text-xs font-bold transition-all"
                      >
                        ביטול
                      </button>
                      <button
                        onClick={handleSaveTargets}
                        className="px-3 py-1 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>שמור</span>
                      </button>
                    </div>
                  )}
                </div>

                {!isEditingTargets ? (
                  /* READ ONLY TARGETS */
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="col-span-2 p-3 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex items-center justify-between">
                      <span className="text-xs text-outline font-medium">יעד קלורי יומי:</span>
                      <span className="text-base font-extrabold text-tertiary">{formData.dailyCalorieTarget} קק"ל</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high/60">
                      <span className="text-[10px] text-outline block">חלבון יומי</span>
                      <span className="font-bold text-on-surface">{formData.dailyProteinTarget} גרם</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high/60">
                      <span className="text-[10px] text-outline block">פחמימות יומיות</span>
                      <span className="font-bold text-on-surface">{formData.dailyCarbsTarget} גרם</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high/60">
                      <span className="text-[10px] text-outline block">שומנים יומיים</span>
                      <span className="font-bold text-on-surface">{formData.dailyFatTarget} גרם</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high/60">
                      <span className="text-[10px] text-outline block">יעד שתיית מים</span>
                      <span className="font-bold text-primary">{formData.dailyWaterTargetGlasses} כוסות (2 ליטר)</span>
                    </div>
                  </div>
                ) : (
                  /* EDITABLE TARGETS */
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-outline block mb-1">יעד קלוריות (קק"ל)</label>
                      <input
                        type="number"
                        value={formData.dailyCalorieTarget === 0 ? '' : formData.dailyCalorieTarget}
                        onChange={(e) => setFormData({ ...formData, dailyCalorieTarget: e.target.value === '' ? 0 : Number(e.target.value) })}
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-xs font-bold text-tertiary"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-outline block mb-1">חלבון (גרם)</label>
                        <input
                          type="number"
                          value={formData.dailyProteinTarget === 0 ? '' : formData.dailyProteinTarget}
                          onChange={(e) => setFormData({ ...formData, dailyProteinTarget: e.target.value === '' ? 0 : Number(e.target.value) })}
                          placeholder="0"
                          className="w-full px-2.5 py-2 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-outline block mb-1">פחמימות (גרם)</label>
                        <input
                          type="number"
                          value={formData.dailyCarbsTarget === 0 ? '' : formData.dailyCarbsTarget}
                          onChange={(e) => setFormData({ ...formData, dailyCarbsTarget: e.target.value === '' ? 0 : Number(e.target.value) })}
                          placeholder="0"
                          className="w-full px-2.5 py-2 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-outline block mb-1">שומן (גרם)</label>
                        <input
                          type="number"
                          value={formData.dailyFatTarget === 0 ? '' : formData.dailyFatTarget}
                          onChange={(e) => setFormData({ ...formData, dailyFatTarget: e.target.value === '' ? 0 : Number(e.target.value) })}
                          placeholder="0"
                          className="w-full px-2.5 py-2 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-outline block mb-1">יעד כוסות מים (250 מ"ל לכוס)</label>
                      <input
                        type="number"
                        value={formData.dailyWaterTargetGlasses === 0 ? '' : formData.dailyWaterTargetGlasses}
                        onChange={(e) => setFormData({ ...formData, dailyWaterTargetGlasses: e.target.value === '' ? 0 : Number(e.target.value) })}
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* ACCORDION 3: לוח אימונים שבועי וסייקלינג קלוריות (Workout Schedule & Cycling) */}
          {/* ========================================================================= */}
          <div className="pt-2">
            <div
              onClick={() => toggleSection('schedule')}
              className="p-3.5 rounded-2xl bg-surface-container-low hover:bg-surface-container flex items-center justify-between cursor-pointer transition-all border border-surface-container-high"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-xs text-on-surface">
                    לוח אימונים שבועי וסייקלינג קלוריות
                  </h3>
                  <p className="text-[10px] text-outline">
                    הגדרת ימי אימון מול מנוחה והתאמת קלוריות אוטומטית
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {openSections.schedule ? (
                  <ChevronUp className="w-4 h-4 text-outline" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-outline" />
                )}
              </div>
            </div>

            {openSections.schedule && (
              <div className="mt-2.5 p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container-high space-y-3.5 animate-in fade-in duration-150 text-xs">
                
                {/* Info Tip */}
                <div className="p-3 rounded-2xl bg-surface-container-low border border-surface-container-high/60 flex items-start gap-2">
                  <Flame className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-on-surface leading-relaxed">
                    <strong>סייקלינג קלוריות חכם:</strong> בימי אימון כוח או אירובי, יעד הקלוריות והפחמימות היומי יגדל אוטומטית כדי לתדלק את האימון, ובימי מנוחה יחזור למאזן שיקום בסיסי.
                  </p>
                </div>

                {/* Quick Schedule Presets */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-outline block">תבניות אימון מוכנות בלחיצה:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const newSched: Record<number, WorkoutDayType> = {
                          0: 'light_strength', // א - כוח
                          1: 'rest',           // ב - מנוחה
                          2: 'heavy_strength', // ג - כבד
                          3: 'rest',           // ד - מנוחה
                          4: 'light_strength', // ה - כוח
                          5: 'cardio',         // ו - אירובי
                          6: 'rest',           // ש - מנוחה
                        };
                        const updated = { ...formData, weeklyWorkoutSchedule: newSched };
                        setFormData(updated);
                        onSaveProfile(updated);
                      }}
                      className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs text-center border border-surface-container-high transition-all"
                    >
                      תבנית AB (4 ימים)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const newSched: Record<number, WorkoutDayType> = {
                          0: 'heavy_strength', // א - Push
                          1: 'light_strength', // ב - Pull
                          2: 'heavy_strength', // ג - Legs
                          3: 'rest',           // ד - מנוחה
                          4: 'light_strength', // ה - Upper
                          5: 'heavy_strength', // ו - Lower
                          6: 'rest',           // ש - מנוחה
                        };
                        const updated = { ...formData, weeklyWorkoutSchedule: newSched };
                        setFormData(updated);
                        onSaveProfile(updated);
                      }}
                      className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs text-center border border-surface-container-high transition-all"
                    >
                      תבנית PPL (5 ימים)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const newSched: Record<number, WorkoutDayType> = {
                          0: 'heavy_strength', // א - Full Body
                          1: 'rest',           // ב - מנוחה
                          2: 'heavy_strength', // ג - Full Body
                          3: 'rest',           // ד - מנוחה
                          4: 'heavy_strength', // ה - Full Body
                          5: 'cardio',         // ו - אירובי קל
                          6: 'rest',           // ש - מנוחה
                        };
                        const updated = { ...formData, weeklyWorkoutSchedule: newSched };
                        setFormData(updated);
                        onSaveProfile(updated);
                      }}
                      className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs text-center border border-surface-container-high transition-all"
                    >
                      Full Body (3 ימים)
                    </button>
                  </div>
                </div>

                {/* 7 Days Grid Editor */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-outline block">
                    סוג הפעילות המוגדר לכל יום בשבוע:
                  </span>

                  {[
                    { dayIdx: 0, dayName: 'יום ראשון' },
                    { dayIdx: 1, dayName: 'יום שני' },
                    { dayIdx: 2, dayName: 'יום שלישי' },
                    { dayIdx: 3, dayName: 'יום רביעי' },
                    { dayIdx: 4, dayName: 'יום חמישי' },
                    { dayIdx: 5, dayName: 'יום שישי' },
                    { dayIdx: 6, dayName: 'יום שבת' },
                  ].map(({ dayIdx, dayName }) => {
                    const currentSchedule =
                      formData.weeklyWorkoutSchedule || DEFAULT_WEEKLY_WORKOUT_SCHEDULE;
                    const currentVal: WorkoutDayType = currentSchedule[dayIdx] || 'rest';

                    return (
                      <div
                        key={dayIdx}
                        className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex items-center justify-between gap-2 overflow-hidden"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-bold text-xs text-on-surface truncate">{dayName}</span>
                        </div>

                        <select
                          value={currentVal}
                          onChange={(e) => {
                            const newSched = {
                              ...(formData.weeklyWorkoutSchedule || DEFAULT_WEEKLY_WORKOUT_SCHEDULE),
                              [dayIdx]: e.target.value as WorkoutDayType,
                            };
                            const updated = { ...formData, weeklyWorkoutSchedule: newSched };
                            setFormData(updated);
                            onSaveProfile(updated);
                          }}
                          className="px-2 py-1.5 rounded-xl bg-surface-container border border-surface-container-high text-xs text-on-surface font-semibold max-w-[175px] truncate"
                        >
                          <option value="rest">יום מנוחה (בסיסי)</option>
                          <option value="light_strength">אימון כוח (+250 קק"ל)</option>
                          <option value="heavy_strength">אימון כבד (+450 קק"ל)</option>
                          <option value="cardio">אירובי (+350 קק"ל)</option>
                          <option value="hiit">HIIT (+400 קק"ל)</option>
                        </select>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* ACCORDION 4: התראות ותזכורות Push (Push Notifications) */}
          {/* ========================================================================= */}
          <div className="pt-2">
            <div
              onClick={() => toggleSection('notifications')}
              className="p-3.5 rounded-2xl bg-surface-container-low hover:bg-surface-container flex items-center justify-between cursor-pointer transition-all border border-surface-container-high"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-xs text-on-surface">התראות ותזכורות Push</h3>
                  <p className="text-[10px] text-outline">תזכורות שתיית מים וארוחות למכשיר</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {openSections.notifications ? (
                  <ChevronUp className="w-4 h-4 text-outline" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-outline" />
                )}
              </div>
            </div>

            {openSections.notifications && (
              <div className="mt-2.5 p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container-high space-y-3 animate-in fade-in duration-150 text-xs">
                
                {/* Main Push Toggle */}
                <div className="p-3 rounded-2xl bg-surface-container-low border border-surface-container-high flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-on-surface block text-xs">התראות Push פעילות למכשיר</span>
                    <span className="text-[10px] text-outline">קבלת תזכורות מערכת ישירות לטלפון</span>
                  </div>
                  <button
                    onClick={handleTogglePushNotifications}
                    className={`w-12 h-6.5 rounded-full transition-colors relative flex items-center px-1 ${
                      formData.pushNotificationsEnabled ? 'bg-primary justify-end' : 'bg-surface-container-high justify-start'
                    }`}
                  >
                    <span className="w-4.5 h-4.5 rounded-full bg-surface shadow-md block" />
                  </button>
                </div>

                {pushTestMessage && (
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary text-[11px] font-bold flex items-center gap-2">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    <span>{pushTestMessage}</span>
                  </div>
                )}

                {/* Reminder Times */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-outline block">זמני תזכורות ארוחות יומיות:</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-xl bg-surface-container-low border border-surface-container-high text-center">
                      <span className="text-[9px] text-outline block mb-0.5">בוקר</span>
                      <input
                        type="time"
                        value={formData.mealReminderBreakfast || '08:30'}
                        onChange={(e) => {
                          const updated = { ...formData, mealReminderBreakfast: e.target.value };
                          setFormData(updated);
                          onSaveProfile(updated);
                        }}
                        className="w-full bg-transparent text-center font-bold text-xs text-on-surface"
                      />
                    </div>
                    <div className="p-2 rounded-xl bg-surface-container-low border border-surface-container-high text-center">
                      <span className="text-[9px] text-outline block mb-0.5">צהריים</span>
                      <input
                        type="time"
                        value={formData.mealReminderLunch || '13:30'}
                        onChange={(e) => {
                          const updated = { ...formData, mealReminderLunch: e.target.value };
                          setFormData(updated);
                          onSaveProfile(updated);
                        }}
                        className="w-full bg-transparent text-center font-bold text-xs text-on-surface"
                      />
                    </div>
                    <div className="p-2 rounded-xl bg-surface-container-low border border-surface-container-high text-center">
                      <span className="text-[9px] text-outline block mb-0.5">ערב</span>
                      <input
                        type="time"
                        value={formData.mealReminderDinner || '19:30'}
                        onChange={(e) => {
                          const updated = { ...formData, mealReminderDinner: e.target.value };
                          setFormData(updated);
                          onSaveProfile(updated);
                        }}
                        className="w-full bg-transparent text-center font-bold text-xs text-on-surface"
                      />
                    </div>
                  </div>
                </div>

                {/* Test Push Button */}
                <button
                  onClick={handleSendTestPush}
                  className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs flex items-center justify-center gap-2 border border-surface-container-high transition-all active:scale-98"
                >
                  <Send className="w-3.5 h-3.5 text-primary" />
                  <span>שלח התראת בדיקה למכשיר שלי עכשיו 🔔</span>
                </button>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* ACCORDION 4: אבטחה וביומטריה (Security & Biometrics) */}
          {/* ========================================================================= */}
          <div className="pt-2">
            <div
              onClick={() => toggleSection('security')}
              className="p-3.5 rounded-2xl bg-surface-container-low hover:bg-surface-container flex items-center justify-between cursor-pointer transition-all border border-surface-container-high"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-xs text-on-surface">אבטחה והתחברות ביומטרית</h3>
                  <p className="text-[10px] text-outline">טביעת אצבע, Face ID וניהול חשבון</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {openSections.security ? (
                  <ChevronUp className="w-4 h-4 text-outline" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-outline" />
                )}
              </div>
            </div>

            {openSections.security && (
              <div className="mt-2.5 p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container-high space-y-3 animate-in fade-in duration-150 text-xs">
                
                {/* Biometric Toggle Card */}
                <div className="p-3 rounded-2xl bg-surface-container-low border border-surface-container-high flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <Fingerprint className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="font-bold text-on-surface block text-xs">התחברות בטביעת אצבע / Face ID</span>
                      <span className="text-[10px] text-outline">כניסה מהירה ללא צורך בהקלדת סיסמה</span>
                    </div>
                  </div>
                  <button
                    disabled={biometricLoading}
                    onClick={handleToggleBiometrics}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                      formData.hasBiometrics
                        ? 'bg-error/10 text-error hover:bg-error/20'
                        : 'bg-primary text-on-primary shadow-sm hover:opacity-90'
                    }`}
                  >
                    {formData.hasBiometrics ? 'בטל' : 'הפעל'}
                  </button>
                </div>

                {biometricMessage && (
                  <div className="p-2.5 rounded-xl bg-surface-container text-on-surface text-[11px] font-medium flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{biometricMessage}</span>
                  </div>
                )}

                {/* Account Actions */}
                <div className="pt-2 flex flex-col gap-2">
                  {/* Saved User Accounts on this Device */}
                  {(() => {
                    const otherUsers: UserProfile[] = StorageService.getUsersRegistry().filter(
                      (u: UserProfile) => u.id !== formData.id && u.email
                    );
                    if (otherUsers.length === 0) return null;
                    return (
                      <div className="space-y-1.5 p-2.5 rounded-2xl bg-surface-container-low border border-surface-container-high/60">
                        <span className="text-[10px] font-bold text-outline block mb-1">
                          חשבונות נוספים במכשיר:
                        </span>
                        {otherUsers.map((u: UserProfile) => (
                          <div
                            key={u.id}
                            className="p-2 rounded-xl bg-surface-container flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                                {u.name ? u.name.charAt(0) : 'U'}
                              </div>
                              <div className="truncate">
                                <span className="font-bold text-[11px] text-on-surface block truncate">
                                  {u.name}
                                </span>
                                <span className="text-[9px] text-outline truncate">{u.email}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                onSaveProfile(u);
                                setFormData(u);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary font-bold text-[10px] transition-all flex-shrink-0"
                            >
                              החלף למשתמש זה
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {onOpenAuth && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAuth();
                      }}
                      className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs flex items-center justify-center gap-2 border border-surface-container-high transition-all active:scale-98"
                    >
                      <User className="w-4 h-4 text-primary" />
                      <span>התחבר בחשבון אחר / משתמש חדש</span>
                    </button>
                  )}
                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="w-full py-2.5 rounded-xl bg-error-container/20 hover:bg-error-container/40 text-error font-bold text-xs flex items-center justify-center gap-2 border border-error/20 transition-all active:scale-98"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>התנתק מהחשבון (יציאה)</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* ACCORDION 5: גיבוי וניהול נתונים (Backup & Data Management) */}
          {/* ========================================================================= */}
          <div className="pt-2">
            <div
              onClick={() => toggleSection('backup')}
              className="p-3.5 rounded-2xl bg-surface-container-low hover:bg-surface-container flex items-center justify-between cursor-pointer transition-all border border-surface-container-high"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-xs text-on-surface">גיבוי וניהול נתונים</h3>
                  <p className="text-[10px] text-outline">ייצוא, ייבוא ואיפוס מלא של היומן</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {openSections.backup ? (
                  <ChevronUp className="w-4 h-4 text-outline" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-outline" />
                )}
              </div>
            </div>

            {openSections.backup && (
              <div className="mt-2.5 p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container-high space-y-2.5 animate-in fade-in duration-150 text-xs">
                <button
                  onClick={onExportData}
                  className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold flex items-center justify-center gap-2 border border-surface-container-high transition-all"
                >
                  <Download className="w-4 h-4 text-primary" />
                  <span>ייצוא והורדת גיבוי JSON</span>
                </button>

                <label className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold flex items-center justify-center gap-2 border border-surface-container-high cursor-pointer transition-all">
                  <Upload className="w-4 h-4 text-tertiary" />
                  <span>ייבוא ושחזור נתונים מקובץ</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => {
                    if (window.confirm('האם אתה בטוח שברצונך לאפס את כל הנתונים והיומן?')) {
                      onResetData();
                    }
                  }}
                  className="w-full py-2 rounded-xl text-error hover:bg-error-container/20 font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>איפוס מלא לברירת המחדל</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Modal / Card Footer */}
        {!isInline && (
          <div className="p-4 bg-surface-container-lowest border-t border-surface-container-high flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary font-headline font-bold text-xs shadow-md active:scale-95 transition-all"
            >
              סגור
            </button>
          </div>
        )}

      </div>
  );

  if (isInline) {
    return contentMarkup;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      {contentMarkup}
    </div>
  );
};
