/**
 * Service Worker for Hi'Mom PWA
 * Implements cache-first strategy with offline fallback
 */

const CACHE_NAME = 'himom-cache-v1';
const OFFLINE_URL = '/offline.html';

// Resources to cache immediately on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/modules/camera.js',
    '/modules/vision.js',
    '/modules/speech.js',
    '/modules/conversation.js',
    '/manifest.json',
    '/offline.html'
];

/**
 * Install Event - Cache static assets
 */
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[Service Worker] Installation complete');
                return self.skipWaiting(); // Activate immediately
            })
            .catch((error) => {
                console.error('[Service Worker] Cache installation failed:', error);
            })
    );
});

/**
 * Activate Event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => {
                            console.log('[Service Worker] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activation complete');
                return self.clients.claim(); // Take control of all clients
            })
    );
});

/**
 * Fetch Event - Serve from cache, fallback to network
 * Uses cache-first strategy with offline fallback
 */
self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);
    
    // Skip cross-origin requests
    if (requestUrl.origin !== location.origin) {
        return;
    }
    
    // Special handling for API calls - always use network
    if (requestUrl.pathname.startsWith('/api/')) {
        event.respondWith(networkFirst(requestUrl));
        return;
    }
    
    // For static assets - use cache-first strategy
    event.respondWith(cacheFirst(event.request));
});

/**
 * Cache-First Strategy
 * Try cache first, then network, then offline page
 */
async function cacheFirst(request) {
    try {
        // Try to get from cache
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            console.log('[Service Worker] Serving from cache:', request.url);
            
            // Update cache in background (stale-while-revalidate)
            fetch(request).then((response) => {
                if (response && response.status === 200) {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, response);
                    });
                }
            }).catch(() => {
                // Ignore background update errors
            });
            
            return cachedResponse;
        }
        
        // Not in cache, fetch from network
        console.log('[Service Worker] Fetching from network:', request.url);
        const networkResponse = await fetch(request);
        
        if (networkResponse && networkResponse.status === 200) {
            // Clone the response for caching
            const responseToCache = networkResponse.clone();
            
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
            });
        }
        
        return networkResponse;
        
    } catch (error) {
        console.error('[Service Worker] Fetch failed:', error);
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            const offlineResponse = await caches.match(OFFLINE_URL);
            if (offlineResponse) {
                return offlineResponse;
            }
        }
        
        // Return a basic offline response
        return new Response('You are offline. Please check your connection.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: {
                'Content-Type': 'text/plain'
            }
        });
    }
}

/**
 * Network-First Strategy (for API calls)
 * Try network first, then cache as fallback
 */
async function networkFirst(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        if (networkResponse && networkResponse.status === 200) {
            // Cache successful API responses temporarily
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
            });
        }
        
        return networkResponse;
        
    } catch (error) {
        console.error('[Service Worker] API call failed:', error);
        
        // Try to get from cache as fallback
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('[Service Worker] Serving API from cache:', request.url);
            return cachedResponse;
        }
        
        // No cache available, return error
        return new Response(JSON.stringify({
            error: 'Network error. Please check your connection.'
        }), {
            status: 503,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}

/**
 * Handle push notifications (optional, for future use)
 */
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push received');
    
    const options = {
        body: event.data ? event.data.text() : 'New message from Hi\'Mom',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            { action: 'explore', title: 'Open App' },
            { action: 'close', title: 'Close' }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Hi\'Mom', options)
    );
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
