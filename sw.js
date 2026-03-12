const CACHE_NAME = 'localboost-ia-v1';
const STATIC_CACHE_NAME = 'localboost-static-v1';
const DYNAMIC_CACHE_NAME = 'localboost-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

const API_ENDPOINTS = [
  'https://gemini.google.com/app?hl=es-ES'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests
  if (STATIC_ASSETS.includes(url.pathname) || 
      url.pathname === '/' || 
      url.pathname.endsWith('.html') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.js')) {
    
    // Static assets - Cache First strategy
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            console.log('Service Worker: Serving from cache:', request.url);
            return cachedResponse;
          }
          
          // Not in cache, fetch from network
          return fetch(request)
            .then((networkResponse) => {
              // Cache the response for future use
              if (networkResponse.ok) {
                return caches.open(STATIC_CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, networkResponse.clone());
                    return networkResponse;
                  });
              }
              return networkResponse;
            })
            .catch(() => {
              // Network failed, try to serve from cache
              console.log('Service Worker: Network failed, trying cache');
              return caches.match(request);
            });
        })
    );
    
  } else if (url.origin === 'https://gemini.google.com') {
    
    // API requests - Network First strategy
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            // Cache successful API responses
            return caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, networkResponse.clone());
                return networkResponse;
              });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed, try to serve from cache
          console.log('Service Worker: API failed, trying cache');
          return caches.match(request);
        })
    );
    
  } else {
    
    // Other requests - Network First with cache fallback
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            // Cache successful responses
            return caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, networkResponse.clone());
                return networkResponse;
              });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed, try to serve from cache
          console.log('Service Worker: Request failed, trying cache');
          return caches.match(request);
        })
    );
  }
});

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'You have new marketing content ideas!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore Content',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-96x96.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('LocalBoost IA', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    // Open the app to explore content
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    event.notification.close();
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync helper function
function doBackgroundSync() {
  return new Promise((resolve, reject) => {
    // Perform background sync operations
    console.log('Service Worker: Performing background sync');
    
    // Example: Sync calendar data, image gallery, etc.
    syncCalendarData()
      .then(() => syncImageGallery())
      .then(() => syncChatHistory())
      .then(() => {
        console.log('Service Worker: Background sync completed');
        resolve();
      })
      .catch((error) => {
        console.error('Service Worker: Background sync failed:', error);
        reject(error);
      });
  });
}

// Sync functions for different data types
function syncCalendarData() {
  return new Promise((resolve) => {
    // Sync calendar data with server
    console.log('Service Worker: Syncing calendar data');
    setTimeout(resolve, 1000);
  });
}

function syncImageGallery() {
  return new Promise((resolve) => {
    // Sync image gallery with server
    console.log('Service Worker: Syncing image gallery');
    setTimeout(resolve, 1000);
  });
}

function syncChatHistory() {
  return new Promise((resolve) => {
    // Sync chat history with server
    console.log('Service Worker: Syncing chat history');
    setTimeout(resolve, 1000);
  });
}

// Cache cleanup function
function cleanupCache() {
  return caches.keys().then((cacheNames) => {
    return Promise.all(
      cacheNames.map((cacheName) => {
        if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
          return caches.delete(cacheName);
        }
      })
    );
  });
}

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_UPDATE') {
    cleanupCache().then(() => {
      event.ports[0].postMessage({ type: 'CACHE_UPDATED' });
    });
  }
});
