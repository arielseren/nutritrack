import React, { useState } from 'react';
import {
  User,
  X,
  Check,
  Calculator,
  Download,
  Upload,
  RotateCcw,
  Sun,
  Moon,
  LogIn,
} from 'lucide-react';
import type { UserProfile, ActivityLevel, FitnessGoal } from '../../types';
import { calculateBMR, calculateTDEE } from '../../services/nutritionCalculator';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => void;
  onResetData: () => void;
  onOpenAuth?: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  onExportData,
  onImportData,
  onResetData,
  onOpenAuth,
}) => {
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const [importText, setImportText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setProfile(userProfile);
      setSaveSuccess(false);
      setShowImportBox(false);
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

  const handleAutoCalculate = () => {
    const bmr = calculateBMR(profile.gender, profile.currentWeight, profile.height, profile.age);
    const tdee = calculateTDEE(bmr, profile.activityLevel, profile.goal);

    setProfile({
      ...profile,
      dailyCalorieTarget: tdee.targetCalories,
      dailyProteinTarget: tdee.proteinGrams,
      dailyCarbsTarget: tdee.carbsGrams,
      dailyFatTarget: tdee.fatGrams,
    });
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    const updated = { ...profile, theme: newTheme };
    setProfile(updated);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    onSaveProfile(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(profile);
    setSaveSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleImportSubmit = () => {
    if (importText.trim()) {
      onImportData(importText.trim());
      setShowImportBox(false);
      setImportText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[480px] max-h-[92vh] bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-surface-container-high">
        {/* Header */}
        <div className="p-4 border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-on-surface">פרופיל והגדרות יעד</h3>
              <p className="text-xs text-outline">התאם את נתוני הגוף, היעדים וערכת הנושא</p>
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

        {/* Content Body */}
        <form onSubmit={handleSave} className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* User Account Card & Login Trigger */}
          <div className="p-3 bg-surface-container-low rounded-2xl border border-surface-container-high flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                {profile.name ? profile.name[0] : 'U'}
              </div>
              <div>
                <h4 className="font-bold text-sm text-on-surface">{profile.name || 'משתמש אורח'}</h4>
                <p className="text-[11px] text-outline">{profile.email || 'חשבון מקומי'}</p>
              </div>
            </div>

            {onOpenAuth && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="py-1.5 px-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container border border-surface-container-high font-bold text-xs flex items-center gap-1.5 text-primary active:scale-95 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{profile.email ? 'החלף חשבון' : 'התחברות / הרשמה'}</span>
              </button>
            )}
          </div>

          {/* Theme selector */}
          <div className="space-y-2">
            <h4 className="font-bold text-on-surface text-sm">ערכת נושא (עיצוב)</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-bold transition-all active:scale-95 ${
                  profile.theme === 'light'
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-surface-container-low border-surface-container-high text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>מצב יום (בהיר)</span>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-bold transition-all active:scale-95 ${
                  profile.theme === 'dark'
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-surface-container-low border-surface-container-high text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>מצב לילה (כהה)</span>
              </button>
            </div>
          </div>

          {/* Personal Details */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-on-surface text-sm">פרטים אישיים</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-outline block mb-0.5">שם מלא</label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-surface-container-low text-on-surface p-2.5 rounded-xl border border-surface-container-high font-semibold focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-outline block mb-0.5">מין</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value as 'male' | 'female' })}
                  className="w-full bg-surface-container-low text-on-surface p-2.5 rounded-xl border border-surface-container-high font-semibold focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="male">גבר</option>
                  <option value="female">אישה</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-outline block mb-0.5">גיל</label>
                <input
                  type="number"
                  min="12"
                  max="120"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                  className="w-full bg-surface-container-low text-on-surface p-2.5 rounded-xl border border-surface-container-high font-semibold focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-outline block mb-0.5">גובה (ס"מ)</label>
                <input
                  type="number"
                  min="100"
                  max="250"
                  value={profile.height}
                  onChange={(e) => setProfile({ ...profile, height: Number(e.target.value) })}
                  className="w-full bg-surface-container-low text-on-surface p-2.5 rounded-xl border border-surface-container-high font-semibold focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-outline block mb-0.5">משקל נוכחי (ק"ג)</label>
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="300"
                  value={profile.currentWeight}
                  onChange={(e) => setProfile({ ...profile, currentWeight: Number(e.target.value) })}
                  className="w-full bg-surface-container-low text-on-surface p-2.5 rounded-xl border border-surface-container-high font-semibold focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-outline block mb-0.5">משקל יעד (ק"ג)</label>
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="300"
                  value={profile.targetWeight}
                  onChange={(e) => setProfile({ ...profile, targetWeight: Number(e.target.value) })}
                  className="w-full bg-surface-container-low text-on-surface p-2.5 rounded-xl border border-surface-container-high font-semibold focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="font-semibold text-outline block mb-0.5">רמת פעילות גופנית</label>
                <select
                  value={profile.activityLevel}
                  onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value as ActivityLevel })}
                  className="w-full bg-surface-container-low text-on-surface p-2.5 rounded-xl border border-surface-container-high font-semibold focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="sedentary">יושבני (ללא אימונים)</option>
                  <option value="light">קלה (1-3 אימונים בשבוע)</option>
                  <option value="moderate">בינונית (3-5 אימונים בשבוע)</option>
                  <option value="active">גבוהה (6-7 אימונים בשבוע)</option>
                  <option value="extra_active">אינטנסיבית מאוד (עבודה פיזית)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-outline block mb-0.5">מטרת התזונה</label>
                <select
                  value={profile.goal}
                  onChange={(e) => setProfile({ ...profile, goal: e.target.value as FitnessGoal })}
                  className="w-full bg-surface-container-low text-on-surface p-2.5 rounded-xl border border-surface-container-high font-semibold focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="lose_weight">חיטוב / ירידה במשקל</option>
                  <option value="maintain">שמירה על הקיים</option>
                  <option value="gain_muscle">עלייה במסת שריר</option>
                </select>
              </div>
            </div>

            {/* Smart Auto Calculator Button */}
            <button
              type="button"
              onClick={handleAutoCalculate}
              className="w-full py-2.5 px-3 rounded-xl bg-primary-container/20 hover:bg-primary-container/40 text-on-primary-container font-bold flex items-center justify-center gap-1.5 transition-all mt-1 active:scale-95"
            >
              <Calculator className="w-4 h-4" />
              <span>חשב יעדים יומיים אוטומטית (לפי BMR & TDEE)</span>
            </button>
          </div>

          {/* Daily Targets Customization */}
          <div className="p-3 bg-surface-container-low rounded-2xl border border-surface-container-high space-y-2">
            <h4 className="font-bold text-on-surface text-sm">יעדים תזונתיים יומיים</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-outline font-semibold block mb-0.5">יעד קלוריות</label>
                <input
                  type="number"
                  min="500"
                  max="10000"
                  value={profile.dailyCalorieTarget}
                  onChange={(e) => setProfile({ ...profile, dailyCalorieTarget: Number(e.target.value) })}
                  className="w-full bg-surface-container-lowest text-tertiary p-2 rounded-lg border border-surface-container-high text-center font-bold"
                />
              </div>

              <div>
                <label className="text-outline font-semibold block mb-0.5">חלבון (g)</label>
                <input
                  type="number"
                  min="0"
                  value={profile.dailyProteinTarget}
                  onChange={(e) => setProfile({ ...profile, dailyProteinTarget: Number(e.target.value) })}
                  className="w-full bg-surface-container-lowest text-on-surface p-2 rounded-lg border border-surface-container-high text-center font-bold"
                />
              </div>

              <div>
                <label className="text-outline font-semibold block mb-0.5">פחמימה (g)</label>
                <input
                  type="number"
                  min="0"
                  value={profile.dailyCarbsTarget}
                  onChange={(e) => setProfile({ ...profile, dailyCarbsTarget: Number(e.target.value) })}
                  className="w-full bg-surface-container-lowest text-on-surface p-2 rounded-lg border border-surface-container-high text-center font-bold"
                />
              </div>

              <div>
                <label className="text-outline font-semibold block mb-0.5">שומן (g)</label>
                <input
                  type="number"
                  min="0"
                  value={profile.dailyFatTarget}
                  onChange={(e) => setProfile({ ...profile, dailyFatTarget: Number(e.target.value) })}
                  className="w-full bg-surface-container-lowest text-on-surface p-2 rounded-lg border border-surface-container-high text-center font-bold"
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="text-outline font-semibold block mb-0.5">יעד כוסות מים ביום (250 מ"ל לכוס)</label>
              <input
                type="number"
                min="1"
                max="20"
                value={profile.dailyWaterTargetGlasses}
                onChange={(e) => setProfile({ ...profile, dailyWaterTargetGlasses: Number(e.target.value) })}
                className="w-32 bg-surface-container-lowest text-on-surface p-2 rounded-lg border border-surface-container-high text-center font-bold"
              />
            </div>
          </div>

          {/* Backup & Storage management */}
          <div className="p-3 bg-surface-container-low rounded-2xl border border-surface-container-high space-y-2">
            <h4 className="font-bold text-on-surface text-sm">גיבוי וניהול נתונים מקומי</h4>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onExportData}
                className="flex-1 py-2 px-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container border border-surface-container-high font-bold flex items-center justify-center gap-1 text-on-surface active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ייצוא גיבוי JSON</span>
              </button>

              <button
                type="button"
                onClick={() => setShowImportBox(!showImportBox)}
                className="flex-1 py-2 px-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container border border-surface-container-high font-bold flex items-center justify-center gap-1 text-on-surface active:scale-95 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>ייבוא מקובץ</span>
              </button>
            </div>

            {showImportBox && (
              <div className="space-y-2 pt-2">
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="הדבק כאן את תוכן קובץ הגיבוי JSON..."
                  className="w-full h-20 p-2 bg-surface-container-lowest text-on-surface border border-surface-container-high rounded-xl text-[11px] font-mono"
                />
                <button
                  type="button"
                  onClick={handleImportSubmit}
                  className="w-full py-2 rounded-xl bg-primary text-white font-bold"
                >
                  טען נתונים עכשיו
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (window.confirm('האם אתה בטוח שברצונך לאפס את כל הנתונים לברירת המחדל?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="w-full py-2 text-error font-semibold hover:bg-error-container/20 rounded-xl transition-all flex items-center justify-center gap-1 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>איפוס מלא של נתוני האפליקציה</span>
            </button>
          </div>

          {/* Submit Save */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-md shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{saveSuccess ? 'השינויים נשמרו בהצלחה!' : 'שמור שינויים'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
