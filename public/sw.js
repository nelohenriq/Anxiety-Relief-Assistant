const CACHE_NAME = 'serene-cache-v2';
const RUNTIME_CACHE = 'serene-runtime-v2';

// Core app shell files that make up the basic UI
const APP_SHELL_CACHE = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.svg',
  '/icon-512.svg'
];

// Audio files that should be cached for offline functionality
const AUDIO_CACHE_PATTERNS = [
  /\/audio\//,
  /\.webm$/,
  /\.mp3$/,
  /\.wav$/,
  /\.ogg$/,
  /\.m4a$/
];

// API routes that should be cached for offline functionality
const API_CACHE_PATTERNS = [
  /\/api\/quotes/,
  /\/api\/exercises/,
  /\/api\/suggestions/
];

// Install event: cache app shell and static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        console.log('[SW] Caching app shell');

        // Cache files one by one to handle failures gracefully
        for (const url of APP_SHELL_CACHE) {
          try {
            await cache.add(url);
            console.log(`[SW] Cached: ${url}`);
          } catch (error) {
            console.warn(`[SW] Failed to cache ${url}:`, error);
            // Continue with other files even if one fails
          }
        }

        const runtimeCache = await caches.open(RUNTIME_CACHE);
        console.log('[SW] Runtime cache ready');

        console.log('[SW] Skip waiting');
        return self.skipWaiting();
      } catch (error) {
        console.error('[SW] Installation failed:', error);
        throw error;
      }
    })()
  );
});

// Activate event: clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Fetch event: implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests (CDNs, external APIs)
  if (!url.origin.includes(self.location.origin)) {
    return;
  }

  // Handle API requests with network-first strategy
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Handle audio files with cache-first strategy for better offline experience
  if (AUDIO_CACHE_PATTERNS.some(pattern => pattern.test(request.url)) ||
      request.destination === 'audio') {
    event.respondWith(audioCacheStrategy(request));
    return;
  }

  // Handle app shell and static assets with cache-first strategy
  if (APP_SHELL_CACHE.includes(url.pathname) ||
      request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Handle HTML pages with stale-while-revalidate
  if (request.destination === 'document') {
    event.respondWith(staleWhileRevalidateStrategy(request));
    return;
  }

  // Default: network first for other requests
  event.respondWith(networkFirstStrategy(request));
});

// Caching Strategies

// Cache-first: serve from cache, fallback to network
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first strategy failed:', error);
    return new Response('Offline content not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Network-first: try network first, fallback to cache
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);

    // Try cache as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If it's an API request and we're offline, return offline message
    if (request.url.includes('/api/')) {
      return new Response(JSON.stringify({
        error: 'Offline',
        message: 'This content is not available offline'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    throw error;
  }
}

// Stale-while-revalidate: serve from cache, update in background
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);

  // Start network request (don't await it)
  const networkPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => null);

  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }

  // If no cache, wait for network
  return networkPromise;
}

// Audio cache strategy: cache-first for better performance and offline support
async function audioCacheStrategy(request) {
  try {
    // Try cache first for audio files
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If not in cache, fetch from network
    const networkResponse = await fetch(request);

    // Cache successful audio responses
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Audio cache strategy failed:', error);

    // For audio files, we can return a more specific offline message
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'Audio content is not available offline',
      type: 'audio'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  // Handle any offline actions that need to be synced
  // For example, journal entries, mood logs, etc.
  console.log('[SW] Handling background sync...');

  // This would typically sync with your backend APIs
  // For now, we'll just log the action
  return Promise.resolve();
}

// Push notifications (if needed in the future)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});