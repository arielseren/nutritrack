import React from 'react';
import { Bell, Calendar, Flame, Sparkles, Sun, Moon, UserCircle } from 'lucide-react';
import { formatHebrewDate } from '../../services/nutritionCalculator';

interface HeaderProps {
  currentDate: string;
  onOpenDatePicker: () => void;
  onOpenNotifications: () => void;
  onOpenAuth?: () => void;
  unreadNotificationsCount: number;
  userName?: string;
  streakDays?: number;
  currentTheme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onOpenDatePicker,
  onOpenNotifications,
  onOpenAuth,
  unreadNotificationsCount,
  userName = 'דני',
  streakDays = 5,
  currentTheme = 'light',
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-surface-container-lowest/90 backdrop-blur-md border-b border-surface-container-high px-4 py-2.5 transition-all">
      <div className="w-full max-w-[480px] mx-auto flex justify-between items-center">
        {/* Date Selector Trigger */}
        <button
          onClick={onOpenDatePicker}
          aria-label="בחר תאריך"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold active:scale-95 transition-all"
        >
          <Calendar className="w-4 h-4 text-primary" />
          <span>{formatHebrewDate(currentDate)}</span>
        </button>

        {/* Brand / Logo */}
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-headline text-xl font-bold tracking-tight text-primary">
            NutriTrack
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          {/* Quick Dark Mode Toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              aria-label={currentTheme === 'dark' ? 'עבור למצב יום' : 'עבור למצב לילה'}
              className="p-1.5 rounded-full hover:bg-surface-container-low text-on-surface-variant active:scale-90 transition-all"
              title={currentTheme === 'dark' ? 'מצב יום' : 'מצב לילה'}
            >
              {currentTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-tertiary" />
              ) : (
                <Moon className="w-4 h-4 text-primary" />
              )}
            </button>
          )}

          {/* User Auth Profile trigger */}
          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              aria-label="התחברות והרשמה"
              title={`מחובר בתור: ${userName}`}
              className="flex items-center gap-1 p-1.5 rounded-full hover:bg-surface-container-low text-on-surface-variant active:scale-95 transition-all"
            >
              <UserCircle className="w-5 h-5 text-primary" />
            </button>
          )}

          {/* Streak indicator */}
          <div
            title={`רצף של ${streakDays} ימים!`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-container/30 text-tertiary text-xs font-bold"
          >
            <Flame className="w-3.5 h-3.5 fill-tertiary text-tertiary" />
            <span>{streakDays}</span>
          </div>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            aria-label="התראות"
            className="relative p-1.5 rounded-full hover:bg-surface-container-low text-on-surface-variant active:scale-95 transition-all"
          >
            <Bell className="w-5 h-5 text-outline" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-tertiary text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
