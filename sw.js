const CACHE_NAME = 'site-cache-v1';
const PRECACHE = [
  '/',
  'index.html',
  'offline.html',
  'style.css',
  'funciones.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).then(response => {
      const responseClone = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
      return response;
    }).catch(() => {
      return caches.match(event.request).then(match => {
        if (match) return match;
        // Fallback to offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('offline.html');
        }
        return Promise.reject('no-match');
      });
    })
  );
});
