import React, { useState } from 'react';
import {
  Bell,
  X,
  Check,
  Droplets,
  Utensils,
  Award,
  Sparkles,
  Clock,
  Send,
  Info,
} from 'lucide-react';
import type { NotificationItem, UserProfile } from '../../types';
import { NotificationService } from '../../services/notificationService';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  userProfile?: UserProfile;
  onSaveProfile?: (profile: UserProfile) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  userProfile,
  onSaveProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'settings'>('list');
  const [testMessage, setTestMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTogglePush = async () => {
    if (!userProfile || !onSaveProfile) return;

    if (!userProfile.pushNotificationsEnabled) {
      const granted = await NotificationService.requestPermission();
      const updated: UserProfile = {
        ...userProfile,
        pushNotificationsEnabled: granted,
      };
      onSaveProfile(updated);
      if (granted) {
        setTestMessage('התראות ה-Push הופעלו בהצלחה! 🔔');
        await NotificationService.sendTestPushNotification();
      } else {
        setTestMessage('נא לאשר קבלת התראות בהגדרות הדפדפן.');
      }
    } else {
      const updated: UserProfile = {
        ...userProfile,
        pushNotificationsEnabled: false,
      };
      onSaveProfile(updated);
      setTestMessage('התראות ה-Push כובו.');
    }
  };

  const handleSendTestPush = async () => {
    setTestMessage('שולח התראת בדיקה...');
    const sent = await NotificationService.sendTestPushNotification();
    if (sent) {
      setTestMessage('התראת בדיקה נשלחה בהצלחה! 🔔');
    } else {
      setTestMessage('נא להפעיל הרשאות התראה תחילה.');
    }
    setTimeout(() => setTestMessage(null), 3500);
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'water':
        return <Droplets className="w-4 h-4 text-primary" />;
      case 'meal':
        return <Utensils className="w-4 h-4 text-tertiary" />;
      case 'goal':
        return <Award className="w-4 h-4 text-primary" />;
      default:
        return <Sparkles className="w-4 h-4 text-secondary" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[480px] max-h-[90dvh] bg-surface rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-surface-container-high animate-modal-sheet modal-safe-bottom">
        
        {/* Header */}
        <div className="p-4 border-b border-surface-container-high flex items-center justify-between bg-surface-container-lowest flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm text-on-surface">התראות ותזכורות</h3>
              <p className="text-[10px] text-outline">ניהול תזכורות לארוחות, מים ועמידה ביעדים</p>
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

        {/* Tab Switcher */}
        <div className="p-2.5 bg-surface-container-low border-b border-surface-container-high flex-shrink-0">
          <div className="flex bg-surface-container p-1 rounded-2xl border border-surface-container-high">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'list'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>התראות אחרונות</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'settings'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>הגדרת זמני תזכורת</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 text-xs">
          {activeTab === 'list' ? (
            /* Notifications List */
            notifications.length === 0 ? (
              <div className="py-12 text-center text-outline">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="font-semibold text-xs">אין התראות חדשות</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                      n.read
                        ? 'bg-surface-container-low/60 border-surface-container-high/60 text-outline'
                        : 'bg-surface-container-lowest border-primary/20 text-on-surface shadow-2xs'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="font-bold text-xs truncate">{n.title}</h4>
                        <span className="text-[10px] text-outline flex-shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed opacity-90">{n.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Reminder Settings Tab */
            userProfile && onSaveProfile && (
              <div className="space-y-3.5 animate-in fade-in duration-150">
                {/* Push Toggle */}
                <div className="p-3 rounded-2xl bg-surface-container-low border border-surface-container-high flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-on-surface block text-xs">התראות Push פעילות במכשיר</span>
                    <span className="text-[10px] text-outline">קבלת תזכורות בזמן אמת</span>
                  </div>
                  <button
                    onClick={handleTogglePush}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                      userProfile.pushNotificationsEnabled ? 'bg-primary justify-end' : 'bg-surface-container-high justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-surface shadow-md block" />
                  </button>
                </div>

                {testMessage && (
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary text-[11px] font-bold flex items-center gap-2">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    <span>{testMessage}</span>
                  </div>
                )}

                {/* Independent Meal Reminder Times */}
                <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container-high space-y-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-surface-container-high">
                    <span className="font-bold text-xs text-on-surface">זמני תזכורות ארוחות עצמאיות</span>
                    <span className="text-[10px] text-outline">שעה מדויקת</span>
                  </div>

                  <div className="space-y-2">
                    {/* Breakfast */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low border border-surface-container-high/60">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🍳</span>
                        <span className="font-bold text-xs text-on-surface">ארוחת בוקר</span>
                      </div>
                      <input
                        type="time"
                        value={userProfile.mealReminderBreakfast || '08:30'}
                        onChange={(e) => {
                          onSaveProfile({
                            ...userProfile,
                            mealReminderBreakfast: e.target.value,
                          });
                        }}
                        className="px-2 py-1 rounded-lg bg-surface-container font-bold text-xs text-on-surface text-center"
                      />
                    </div>

                    {/* Lunch */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low border border-surface-container-high/60">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🥗</span>
                        <span className="font-bold text-xs text-on-surface">ארוחת צהריים</span>
                      </div>
                      <input
                        type="time"
                        value={userProfile.mealReminderLunch || '13:30'}
                        onChange={(e) => {
                          onSaveProfile({
                            ...userProfile,
                            mealReminderLunch: e.target.value,
                          });
                        }}
                        className="px-2 py-1 rounded-lg bg-surface-container font-bold text-xs text-on-surface text-center"
                      />
                    </div>

                    {/* Dinner */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low border border-surface-container-high/60">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🍽️</span>
                        <span className="font-bold text-xs text-on-surface">ארוחת ערב</span>
                      </div>
                      <input
                        type="time"
                        value={userProfile.mealReminderDinner || '19:30'}
                        onChange={(e) => {
                          onSaveProfile({
                            ...userProfile,
                            mealReminderDinner: e.target.value,
                          });
                        }}
                        className="px-2 py-1 rounded-lg bg-surface-container font-bold text-xs text-on-surface text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Test Notification Button */}
                <button
                  onClick={handleSendTestPush}
                  className="w-full py-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs flex items-center justify-center gap-2 border border-surface-container-high transition-all"
                >
                  <Send className="w-3.5 h-3.5 text-primary" />
                  <span>שלח התראת בדיקה למכשיר שלי עכשיו 🔔</span>
                </button>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-surface-container-lowest border-t border-surface-container-high flex items-center justify-between flex-shrink-0">
          {activeTab === 'list' && (
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>סמן הכל כנקרא</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-primary text-on-primary font-bold text-xs mr-auto"
          >
            סגור
          </button>
        </div>

      </div>
    </div>
  );
};
