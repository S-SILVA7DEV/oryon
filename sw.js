const CACHE_NAME = 'oryon-v1';
const ASSETS = [
    './',
    './index.html',
    './assets/css/base.css',
    './assets/js/app.js',
    './assets/js/theme.js',
    // Se tiver data.js, descomente a linha abaixo
    // './assets/js/data.js',
    'https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css'
];

// 1. Instalação: Salva os ficheiros no Cache
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching all assets');
            return cache.addAll(ASSETS);
        })
    );
});

// 2. Ativação: Limpa caches antigos se houver atualização
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
});

// 3. Fetch: Intercepta pedidos e serve do Cache se estiver offline
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            // Se estiver no cache, retorna o cache. Se não, busca na rede.
            return response || fetch(e.request);
        })
    );
});