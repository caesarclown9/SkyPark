// Sky Park Service Worker для Push уведомлений
const CACHE_NAME = 'skypark-v1.0.0';
const urlsToCache = [
  '/',
  '/parks',
  '/dashboard',
  '/offline.html'
];

// Установка Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Перехват fetch запросов
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Обработка Push уведомлений
self.addEventListener('push', event => {
  console.log('Push Notification received', event);
  
  const options = {
    body: 'У вас новое уведомление от Sky Park!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Посмотреть',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Закрыть',
        icon: '/icons/xmark.png'
      }
    ]
  };

  if (event.data) {
    try {
      const notificationData = event.data.json();
      options.title = notificationData.title || 'Sky Park';
      options.body = notificationData.body || options.body;
      options.icon = notificationData.icon || options.icon;
      options.data = { ...options.data, ...notificationData.data };
    } catch (error) {
      console.error('Error parsing push data:', error);
      options.title = 'Sky Park';
    }
  } else {
    options.title = 'Sky Park';
  }

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', event => {
  console.log('Notification click received.');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  } else if (event.action === 'close') {
    // Просто закрываем уведомление
    return;
  } else {
    // Клик по самому уведомлению
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background Sync для офлайн действий
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  return new Promise((resolve) => {
    console.log('Background sync triggered');
    // Здесь можно синхронизировать данные с сервером
    resolve();
  });
} 
const CACHE_NAME = 'skypark-v1.0.0';
const urlsToCache = [
  '/',
  '/parks',
  '/dashboard',
  '/offline.html'
];

// Установка Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Перехват fetch запросов
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Обработка Push уведомлений
self.addEventListener('push', event => {
  console.log('Push Notification received', event);
  
  const options = {
    body: 'У вас новое уведомление от Sky Park!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Посмотреть',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Закрыть',
        icon: '/icons/xmark.png'
      }
    ]
  };

  if (event.data) {
    try {
      const notificationData = event.data.json();
      options.title = notificationData.title || 'Sky Park';
      options.body = notificationData.body || options.body;
      options.icon = notificationData.icon || options.icon;
      options.data = { ...options.data, ...notificationData.data };
    } catch (error) {
      console.error('Error parsing push data:', error);
      options.title = 'Sky Park';
    }
  } else {
    options.title = 'Sky Park';
  }

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', event => {
  console.log('Notification click received.');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  } else if (event.action === 'close') {
    // Просто закрываем уведомление
    return;
  } else {
    // Клик по самому уведомлению
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background Sync для офлайн действий
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  return new Promise((resolve) => {
    console.log('Background sync triggered');
    // Здесь можно синхронизировать данные с сервером
    resolve();
  });
} 