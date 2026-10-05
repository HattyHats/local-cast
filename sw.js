const CACHE_NAME = 'localcast-v127';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './plugins.js',
    './manifest.json',
    './hat-logo.png',
    './icon-192.png',
    './icon-512.png',
    './icon-maskable-512.png',
    './apple-touch-icon.png',
    'https://cdnjs.cloudflare.com/ajax/libs/localforage/1.10.0/localforage.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.2/peerjs.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    'https://unpkg.com/html5-qrcode',
    'https://unpkg.com/jsnes/dist/jsnes.min.js'
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
    const url = e.request.url;

    // Intercept Web Share Target POST request
    if (e.request.method === 'POST' && url.includes('/index.html')) {
        e.respondWith((async () => {
            try {
                const formData = await e.request.formData();
                const files = formData.getAll('shared_files');
                if (files && files.length > 0) {
                    const db = await new Promise((resolve, reject) => {
                        const req = indexedDB.open('LocalCastShareDB', 1);
                        req.onupgradeneeded = () => req.result.createObjectStore('shares');
                        req.onsuccess = () => resolve(req.result);
                        req.onerror = () => reject(req.error);
                    });
                    const tx = db.transaction('shares', 'readwrite');
                    tx.objectStore('shares').put(files, 'pending_files');
                    await new Promise(r => tx.oncomplete = r);
                }
            } catch (err) {
                console.error("SW Share Target Error:", err);
            }
            return Response.redirect('./index.html', 303);
        })());
        return;
    }

    if (e.request.method !== 'GET') return;

    // CRITICAL: NEVER intercept PeerJS signaling, WebSockets, or live broker endpoints
    if (url.includes('0.peerjs.com') || (url.includes('/peerjs/') && !url.endsWith('.js')) || url.startsWith('ws:') || url.startsWith('wss:')) {
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
            return caches.match(e.request, { ignoreSearch: true });
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
