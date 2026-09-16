// Service worker TPQ Wardatul Wathon.
// Strategi: cache-first untuk "app shell" (HTML/CSS/JS/ikon) supaya aplikasi
// tetap terbuka saat offline. Data (Firestore) TIDAK di-cache di sini karena
// Firestore SDK sudah punya offline persistence sendiri lewat IndexedDB
// (lihat js/firebase-config.js -> enableIndexedDbPersistence).

const CACHE_NAME = 'tpq-shell-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './js/firebase-config.js',
  './js/state.js',
  './js/formatters.js',
  './js/auth.js',
  './js/db.js',
  './js/storage.js',
  './js/ui-shared.js',
  './js/portal-wali.js',
  './js/portal-ustadzah.js',
  './js/portal-admin.js',
  './js/main.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
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
  const url = new URL(event.request.url);

  // Jangan campur tangan permintaan ke Firebase/Firestore/Storage/Google Fonts —
  // biarkan library masing-masing (dan browser) yang menangani online/offline-nya.
  if (
    url.origin.includes('firestore.googleapis.com') ||
    url.origin.includes('firebasestorage.googleapis.com') ||
    url.origin.includes('googleapis.com') ||
    url.origin.includes('gstatic.com') ||
    url.origin.includes('fonts.googleapis.com') ||
    url.origin.includes('fonts.gstatic.com') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
