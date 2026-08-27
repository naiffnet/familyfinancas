// Service Worker Killer / Cache Purger for clean LAN and Web operation
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Always fetch live from network without stale cache interception
  e.respondWith(fetch(e.request));
});

