import React from 'react';
import { Bell, X, Check, Droplets, Utensils, Award, Sparkles } from 'lucide-react';
import type { NotificationItem } from '../../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
}) => {
  if (!isOpen) return null;

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
      <div className="w-full max-w-[480px] max-h-[85vh] bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-surface-container-high">
        {/* Header */}
        <div className="p-4 border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-on-surface">התראות ותזכורות</h3>
              <p className="text-xs text-outline">תזכורות לשתיית מים, ארוחות ועמידה ביעדים</p>
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

        {/* Notifications List */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1 text-xs">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-outline">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="font-semibold">אין התראות חדשות</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                  !item.read
                    ? 'bg-primary-container/10 border-primary/30'
                    : 'bg-surface-container-low/40 border-surface-container-high'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-surface-container-lowest shadow-xs flex items-center justify-center flex-shrink-0">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-on-surface text-xs">{item.title}</h4>
                    <span className="text-[10px] text-outline flex-shrink-0">{item.time}</span>
                  </div>
                  <p className="text-outline text-[11px] mt-0.5 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-surface-container-high bg-surface-container-low flex justify-end">
            <button
              onClick={onMarkAllAsRead}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>סמן הכל כנקרא</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
