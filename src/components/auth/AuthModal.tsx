import React, { useState } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Fingerprint,
  AlertCircle,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import type { UserProfile, FitnessGoal, ActivityLevel } from '../../types';
import { StorageService, DEFAULT_USER_PROFILE } from '../../services/storageService';
import { BiometricAuthService } from '../../services/biometricAuthService';
import { calculateScientificTargets } from '../../services/nutritionCalculator';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<1 | 2 | 3>(1); // For registration onboarding

  // Step 1: Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Step 2: Body Metrics
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number>(25);
  const [height, setHeight] = useState<number>(175);
  const [currentWeight, setCurrentWeight] = useState<number>(75);
  const [targetWeight, setTargetWeight] = useState<number>(70);

  // Step 3: Nutrition Goal & Activity Level
  const [goal, setGoal] = useState<FitnessGoal>('lean_bulk');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoginWithPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('נא למלא אימייל וסיסמה');
      return;
    }

    setLoading(true);
    const users = StorageService.getUsersRegistry();
    const existingUser = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      const loggedIn: UserProfile = {
        ...existingUser,
        isLoggedIn: true,
      };
      onLoginSuccess(loggedIn);
      onClose();
    } else {
      // First time user without prior registration -> redirect to onboarding register
      setMode('register');
      setName(email.split('@')[0]);
      setStep(1);
      setError('משתמש לא נמצא. מלא את הפרטים להרשמה וקביעת יעדים אישיים.');
    }
    setLoading(false);
  };

  const handleProceedToMetrics = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('נא למלא את כל השדות כדי להמשיך');
      return;
    }

    const users = StorageService.getUsersRegistry();
    const existing = users.find((u) => u.email?.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      setError('משתמש עם כתובת אימייל זו כבר קיים. עבור למסך התחברות.');
      return;
    }

    setStep(2);
  };

  const handleProceedToGoal = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!age || !height || !currentWeight || !targetWeight) {
      setError('נא למלא את כל מדדי הגוף');
      return;
    }

    setStep(3);
  };

  const handleFinishOnboarding = () => {
    setLoading(true);

    // Calculate personalized scientific targets
    const calculated = calculateScientificTargets(
      gender,
      age,
      height,
      currentWeight,
      activityLevel,
      goal
    );

    const newUser: UserProfile = {
      id: 'usr_' + Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      isLoggedIn: true,
      isOnboarded: true,
      hasBiometrics: false,
      gender,
      age,
      height,
      currentWeight,
      targetWeight,
      activityLevel,
      goal,
      dailyCalorieTarget: calculated.calories,
      dailyProteinTarget: calculated.protein,
      dailyCarbsTarget: calculated.carbs,
      dailyFatTarget: calculated.fat,
      dailyWaterTargetGlasses: 8,
      theme: 'light',
      pushNotificationsEnabled: false,
      waterReminderEnabled: true,
      waterReminderIntervalMinutes: 120,
      mealReminderBreakfast: '08:30',
      mealReminderLunch: '13:30',
      mealReminderDinner: '19:30',
    };

    onLoginSuccess(newUser);
    onClose();
    setLoading(false);
  };

  const handleBiometricLogin = async () => {
    setError(null);
    setLoading(true);

    const isAvailable = await BiometricAuthService.isBiometricAvailable();
    if (!isAvailable) {
      setError('זיהוי ביומטרי אינו זמין במכשיר זה');
      setLoading(false);
      return;
    }

    const res = await BiometricAuthService.authenticateBiometrics(currentUser.biometricCredentialId);
    if (res.success) {
      const loggedIn: UserProfile = {
        ...currentUser,
        isLoggedIn: true,
      };
      onLoginSuccess(loggedIn);
      onClose();
    } else {
      setError(res.error || 'אימות ביומטרי נכשל. נסה באמצעות סיסמה.');
    }
    setLoading(false);
  };

  const handleContinueAsGuest = () => {
    const guestUser: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      id: 'guest_' + Date.now(),
      name: 'אורח',
      email: '',
      isLoggedIn: false,
    };
    onLoginSuccess(guestUser);
    onClose();
  };

  // Preview calculated targets for Step 3
  const previewTargets = calculateScientificTargets(
    gender,
    age || 25,
    height || 175,
    currentWeight || 75,
    activityLevel,
    goal
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface rounded-3xl w-full max-w-[440px] max-h-[90dvh] flex flex-col shadow-2xl border border-outline-variant/30 overflow-hidden animate-modal-sheet">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-surface-container-high bg-surface-container-lowest flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-teal-400 p-0.5 shadow-sm flex items-center justify-center overflow-hidden">
              <img src="/logo.png" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/icon.svg'; }} alt="NutriTrack Logo" className="w-full h-full object-cover rounded-2xl" />
            </div>
            <div>
              <h2 className="font-headline text-base font-bold text-on-surface">
                {mode === 'login' ? 'התחברות ל-NutriTrack' : `קליטת משתמש חדש (שלב ${step} מתוך 3)`}
              </h2>
              <p className="text-[11px] text-outline">
                {mode === 'login'
                  ? 'סנכרן את יומן התזונה והיעדים שלך'
                  : 'הגדרת פרופיל אישי וחישוב יעדים מדעי'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="סגור"
            className="p-2 rounded-xl text-outline hover:bg-surface-container hover:text-on-surface transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 text-xs">
          
          {/* Error Message */}
          {error && (
            <div className="p-3 mb-4 rounded-2xl bg-error-container/40 border border-error/30 text-error flex items-center gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="font-bold text-[11px]">{error}</span>
            </div>
          )}

          {/* Mode Switcher Tabs (Only when in Step 1) */}
          {step === 1 && (
            <div className="flex bg-surface-container-low p-1 rounded-2xl border border-surface-container-high mb-4">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'login'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>התחברות</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'register'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>הרשמה וקליטה</span>
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* LOGIN FORM */}
          {/* ========================================================================= */}
          {mode === 'login' && (
            <form onSubmit={handleLoginWithPassword} className="space-y-3.5 animate-in fade-in duration-150">
              <div>
                <label className="text-[11px] font-bold text-outline block mb-1">כתובת אימייל</label>
                <div className="relative flex items-center">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-3 pr-9 py-2.5 rounded-2xl bg-surface-container-low border border-surface-container-high text-on-surface text-xs focus:outline-hidden focus:border-primary"
                  />
                  <Mail className="w-4 h-4 text-outline absolute right-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-outline block mb-1">סיסמה</label>
                <div className="relative flex items-center">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3 pr-9 py-2.5 rounded-2xl bg-surface-container-low border border-surface-container-high text-on-surface text-xs focus:outline-hidden focus:border-primary"
                  />
                  <Lock className="w-4 h-4 text-outline absolute right-3 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary font-headline font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>התחבר לחשבון</span>
              </button>

              {/* Biometric Login Button */}
              {currentUser.hasBiometrics && (
                <button
                  type="button"
                  onClick={handleBiometricLogin}
                  disabled={loading}
                  className="w-full py-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs flex items-center justify-center gap-2 border border-surface-container-high transition-all"
                >
                  <Fingerprint className="w-4 h-4 text-primary" />
                  <span>התחבר עם טביעת אצבע / Face ID</span>
                </button>
              )}

              {/* Continue as Guest */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleContinueAsGuest}
                  className="text-[11px] text-outline hover:text-primary font-semibold transition-colors"
                >
                  המשך כאורח ללא הרשמה ←
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* ONBOARDING STEP 1: CREDENTIALS */}
          {/* ========================================================================= */}
          {mode === 'register' && step === 1 && (
            <form onSubmit={handleProceedToMetrics} className="space-y-3.5 animate-in fade-in duration-150">
              <div>
                <label className="text-[11px] font-bold text-outline block mb-1">שם מלא *</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="לדוגמה: אריאל שרן"
                    className="w-full pl-3 pr-9 py-2.5 rounded-2xl bg-surface-container-low border border-surface-container-high text-on-surface text-xs focus:outline-hidden focus:border-primary"
                  />
                  <User className="w-4 h-4 text-outline absolute right-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-outline block mb-1">אימייל *</label>
                <div className="relative flex items-center">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-3 pr-9 py-2.5 rounded-2xl bg-surface-container-low border border-surface-container-high text-on-surface text-xs focus:outline-hidden focus:border-primary"
                  />
                  <Mail className="w-4 h-4 text-outline absolute right-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-outline block mb-1">סיסמה *</label>
                <div className="relative flex items-center">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="לפחות 6 תווים"
                    className="w-full pl-3 pr-9 py-2.5 rounded-2xl bg-surface-container-low border border-surface-container-high text-on-surface text-xs focus:outline-hidden focus:border-primary"
                  />
                  <Lock className="w-4 h-4 text-outline absolute right-3 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary font-headline font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 mt-2"
              >
                <span>המשך לשלב הבא (מדדי גוף)</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* ONBOARDING STEP 2: BODY METRICS */}
          {/* ========================================================================= */}
          {mode === 'register' && step === 2 && (
            <form onSubmit={handleProceedToGoal} className="space-y-3.5 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-outline block mb-1">מין ביולוגי</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full p-2.5 rounded-2xl bg-surface-container-low border border-surface-container-high text-on-surface text-xs"
                  >
                    <option value="male">גבר</option>
                    <option value="female">אישה</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-outline block mb-1">גיל</label>
                  <input
                    type="number"
                    value={age === 0 ? '' : age}
                    onChange={(e) => setAge(e.target.value === '' ? 0 : Number(e.target.value))}
                    placeholder="25"
                    className="w-full p-2.5 rounded-2xl bg-surface-container-low border border-surface-container-high text-on-surface text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-outline block mb-1">גובה (ס"מ)</label>
                  <input
                    type="number"
                    value={height === 0 ? '' : height}
                    onChange={(e) => setHeight(e.target.value === '' ? 0 : Number(e.target.value))}
                    placeholder="175"
                    className="w-full p-2.5 rounded-2xl bg-surface-container-low border border-surface-container-high text-on-surface text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-outline block mb-1">משקל נוכחי (ק"ג)</label>
                  <input
                    type="number"
                    value={currentWeight === 0 ? '' : currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value === '' ? 0 : Number(e.target.value))}
                    placeholder="75"
                    className="w-full p-2.5 rounded-2xl bg-surface-container-low border border-surface-container-high text-on-surface text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-outline block mb-1">משקל יעד (ק"ג)</label>
                  <input
                    type="number"
                    value={targetWeight === 0 ? '' : targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value === '' ? 0 : Number(e.target.value))}
                    placeholder="70"
                    className="w-full p-2.5 rounded-2xl bg-surface-container-low border border-surface-container-high text-on-surface text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary font-headline font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>המשך לשלב הסופי (מטרת תזונה)</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* ONBOARDING STEP 3: NUTRITION GOAL & SCIENTIFIC SUMMARY */}
          {/* ========================================================================= */}
          {mode === 'register' && step === 3 && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div>
                <label className="text-[11px] font-bold text-outline block mb-1">בחר את מטרת התזונה שלך *</label>
                <div className="space-y-1.5">
                  {[
                    {
                      id: 'lean_bulk' as FitnessGoal,
                      title: 'עלייה נקייה במסת שריר (Lean Bulk) ⭐',
                      desc: 'עודף קלורי קל ונקי לבניית שריר מקסימלית ללא צבירת שומן מיותרת',
                    },
                    {
                      id: 'lose_weight' as FitnessGoal,
                      title: 'ירידה במשקל וחיטוב (Fat Loss)',
                      desc: 'גירעון קלורי מבוקר ושמירה על מסת שריר קיימת',
                    },
                    {
                      id: 'maintain' as FitnessGoal,
                      title: 'שמירה על משקל נוכחי (Maintenance)',
                      desc: 'מאזן ניטרלי לאיזון תזונתי ואורח חיים בריא',
                    },
                    {
                      id: 'gain_muscle' as FitnessGoal,
                      title: 'עלייה במסת שריר ומסה מלאה (Full Bulk)',
                      desc: 'עודף קלורי מלא לתוספת כוח ומסה מהירה',
                    },
                  ].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setGoal(item.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        goal === item.id
                          ? 'bg-primary/10 border-primary shadow-xs'
                          : 'bg-surface-container-low border-surface-container-high/60 hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-on-surface">{item.title}</span>
                        {goal === item.id && <Check className="w-4 h-4 text-primary" />}
                      </div>
                      <p className="text-[10px] text-outline mt-0.5">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-outline block mb-1">רמת פעילות גופנית</label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as any)}
                  className="w-full p-2.5 rounded-2xl bg-surface-container-low border border-surface-container-high text-on-surface text-xs font-semibold"
                >
                  <option value="sedentary">יושבני (ללא אימונים)</option>
                  <option value="light">קל (1-3 אימונים בשבוע)</option>
                  <option value="moderate">בינוני (3-5 אימונים בשבוע)</option>
                  <option value="active">גבוה (6-7 אימונים בשבוע)</option>
                  <option value="extra_active">גבוה מאוד (אתלטים / עבודה פיזית)</option>
                </select>
              </div>

              {/* Calculated Targets Summary Card */}
              <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-primary/30 space-y-2 shadow-xs">
                <div className="flex items-center gap-1.5 text-primary">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-bold text-xs">היעדים המדעיים המותאמים אישית עבורך:</span>
                </div>
                <div className="grid grid-cols-4 gap-1 text-center">
                  <div className="p-1.5 rounded-xl bg-surface-container-low">
                    <span className="text-[9px] text-outline block">קלוריות</span>
                    <span className="font-bold text-xs text-tertiary">{previewTargets.calories}</span>
                  </div>
                  <div className="p-1.5 rounded-xl bg-surface-container-low">
                    <span className="text-[9px] text-outline block">חלבון</span>
                    <span className="font-bold text-xs text-on-surface">{previewTargets.protein}g</span>
                  </div>
                  <div className="p-1.5 rounded-xl bg-surface-container-low">
                    <span className="text-[9px] text-outline block">פחמימה</span>
                    <span className="font-bold text-xs text-on-surface">{previewTargets.carbs}g</span>
                  </div>
                  <div className="p-1.5 rounded-xl bg-surface-container-low">
                    <span className="text-[9px] text-outline block">שומן</span>
                    <span className="font-bold text-xs text-on-surface">{previewTargets.fat}g</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-3 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleFinishOnboarding}
                  disabled={loading}
                  className="flex-1 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary font-headline font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>התחל מעקב תזונה אישי עכשיו 🚀</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
