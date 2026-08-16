import {
  Calendar,
  Bell,
  Sun,
  Moon,
  Flame,
  BookOpen,
} from 'lucide-react';
import { formatHebrewDate } from '../../services/nutritionCalculator';

interface HeaderProps {
  currentDate: string;
  onOpenDatePicker: () => void;
  onOpenNotifications: () => void;
  onOpenUserGuide?: () => void;
  unreadNotificationsCount?: number;
  streakCount?: number;
  currentTheme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onOpenDatePicker,
  onOpenNotifications,
  onOpenUserGuide,
  unreadNotificationsCount = 0,
  streakCount = 0,
  currentTheme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-surface-container-high px-4 pb-2.5 header-safe-top transition-colors">
      <div className="max-w-[480px] mx-auto flex items-center justify-between gap-2">
        
        {/* Left / Brand Side (RTL) */}
        <div className="flex items-center gap-2">
          {/* Professional Brand Logo Icon */}
          <div className="w-8 h-8 rounded-xl overflow-hidden shadow-xs flex-shrink-0 bg-primary/10 border border-primary/20">
            <img src="/logo.png" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/icon.svg'; }} alt="NutriTrack Logo" className="w-full h-full object-cover" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-headline font-extrabold text-sm tracking-tight text-on-surface">
                NutriTrack
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-primary/10 text-primary font-bold">
                ישראל
              </span>
            </div>
            
            {/* Date Picker trigger */}
            <button
              onClick={onOpenDatePicker}
              className="flex items-center gap-1 text-[11px] text-outline hover:text-primary transition-colors text-right"
              aria-label="בחר תאריך"
            >
              <Calendar className="w-3 h-3 text-primary" />
              <span>{formatHebrewDate(currentDate)}</span>
            </button>
          </div>
        </div>

        {/* Right / Actions Side */}
        <div className="flex items-center gap-1.5">
          {/* Streak Counter Badge */}
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-xl border text-[11px] font-bold shadow-2xs transition-all ${
              streakCount > 0
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                : 'bg-surface-container-low border-surface-container-high text-outline'
            }`}
            title={streakCount > 0 ? `רצף יומי של ${streakCount} ימים ברציפות! כל הכבוד! 🔥` : 'התחל רצף יומי על ידי תיעוד ארוחה או מים היום! 🔥'}
          >
            <Flame className={`w-3.5 h-3.5 ${streakCount > 0 ? 'fill-amber-500 text-amber-500 animate-pulse' : 'text-outline'}`} />
            <span>{streakCount}</span>
          </div>

          {/* User Guide Button */}
          {onOpenUserGuide && (
            <button
              onClick={onOpenUserGuide}
              aria-label="מדריך למשתמש"
              className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-primary transition-all active:scale-95"
              title="מדריך למשתמש"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          )}

          {/* Quick Theme Toggle (Light / Dark) */}
          <button
            onClick={onToggleTheme}
            aria-label={currentTheme === 'dark' ? 'עבור למצב יום' : 'עבור למצב לילה'}
            className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-on-surface-variant transition-all active:scale-95"
            title={currentTheme === 'dark' ? 'מצב יום' : 'מצב לילה'}
          >
            {currentTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            aria-label="התראות"
            className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-on-surface-variant relative transition-all active:scale-95"
            title="התראות ותזכורות"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
