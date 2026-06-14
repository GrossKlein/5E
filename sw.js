// Service Worker — SyncPilot News v1
const CACHE = 'syncpilot-news-v1';
const OFFLINE = '/5E/offline.html';
const PRECACHE = [
  "/5E/",
  "/5E/offline.html",
  "/5E/assets/css/fonts.css",
  "/5E/assets/css/modern.css",
  "/5E/de/"
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || !url.protocol.startsWith('http')) return;
  const isStatic = req.destination === 'font' || req.destination === 'style' ||
    req.destination === 'script' || req.destination === 'image' ||
    url.pathname.includes('/assets/') || url.pathname.includes('/vendor/');
  if (isStatic) {
    e.respondWith(caches.match(req).then(cached => cached ||
      fetch(req).then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(req, res.clone()));
        return res;
      })
    ));
    return;
  }
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(req, res.clone()));
        return res;
      }).catch(() => caches.match(req).then(c => c || caches.match(OFFLINE)))
    );
  }
});
