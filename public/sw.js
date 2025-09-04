// Simple Service Worker without AMD module loader
// This replaces the complex next-pwa generated SW that was causing redundant state

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.6.0/workbox-sw.js');

if (workbox) {
  console.log('Workbox loaded successfully');
  
  // Enable navigation preload
  workbox.navigationPreload.enable();
  
  // Skip waiting and claim clients immediately
  workbox.core.skipWaiting();
  workbox.core.clientsClaim();
  
  // Clean up outdated caches
  workbox.precaching.cleanupOutdatedCaches();
  
  // Precache static assets
  workbox.precaching.precacheAndRoute([
    { url: '/manifest.json', revision: '1' },
    { url: '/favicon.ico', revision: '1' },
    { url: '/icons/icon-192x192.png', revision: '1' },
    { url: '/icons/icon-512x512.png', revision: '1' }
  ]);
  
  // Cache strategies
  
  // Cache the start URL
  workbox.routing.registerRoute(
    '/',
    new workbox.strategies.NetworkFirst({
      cacheName: 'start-url',
      plugins: [{
        cacheWillUpdate: async ({ response }) => {
          return response && response.type === 'opaqueredirect' 
            ? new Response(response.body, {
                status: 200,
                statusText: 'OK',
                headers: response.headers
              })
            : response;
        }
      }]
    })
  );
  
  // Cache Google Fonts
  workbox.routing.registerRoute(
    /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
    new workbox.strategies.CacheFirst({
      cacheName: 'google-fonts',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
        })
      ]
    })
  );
  
  // Cache local fonts
  workbox.routing.registerRoute(
    /^\/fonts\/.+\.(ttf|otf|woff|woff2)$/i,
    new workbox.strategies.CacheFirst({
      cacheName: 'local-fonts',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
        })
      ]
    })
  );
  
  // Cache images
  workbox.routing.registerRoute(
    /\.(png|jpg|jpeg|svg|gif|webp|ico)$/i,
    new workbox.strategies.CacheFirst({
      cacheName: 'images',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        })
      ]
    })
  );
  
  // Cache JSON data
  workbox.routing.registerRoute(
    /^\/data\/.+\.json$/i,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'hanzi-data',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
        })
      ]
    })
  );
  
  // Cache audio files
  workbox.routing.registerRoute(
    /^\/assets\/hanzi\/audio\/.+\.(mp3|wav|ogg)$/i,
    new workbox.strategies.CacheFirst({
      cacheName: 'audio-files',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        })
      ]
    })
  );
  
  // Cache Lottie animations
  workbox.routing.registerRoute(
    /^\/assets\/lottie\/.+\.json$/i,
    new workbox.strategies.CacheFirst({
      cacheName: 'lottie-animations',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        })
      ]
    })
  );
  
  // Cache API requests
  workbox.routing.registerRoute(
    /^\/api\/.*/i,
    new workbox.strategies.NetworkFirst({
      cacheName: 'api-cache',
      networkTimeoutSeconds: 3,
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 5 * 60 // 5 minutes
        })
      ]
    })
  );
  
} else {
  console.error('Workbox failed to load');
}

// Listen for skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker loaded and configured');