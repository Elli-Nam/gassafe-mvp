/* GasSafe service worker — cache-first app shell for pitching-grade offline demo. */
const CACHE = 'gassafe-resident-v1';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  // Never cache API traffic — alerts must stay live.
  if (new URL(request.url).pathname.startsWith('/api/')) return;
  event.respondWith(
    caches.match(request).then(
      (hit) => hit || fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
        return res;
      }),
    ),
  );
});

// FCM high-priority push placeholder: the native shell posts messages here,
// the service worker renders the heads-up notification.
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'PUSH_ALERT' && data.title) {
    self.registration.showNotification(data.title, {
      body: data.body || '',
      tag: data.tag || 'gassafe-alert',
      renotify: true,
      requireInteraction: true,
    });
  }
});
