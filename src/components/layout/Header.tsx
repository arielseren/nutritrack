import React from 'react';
import {
  Calendar,
  Bell,
  Sun,
  Moon,
  Flame,
  User,
} from 'lucide-react';
import { formatHebrewDate } from '../../services/nutritionCalculator';

interface HeaderProps {
  currentDate: string;
  onOpenDatePicker: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  unreadNotificationsCount?: number;
  userName?: string;
  isLoggedIn?: boolean;
  currentTheme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onOpenDatePicker,
  onOpenNotifications,
  onOpenProfile,
  onOpenAuth,
  unreadNotificationsCount = 0,
  userName = 'דני',
  isLoggedIn = true,
  currentTheme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-surface-container-high px-4 py-2.5 transition-colors">
      <div className="max-w-[480px] mx-auto flex items-center justify-between gap-2">
        
        {/* Left / Brand Side (RTL) */}
        <div className="flex items-center gap-2">
          {/* Professional Brand Logo Icon */}
          <div className="w-8 h-8 rounded-xl overflow-hidden shadow-xs flex-shrink-0 bg-primary/10 border border-primary/20">
            <img src="/icon.svg" alt="NutriTrack Logo" className="w-full h-full object-cover" />
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
            className="flex items-center gap-1 px-2 py-1 rounded-xl bg-surface-container-low border border-surface-container-high text-[11px] font-bold text-tertiary shadow-2xs"
            title="רצף יומי של 5 ימים!"
          >
            <Flame className="w-3.5 h-3.5 fill-tertiary text-tertiary animate-pulse" />
            <span>5</span>
          </div>

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

          {/* User Account / Profile Avatar */}
          {isLoggedIn ? (
            <button
              onClick={onOpenProfile}
              aria-label="פרופיל משתמש"
              className="flex items-center gap-1.5 p-1 pl-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high transition-all active:scale-95"
              title={`מחובר בתור ${userName} - לחץ להגדרות או יציאה`}
            >
              <div className="w-6 h-6 rounded-lg bg-primary text-on-primary text-xs font-bold flex items-center justify-center shadow-2xs">
                {userName ? userName.charAt(0) : 'U'}
              </div>
              <span className="text-[11px] font-bold text-on-surface max-w-[60px] truncate hidden sm:inline-block">
                {userName}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              aria-label="התחברות"
              className="px-2.5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-1 shadow-xs hover:opacity-90 active:scale-95 transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>התחבר</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
