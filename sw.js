const CACHE_NAME = 'flashlight-v1.0.1'; // Изменил версию для обновления кэша
const urlsToCache = [
    './',
    './index.html',
    './styles/global.css',
    './styles/themes/grid-theme.css',
    './styles/themes/warhammer-theme.css',
    './components/flashlight-core.js',
    './components/theme-manager.js',
    './components/themes/grid-theme.js',
    './components/themes/warhammer-theme.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
        )
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});