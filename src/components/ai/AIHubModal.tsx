import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Camera,
  Mic,
  ChefHat,
  Bot,
  Key,
  Check,
  ChevronLeft,
} from 'lucide-react';
import type { UserProfile, DayLog } from '../../types';
import { calculateDayTotals, getDailyAdjustedTargets } from '../../services/nutritionCalculator';

interface AIHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  dayLog: DayLog;
  onOpenVoiceModal: () => void;
  onOpenPhotoScannerModal: (tab?: 'plate_vision' | 'label_ocr' | 'barcode') => void;
  onOpenMealGeneratorModal: () => void;
  onOpenCoachModal: () => void;
  onSaveApiKey: (key: string) => void;
}

export const AIHubModal: React.FC<AIHubModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  dayLog,
  onOpenVoiceModal,
  onOpenPhotoScannerModal,
  onOpenMealGeneratorModal,
  onOpenCoachModal,
  onSaveApiKey,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(userProfile.aiApiKey || '');
  const [isSavedKey, setIsSavedKey] = useState(false);
  const [showKeySettings, setShowKeySettings] = useState(false);

  const totals = calculateDayTotals(dayLog);
  const adjusted = getDailyAdjustedTargets(userProfile, dayLog, dayLog.date);
  const remainingKcal = Math.max(0, adjusted.targetCalories - totals.totalCalories);
  const remainingProtein = Math.max(0, adjusted.targetProtein - totals.totalProtein);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApiKey(apiKeyInput.trim());
    setIsSavedKey(true);
    setTimeout(() => setIsSavedKey(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-surface rounded-3xl border border-surface-container-high shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-surface-container-high flex items-center justify-between bg-gradient-to-r from-primary/10 via-surface to-secondary/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-primary-container text-on-primary flex items-center justify-center font-bold shadow-md">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline font-black text-base sm:text-lg text-on-surface">
                  מרכז העוזר החכם (AI Hub)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-extrabold">
                  Gemini Flash ⚡
                </span>
              </div>
              <p className="text-xs text-outline mt-0.5">
                כל כלי ה-AI של NutriTrack במקום אחד מהיר
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
            aria-label="סגור"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Daily Live Status Banner */}
          <div className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-surface-container-low border border-surface-container-high/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-headline font-black text-xs sm:text-sm text-on-surface">
                תמונת מצב תזונתית להיום
              </span>
              <span className="text-[11px] font-bold text-outline">
                {userProfile.name} • {userProfile.currentWeight} ק"ג
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-surface-container flex items-center justify-between">
                <span className="text-xs text-outline font-medium">יתרת קלוריות:</span>
                <span className="font-headline font-black text-xs sm:text-sm text-tertiary">
                  {remainingKcal} קק"ל
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-surface-container flex items-center justify-between">
                <span className="text-xs text-outline font-medium">יתרת חלבון:</span>
                <span className="font-headline font-black text-xs sm:text-sm text-primary">
                  {remainingProtein}g
                </span>
              </div>
            </div>
          </div>

          {/* 4 Main AI Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {/* 1. Voice & Natural Language */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenVoiceModal();
              }}
              className="p-4 rounded-2xl sm:rounded-3xl bg-surface-container-lowest hover:bg-surface-container border border-surface-container-high text-right flex flex-col justify-between transition-all active:scale-98 shadow-xs group"
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Mic className="w-5 h-5" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold">
                  הזנה קולית
                </span>
              </div>
              <div>
                <span className="font-headline font-black text-sm text-on-surface block">
                  הזנה חופשית וקולית
                </span>
                <span className="text-xs text-outline mt-1 block">
                  דבר או הקלד משפט חופשי בעברית, והארוחה תירשם אוטומטית.
                </span>
              </div>
            </button>

            {/* 2. Photo & Plate Vision */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPhotoScannerModal('plate_vision');
              }}
              className="p-4 rounded-2xl sm:rounded-3xl bg-surface-container-lowest hover:bg-surface-container border border-surface-container-high text-right flex flex-col justify-between transition-all active:scale-98 shadow-xs group"
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div className="w-10 h-10 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-secondary/10 text-secondary font-bold">
                  סורק צלחת
                </span>
              </div>
              <div>
                <span className="font-headline font-black text-sm text-on-surface block">
                  סריקת תמונה וצלחת
                </span>
                <span className="text-xs text-outline mt-1 block">
                  צלם את המנה – ה-AI יזהה מרכיבים, יחשב גרמים ויוסיף ליומן.
                </span>
              </div>
            </button>

            {/* 3. Meal & Recipe Suggester */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenMealGeneratorModal();
              }}
              className="p-4 rounded-2xl sm:rounded-3xl bg-surface-container-lowest hover:bg-surface-container border border-surface-container-high text-right flex flex-col justify-between transition-all active:scale-98 shadow-xs group"
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div className="w-10 h-10 rounded-2xl bg-tertiary/10 text-tertiary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ChefHat className="w-5 h-5" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-tertiary/10 text-tertiary font-bold">
                  שף חכם
                </span>
              </div>
              <div>
                <span className="font-headline font-black text-sm text-on-surface block">
                  מחולל מתכונים והשלמת מאקרו
                </span>
                <span className="text-xs text-outline mt-1 block">
                  התאמת מתכונים מדויקים להשלמת חוסרי קלוריות וחלבון להיום.
                </span>
              </div>
            </button>

            {/* 4. AI Personal Nutrition Coach */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCoachModal();
              }}
              className="p-4 rounded-2xl sm:rounded-3xl bg-surface-container-lowest hover:bg-surface-container border border-surface-container-high text-right flex flex-col justify-between transition-all active:scale-98 shadow-xs group"
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold">
                  מאמן אישי
                </span>
              </div>
              <div>
                <span className="font-headline font-black text-sm text-on-surface block">
                  מאמן תזונה וספורט
                </span>
                <span className="text-xs text-outline mt-1 block">
                  התייעצות חכמה, טיפול בתחושת שובע/נפיחות והתאמת תפריטים.
                </span>
              </div>
            </button>
          </div>

          {/* Quick OCR Label Link Card */}
          <div
            onClick={() => {
              onClose();
              onOpenPhotoScannerModal('label_ocr');
            }}
            className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container-high flex items-center justify-between cursor-pointer hover:bg-surface-container transition-all active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-on-surface block">
                  סריקת תווית ערכים תזונתיים (100 גרם)
                </span>
                <span className="text-[11px] text-outline">
                  צילום גב אריזת מוצר ושמירה מיידית למאגר המאכלים שלך
                </span>
              </div>
            </div>
            <ChevronLeft className="w-4 h-4 text-outline" />
          </div>

          {/* API Key Toggle Settings */}
          <div className="pt-2 border-t border-surface-container-high">
            <button
              type="button"
              onClick={() => setShowKeySettings(!showKeySettings)}
              className="text-xs font-bold text-outline hover:text-primary flex items-center gap-1.5 transition-colors"
            >
              <Key className="w-3.5 h-3.5" />
              <span>הגדרות מפתח אישי (Google Gemini API Key)</span>
            </button>

            {showKeySettings && (
              <form onSubmit={handleSaveKey} className="mt-3 p-3.5 rounded-2xl bg-surface-container space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface">מפתח API אישי:</span>
                  <span className="text-[10px] text-outline">אופציונלי (קיימת הדמיה מובנית)</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="flex-1 p-2.5 rounded-xl bg-surface-container-lowest border border-surface-container-high text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-1"
                  >
                    {isSavedKey ? <Check className="w-3.5 h-3.5" /> : 'שמור'}
                  </button>
                </div>
                <p className="text-[10px] text-outline leading-relaxed">
                  המפתח נשמר בצורה מקומית בלבד בדפדפן שלך ולא מועבר לשום גורם חיצוני.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-surface-container-high bg-surface-container-low/60 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-all"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};
