
const CACHE_NAME = 'cashback-hub-v4';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
});

self.addEventListener('fetch', (event) => {
  // Kizárólag a statikus fájlokat cache-eljük, a Firebase-t ne!
  if (event.request.url.includes('firebase') || event.request.url.includes('gstatic')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).catch(() => caches.match('./index.html'));
    })
  );
});
