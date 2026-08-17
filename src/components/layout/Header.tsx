import React from 'react';
import {
  Calendar,
  Bell,
  Sun,
  Moon,
  Flame,
  Sparkles,
} from 'lucide-react';
import { formatHebrewDate } from '../../services/nutritionCalculator';

interface HeaderProps {
  currentDate: string;
  onOpenDatePicker: () => void;
  onOpenNotifications: () => void;
  onOpenAIHub?: () => void;
  unreadNotificationsCount?: number;
  streakCount?: number;
  currentTheme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onOpenDatePicker,
  onOpenNotifications,
  onOpenAIHub,
  unreadNotificationsCount = 0,
  streakCount = 0,
  currentTheme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-surface-container-high px-3 sm:px-4 pb-2 sm:pb-2.5 header-safe-top transition-colors">
      <div className="w-full max-w-[480px] mx-auto flex items-center justify-between gap-1 sm:gap-2">
        
        {/* Left / Brand Side (RTL) */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Professional Brand Logo Icon */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl overflow-hidden shadow-xs flex-shrink-0 bg-primary/10 border border-primary/20">
            <img src="/logo.png" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/icon.svg'; }} alt="NutriTrack Logo" className="w-full h-full object-cover" />
          </div>

          <div className="flex flex-col min-w-0">
            <span className="font-headline font-extrabold text-sm sm:text-base tracking-tight text-on-surface leading-tight truncate">
              NutriTrack
            </span>
            
            {/* Date Picker trigger */}
            <button
              onClick={onOpenDatePicker}
              className="flex items-center gap-1 text-[11px] sm:text-xs text-outline hover:text-primary transition-colors text-right font-medium mt-0.5 truncate"
              aria-label="בחר תאריך"
            >
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary flex-shrink-0" />
              <span className="truncate">{formatHebrewDate(currentDate)}</span>
            </button>
          </div>
        </div>

        {/* Right / Actions Side */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          {/* Streak Counter Badge */}
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-xl border text-[11px] sm:text-xs font-extrabold shadow-2xs transition-all ${
              streakCount > 0
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                : 'bg-surface-container-low border-surface-container-high text-outline'
            }`}
            title={streakCount > 0 ? `רצף יומי של ${streakCount} ימים ברציפות! כל הכבוד! 🔥` : 'התחל רצף יומי על ידי תיעוד ארוחה או מים היום! 🔥'}
          >
            <Flame className={`w-3.5 h-3.5 ${streakCount > 0 ? 'fill-amber-500 text-amber-500 animate-pulse' : 'text-outline'}`} />
            <span>{streakCount}</span>
          </div>

          {/* AI Assistant Hub Button */}
          {onOpenAIHub && (
            <button
              onClick={onOpenAIHub}
              aria-label="עוזר תזונה AI"
              className="px-2 py-1 rounded-xl bg-gradient-to-r from-primary/15 to-primary-container/25 hover:from-primary/25 hover:to-primary-container/35 border border-primary/30 text-primary font-black text-[11px] sm:text-xs transition-all active:scale-95 shadow-xs flex items-center gap-1"
              title="מרכז העוזר החכם AI"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-primary" />
              <span>AI</span>
            </button>
          )}

          {/* Quick Theme Toggle (Light / Dark) */}
          <button
            onClick={onToggleTheme}
            aria-label={currentTheme === 'dark' ? 'עבור למצב יום' : 'עבור למצב לילה'}
            className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-on-surface-variant transition-all active:scale-95 shadow-xs"
            title={currentTheme === 'dark' ? 'מצב יום' : 'מצב לילה'}
          >
            {currentTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-secondary" />
            )}
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            aria-label="התראות"
            className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-on-surface-variant relative transition-all active:scale-95 shadow-xs"
            title="התראות"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-tertiary ring-2 ring-surface animate-pulse" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
