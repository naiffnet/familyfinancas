const CACHE_NAME = 'financas-familia-v1';
const ASSETS = [
  '/app.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Allow caching to fail gracefully on some assets if they are requested dynamically
      return cache.addAll(ASSETS).catch(err => console.log("Assets caching skipped: ", err));
    }).then(() => self.skipWaiting())
  );
});

// Activate Service Worker
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch events interception
self.addEventListener('fetch', (e) => {
  // Let JSON-RPC API requests bypass the cache completely (always fetch live)
  if (e.request.url.includes('/api/')) {
    return;
  }
  
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((networkResponse) => {
        // Cache successful GET static assets dynamically
        if (e.request.method === 'GET' && networkResponse.status === 200 && !e.request.url.startsWith('chrome-extension')) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, cacheCopy);
          });
        }
        return networkResponse;
      }).catch((err) => {
        console.log("Fetch failed, offline fallback: ", err);
      });
    })
  );
});
