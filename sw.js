const CACHE_NAME = 'serene-cache-v1';
// This list should include all the core files that make up the app shell.
const urlsToCache = [
  './',
  './index.html',
  './index.tsx', 
  './icon.svg',
  './manifest.json'
];

// Install event: opens a cache and adds the app shell files to it.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // We use addAll which is atomic: if one file fails, the whole operation fails.
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache app shell:', error);
      })
  );
});

// Fetch event: serves requests from the cache first, falling back to the network.
self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  // For requests to external resources (CDNs), we just fetch from the network.
  if (!event.request.url.startsWith(self.location.origin)) {
      return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // If we have a match in the cache, return it.
        if (response) {
          return response;
        }

        // If no match, fetch from the network.
        return fetch(event.request).then(
          (networkResponse) => {
            return networkResponse;
          }
        );
      })
  );
});

// Activate event: clean up old caches.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});