// NutriTrack Service Worker - Handles background Push Notifications & PWA Caching

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Push Event listener for Web Push notifications
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
