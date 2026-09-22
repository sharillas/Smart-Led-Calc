const CACHE_NAME = 'led-calc-v1.1.0';
const ASSETS = [
  './',
  './index.html',
  './logo.svg',
  './manifest.webmanifest',
  './vendor/inter.css',
  './vendor/fontawesome.min.css',
  './vendor/jspdf.umd.min.js',
  './vendor/fonts/inter-latin-400-normal.woff2',
  './vendor/fonts/inter-latin-500-normal.woff2',
  './vendor/fonts/inter-latin-600-normal.woff2',
  './vendor/fonts/inter-latin-700-normal.woff2',
  './vendor/fonts/inter-latin-800-normal.woff2',
  './vendor/fonts/inter-latin-ext-400-normal.woff2',
  './vendor/fonts/inter-latin-ext-500-normal.woff2',
  './vendor/fonts/inter-latin-ext-600-normal.woff2',
  './vendor/fonts/inter-latin-ext-700-normal.woff2',
  './vendor/fonts/inter-latin-ext-800-normal.woff2',
  './vendor/webfonts/fa-solid-900.woff2',
  './vendor/webfonts/fa-regular-400.woff2',
  './vendor/webfonts/fa-brands-400.woff2',
  './icons/icon-128.png',
  './icons/icon-192.png',
  './icons/icon-256.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok && event.request.url.startsWith(self.location.origin)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
