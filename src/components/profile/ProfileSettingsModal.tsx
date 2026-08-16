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
} from 'lucide-react';
import type { UserProfile, FitnessGoal, ActivityLevel } from '../../types';
import { calculateScientificTargets } from '../../services/nutritionCalculator';
import { NotificationService } from '../../services/notificationService';
import { BiometricAuthService } from '../../services/biometricAuthService';

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
}

type AccordionSection = 'personal' | 'targets' | 'notifications' | 'security' | 'backup';

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
}) => {
  // Active open accordion section
  const [openSections, setOpenSections] = useState<Record<AccordionSection, boolean>>({
    personal: true,
    targets: false,
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

  // Personal details save & cancel
  const handleSavePersonal = () => {
    onSaveProfile(formData);
    setIsEditingPersonal(false);
  };

  const handleCancelPersonal = () => {
    setFormData(userProfile);
    setIsEditingPersonal(false);
  };

  // Targets save & cancel
  const handleSaveTargets = () => {
    onSaveProfile(formData);
    setIsEditingTargets(false);
  };

  const handleCancelTargets = () => {
    setFormData(userProfile);
    setIsEditingTargets(false);
  };

  // Auto calculate targets from BMR / TDEE
  const handleAutoRecalculateTargets = () => {
    const calc = calculateScientificTargets(
      formData.gender,
      formData.age,
      formData.height,
      formData.currentWeight,
      formData.activityLevel,
      formData.goal
    );

    const updated: UserProfile = {
      ...formData,
      dailyCalorieTarget: calc.calories,
      dailyProteinTarget: calc.protein,
      dailyCarbsTarget: calc.carbs,
      dailyFatTarget: calc.fat,
    };
    setFormData(updated);
    onSaveProfile(updated);
  };

  // Push Notifications toggle
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

  // Test Push notification
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

  // Biometrics toggle (Fingerprint / Face ID)
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

  // File import helper
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onImportData(content);
      };
      reader.readAsText(file);
    }
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
    gain_muscle: 'עלייה במסת שריר ומסה (עודף קלורי)',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface rounded-3xl w-full max-w-[480px] max-h-[92vh] flex flex-col shadow-2xl border border-outline-variant/30 overflow-hidden">
        
        {/* Modal Header */}
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
          <button
            onClick={onClose}
            aria-label="סגור"
            className="p-2 rounded-xl text-outline hover:bg-surface-container-high hover:text-on-surface active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 divide-y divide-surface-container-high/40">
          
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
                      <span className="text-[10px] text-outline block">משקל נוכחי / יעד</span>
                      <span className="font-bold text-on-surface">
                        {formData.currentWeight} ק"ג <span className="text-outline font-normal">→ {formData.targetWeight} ק"ג</span>
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
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-outline block mb-1">גובה (ס"מ)</label>
                        <input
                          type="number"
                          value={formData.height}
                          onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                          className="w-full px-2.5 py-2 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-outline block mb-1">משקל (ק"ג)</label>
                        <input
                          type="number"
                          value={formData.currentWeight}
                          onChange={(e) => setFormData({ ...formData, currentWeight: Number(e.target.value) })}
                          className="w-full px-2.5 py-2 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-outline block mb-1">משקל יעד</label>
                        <input
                          type="number"
                          value={formData.targetWeight}
                          onChange={(e) => setFormData({ ...formData, targetWeight: Number(e.target.value) })}
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
                        <option value="gain_muscle">עלייה במסת שריר ומסה (עודף קלורי)</option>
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
                        value={formData.dailyCalorieTarget}
                        onChange={(e) => setFormData({ ...formData, dailyCalorieTarget: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-xs font-bold text-tertiary"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-outline block mb-1">חלבון (גרם)</label>
                        <input
                          type="number"
                          value={formData.dailyProteinTarget}
                          onChange={(e) => setFormData({ ...formData, dailyProteinTarget: Number(e.target.value) })}
                          className="w-full px-2.5 py-2 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-outline block mb-1">פחמימות (גרם)</label>
                        <input
                          type="number"
                          value={formData.dailyCarbsTarget}
                          onChange={(e) => setFormData({ ...formData, dailyCarbsTarget: Number(e.target.value) })}
                          className="w-full px-2.5 py-2 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-outline block mb-1">שומן (גרם)</label>
                        <input
                          type="number"
                          value={formData.dailyFatTarget}
                          onChange={(e) => setFormData({ ...formData, dailyFatTarget: Number(e.target.value) })}
                          className="w-full px-2.5 py-2 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-outline block mb-1">יעד כוסות מים (250 מ"ל לכוס)</label>
                      <input
                        type="number"
                        value={formData.dailyWaterTargetGlasses}
                        onChange={(e) => setFormData({ ...formData, dailyWaterTargetGlasses: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* ACCORDION 3: התראות ותזכורות Push (Push Notifications) */}
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
                  {onOpenAuth && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAuth();
                      }}
                      className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs flex items-center justify-center gap-2 border border-surface-container-high transition-all active:scale-98"
                    >
                      <User className="w-4 h-4 text-primary" />
                      <span>החלף משתמש / התחבר בחשבון אחר</span>
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

        {/* Modal Footer */}
        <div className="p-4 bg-surface-container-lowest border-t border-surface-container-high flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary font-headline font-bold text-xs shadow-md active:scale-95 transition-all"
          >
            סגור
          </button>
        </div>

      </div>
    </div>
  );
};
