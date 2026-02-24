// Service Worker ideiglenesen kikapcsolva debug miatt
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});
