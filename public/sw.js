// Service Worker for PWA offline caching
const CACHE_NAME = 'travel-planner-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './assets/index.js',
  './assets/style.css'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Caching core assets');
        return cache.addAll(ASSETS_TO_CACHE).catch(err => {
          console.warn('SW: Some assets failed to cache:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network-first with cache fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and API calls
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('open-meteo.com') ||
      event.request.url.includes('api.deepseek.com') ||
      event.request.url.includes('api.xiaomimimo.com') ||
      event.request.url.includes('workers.dev')) {
    return; // Don't cache API calls
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetched = fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(() => cached);

      return cached || fetched;
    })
  );
});
