const CACHE_NAME = 'cold-shower-tracker-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/components/ChallengeSetup.tsx',
  '/src/components/ChallengeTracker.tsx',
  '/src/components/ColdMeter.tsx',
  '/src/components/MusicPlayer.tsx',
  '/src/styles/calendar.css',
  '/src/utils/validation.ts',
  '/src/types.ts'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // Clone the request because it can only be used once
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response because it can only be used once
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-challenge-data') {
    event.waitUntil(syncChallengeData());
  }
});

async function syncChallengeData() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('challengeData')) {
        const response = await cache.match(request);
        if (response) {
          const data = await response.json();
          // Here you would typically sync with a backend server
          // For now, we'll just ensure it's in the cache
          await cache.put(request, new Response(JSON.stringify(data)));
        }
      }
    }
  } catch (error) {
    console.error('Error syncing challenge data:', error);
  }
} 