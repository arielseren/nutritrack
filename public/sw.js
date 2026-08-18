// NutriTrack Service Worker - Handles background Push Notifications, Periodic Background Sync & PWA Caching

const CACHE_NAME = 'nutritrack-cache-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Cleanup old caches
      caches.keys().then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) return caches.delete(key);
          })
        )
      ),
    ])
  );
});

// Storage for scheduled reminders in ServiceWorker
let activeSchedule = null;

// Handle messages from the React app (sync reminder settings)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_REMINDERS') {
    activeSchedule = event.data.schedule;
    
    // Attempt Notification Trigger API if supported
    if ('showTrigger' in self.Notification.prototype && activeSchedule) {
      scheduleNotificationTriggers(activeSchedule);
    }
  }
});

// Helper to schedule future notification triggers (where supported by browser)
async function scheduleNotificationTriggers(schedule) {
  try {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Schedule breakfast
    if (schedule.breakfast) {
      const [bHour, bMin] = schedule.breakfast.split(':').map(Number);
      const bDate = new Date();
      bDate.setHours(bHour, bMin, 0, 0);
      if (bDate > now && 'TimestampTrigger' in self) {
        await self.registration.showNotification('🍳 זמן לארוחת בוקר - NutriTrack', {
          body: 'אל תשכח לתעד את ארוחת הבוקר שלך ולפתוח את היום באנרגיה!',
          icon: '/icon.svg',
          badge: '/icon.svg',
          tag: `meal-breakfast-${todayStr}`,
          showTrigger: new self.TimestampTrigger(bDate.getTime()),
          dir: 'rtl',
          lang: 'he',
        });
      }
    }

    // Schedule lunch
    if (schedule.lunch) {
      const [lHour, lMin] = schedule.lunch.split(':').map(Number);
      const lDate = new Date();
      lDate.setHours(lHour, lMin, 0, 0);
      if (lDate > now && 'TimestampTrigger' in self) {
        await self.registration.showNotification('🥗 זמן לארוחת צהריים - NutriTrack', {
          body: 'הגיע הזמן להפסקת צהריים מזינה. פתח את היומן ותעד את המנה.',
          icon: '/icon.svg',
          badge: '/icon.svg',
          tag: `meal-lunch-${todayStr}`,
          showTrigger: new self.TimestampTrigger(lDate.getTime()),
          dir: 'rtl',
          lang: 'he',
        });
      }
    }

    // Schedule dinner
    if (schedule.dinner) {
      const [dHour, dMin] = schedule.dinner.split(':').map(Number);
      const dDate = new Date();
      dDate.setHours(dHour, dMin, 0, 0);
      if (dDate > now && 'TimestampTrigger' in self) {
        await self.registration.showNotification('🍲 זמן לארוחת ערב - NutriTrack', {
          body: 'סוגרים את היום! תעד את ארוחת הערב ובדוק את עמידתך ביעדים.',
          icon: '/icon.svg',
          badge: '/icon.svg',
          tag: `meal-dinner-${todayStr}`,
          showTrigger: new self.TimestampTrigger(dDate.getTime()),
          dir: 'rtl',
          lang: 'he',
        });
      }
    }
  } catch (err) {
    console.warn('Notification trigger scheduling error:', err);
  }
}

// Periodic Background Sync (runs in background on Android Chrome / Desktop Edge)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'nutritrack-reminders') {
    event.waitUntil(checkBackgroundReminders());
  }
});

async function checkBackgroundReminders() {
  if (!activeSchedule) return;

  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;
  const todayStr = now.toISOString().split('T')[0];

  // Water check
  if (
    activeSchedule.waterEnabled &&
    activeSchedule.waterGlasses < activeSchedule.waterTarget &&
    now.getHours() >= 9 &&
    now.getHours() <= 21
  ) {
    const remaining = activeSchedule.waterTarget - activeSchedule.waterGlasses;
    await self.registration.showNotification('💧 תזכורת שתיית מים', {
      body: `שתית ${activeSchedule.waterGlasses} מתוך ${activeSchedule.waterTarget} כוסות (נותרו עוד ${remaining}). קח כוס מים צוננת!`,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: `nutritrack-water-${todayStr}-${now.getHours()}`,
      dir: 'rtl',
      lang: 'he',
    });
  }

  // Meal Checks
  if (activeSchedule.breakfast && activeSchedule.breakfast === currentTimeStr) {
    await self.registration.showNotification('🍳 זמן לארוחת בוקר - NutriTrack', {
      body: 'אל תשכח לתעד את ארוחת הבוקר שלך ולפתוח את היום באנרגיה!',
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: `meal-breakfast-${todayStr}`,
      dir: 'rtl',
      lang: 'he',
    });
  }

  if (activeSchedule.lunch && activeSchedule.lunch === currentTimeStr) {
    await self.registration.showNotification('🥗 זמן לארוחת צהריים - NutriTrack', {
      body: 'הגיע הזמן להפסקת צהריים מזינה. פתח את היומן ותעד את המנה.',
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: `meal-lunch-${todayStr}`,
      dir: 'rtl',
      lang: 'he',
    });
  }

  if (activeSchedule.dinner && activeSchedule.dinner === currentTimeStr) {
    await self.registration.showNotification('🍲 זמן לארוחת ערב - NutriTrack', {
      body: 'סוגרים את היום! תעד את ארוחת הערב ובדוק את עמידתך ביעדים.',
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: `meal-dinner-${todayStr}`,
      dir: 'rtl',
      lang: 'he',
    });
  }
}

// Push Event listener for Web Push notifications (Server-to-Client Push)
self.addEventListener('push', (event) => {
  let data = {
    title: '🥗 NutriTrack - תזכורת תזונה',
    body: 'הגיע הזמן לעקוב אחר התזונה ושתיית המים שלך היום!',
    icon: '/icon.svg',
    badge: '/icon.svg',
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon.svg',
    badge: data.badge || '/icon.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      { action: 'explore', title: 'פתח אפליקציה' },
      { action: 'close', title: 'סגור' },
    ],
    dir: 'rtl',
    lang: 'he',
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/') && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
