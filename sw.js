const CACHE_NAME = 'localcast-v96';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/localforage/1.10.0/localforage.min.js',
    'https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
];

self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS).catch(err => console.warn('SW pre-cache error:', err));
        })
    );
});

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;

    const url = e.request.url;

    // CRITICAL: NEVER intercept PeerJS signaling, WebSockets, or live broker endpoints
    if (url.includes('peerjs') || url.includes('0.peerjs.com') || url.startsWith('ws:') || url.startsWith('wss:')) {
        return;
    }

    // Only intercept same-origin static requests or explicit CDN scripts
    const isSameOrigin = url.startsWith(self.location.origin);
    const isCdn = url.includes('cdnjs.cloudflare.com') || url.includes('unpkg.com');

    if (!isSameOrigin && !isCdn) {
        return;
    }

    e.respondWith(
        fetch(e.request).then((response) => {
            if (!response || response.status !== 200 || (response.type !== 'basic' && response.type !== 'cors')) {
                return response;
            }
            const resClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(e.request, resClone);
            });
            return response;
        }).catch(() => {
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
