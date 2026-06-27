const CACHE_NAME = 'localcast-v83';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/localforage/1.10.0/localforage.min.js',
    'https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Roboto+Mono:wght@400;700&display=swap'
];

self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (e) => {
    // We don't want to cache API calls or WebRTC signaling, only GET requests
    if (e.request.method !== 'GET') {
        return;
    }

    e.respondWith(
        fetch(e.request).then((response) => {
            // Network First: If we get a valid response, cache it and return it
            const resClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(e.request, resClone);
            });
            return response;
        }).catch(() => {
            // Offline fallback: use cache
            return caches.match(e.request);
        })
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        }).then(() => self.clients.claim())
    );
});
