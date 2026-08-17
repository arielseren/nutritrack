/**
 * Web Push & System Notification Service for NutriTrack
 * Supports desktop & mobile notifications, ServiceWorker dispatch, and scheduling.
 */

export const NotificationService = {
  /**
   * Check if notifications are supported by the current browser / device
   */
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  },

  /**
   * Get current permission state: 'granted' | 'denied' | 'default'
   */
  getPermission(): NotificationPermission {
    if (!('Notification' in window)) return 'denied';
    return Notification.permission;
  },

  /**
   * Request push notification permission from the user
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported in this browser');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (err) {
      console.warn('Failed to request notification permission:', err);
      return false;
    }
  },

  /**
   * Register the Service Worker for push notifications
   */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) return null;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      return registration;
    } catch (err) {
      console.warn('Service worker registration failed:', err);
      return null;
    }
  },

  /**
   * Close / dismiss any active notification matching a specific tag
   */
  async clearNotificationByTag(tag: string): Promise<void> {
    if (!('serviceWorker' in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.getNotifications) {
        const notifs = await reg.getNotifications({ tag });
        notifs.forEach((n) => n.close());
      }
    } catch (err) {
      console.warn('Failed to clear notification by tag:', err);
    }
  },

  /**
   * Live sync water status with device notification tray
   * If user reached target -> closes any pending water reminder.
   * If user logged water -> updates notification banner text to live current count.
   */
  async syncWaterStatus(glasses: number, target: number): Promise<void> {
    if (!('serviceWorker' in navigator) || this.getPermission() !== 'granted') return;

    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.getNotifications) {
        const notifs = await reg.getNotifications({ tag: 'nutritrack-water' });
        if (glasses >= target) {
          // Goal reached, dismiss reminder banner
          notifs.forEach((n) => n.close());
        } else if (notifs.length > 0) {
          // Refresh the open notification with the live glass count
          await reg.showNotification('💧 מעקב שתיית מים מעודכן', {
            body: `שתית עד כה ${glasses} מתוך ${target} כוסות. נותרו עוד ${target - glasses} כוסות להשלמת היעד!`,
            icon: '/icon.svg',
            badge: '/icon.svg',
            tag: 'nutritrack-water',
            dir: 'rtl',
            lang: 'he',
          });
        }
      }
    } catch (e) {
      console.warn('Failed to sync water notification status:', e);
    }
  },

  /**
   * Send an immediate system / push notification to the user's device
   */
  async sendNotification(
    title: string,
    body: string,
    options?: { icon?: string; tag?: string }
  ): Promise<boolean> {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return false;
    }

    try {
      // 1. Try via Service Worker (best for mobile devices)
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(title, {
            body,
            icon: options?.icon || '/icon.svg',
            badge: '/icon.svg',
            tag: options?.tag || 'nutritrack-general',
            dir: 'rtl',
            lang: 'he',
          });
          return true;
        }
      }

      // 2. Fallback to standard window Notification
      new Notification(title, {
        body,
        icon: options?.icon || '/icon.svg',
        tag: options?.tag || 'nutritrack-general',
        dir: 'rtl',
        lang: 'he',
      });
      return true;
    } catch (err) {
      console.warn('Failed to trigger notification:', err);
      return false;
    }
  },

  /**
   * Send a test push notification to verify device compatibility
   */
  async sendTestPushNotification(): Promise<boolean> {
    const hasPermission = this.getPermission() === 'granted';
    if (!hasPermission) {
      const granted = await this.requestPermission();
      if (!granted) return false;
    }

    return this.sendNotification(
      '🥗 NutriTrack - בדיקת התראות מערכת',
      'מעולה! התראות ה-Push פעילות במכשיר שלך בהצלחה. תקבל תזכורות למים וארוחות בזמן.',
      { tag: 'nutritrack-test' }
    );
  },

  /**
   * Check schedule intervals (called periodically by the app to check meal/water reminders)
   */
  checkAndTriggerReminders(
    waterEnabled: boolean,
    waterGlasses: number,
    waterTarget: number,
    mealTimes: { breakfast?: string; lunch?: string; dinner?: string },
    weeklyWeightReminder?: { enabled?: boolean; day?: number; time?: string }
  ) {
    if (this.getPermission() !== 'granted') return;

    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;

    // 1. Water Reminder Check (only if user hasn't reached target yet)
    if (waterEnabled && waterGlasses < waterTarget && now.getHours() >= 9 && now.getHours() <= 21) {
      const lastWaterNoticeKey = `nutritrack_water_notice_${now.toISOString().split('T')[0]}_${now.getHours()}`;
      if (!localStorage.getItem(lastWaterNoticeKey)) {
        localStorage.setItem(lastWaterNoticeKey, 'sent');
        const remaining = waterTarget - waterGlasses;
        this.sendNotification(
          '💧 תזכורת שתיית מים',
          `שתית עד כה ${waterGlasses} מתוך ${waterTarget} כוסות (נותרו עוד ${remaining}). קח כוס מים צוננת!`,
          { tag: 'nutritrack-water' }
        );
      }
    }

    // 2. Meal Reminders
    if (mealTimes.breakfast && mealTimes.breakfast === currentTimeStr) {
      const key = `nutritrack_meal_notice_breakfast_${now.toISOString().split('T')[0]}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, 'sent');
        this.sendNotification(
          '🍳 זמן לארוחת בוקר!',
          'אל תשכח לתעד את ארוחת הבוקר שלך ב-NutriTrack.',
          { tag: 'nutritrack-meal-breakfast' }
        );
      }
    }

    if (mealTimes.lunch && mealTimes.lunch === currentTimeStr) {
      const key = `nutritrack_meal_notice_lunch_${now.toISOString().split('T')[0]}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, 'sent');
        this.sendNotification(
          '🥗 זמן לארוחת צהריים!',
          'הגיע הזמן להפסקת צהריים מזינה. פתח את היומן ותעד את המנה.',
          { tag: 'nutritrack-meal-lunch' }
        );
      }
    }

    if (mealTimes.dinner && mealTimes.dinner === currentTimeStr) {
      const key = `nutritrack_meal_notice_dinner_${now.toISOString().split('T')[0]}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, 'sent');
        this.sendNotification(
          '🍲 זמן לארוחת ערב!',
          'סוגרים את היום! תעד את ארוחת הערב ובדוק את עמידתך ביעדי הקלוריות והמאקרו.',
          { tag: 'nutritrack-meal-dinner' }
        );
      }
    }

    // 3. Weekly Weight Update Reminder
    if (
      weeklyWeightReminder?.enabled &&
      now.getDay() === (weeklyWeightReminder.day ?? 0) &&
      (!weeklyWeightReminder.time || weeklyWeightReminder.time === currentTimeStr)
    ) {
      const key = `nutritrack_weight_notice_${now.toISOString().split('T')[0]}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, 'sent');
        this.sendNotification(
          '⚖️ תזכורת שקילה שבועית - NutriTrack',
          'בוקר טוב! זה הזמן לעדכן את משקלך השבועי כדי לעקוב אחר קצב ההתקדמות לעבר היעד.',
          { tag: 'nutritrack-weight-reminder' }
        );
      }
    }
  },
};
