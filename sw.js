const CACHE_NAME = 'lucky-draw-tracker-v2'; // Bumped version
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', (e) => {
  self.skipWaiting(); // Force the new service worker to activate immediately
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // Clear out the old stubborn cache
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-First Strategy
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        // If network fetch is successful, clone it to the cache and return it
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // If network fails (offline), fallback to the cache
        return caches.match(e.request);
      })
  );
});
