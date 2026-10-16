// Service worker de Galaxia 1942: guarda el juego en el aparato para jugar sin conexion.
// Al cambiar cualquier archivo del juego, sube VERSION para que los aparatos descarguen la nueva.
const VERSION = 'galaxia-1942-v2';
const FILES = [
  './',
  'index.html',
  'clasico.html',
  'icon.jpg',
  'manifest.webmanifest',
  'fonts/orbitron.woff2',
  'fonts/rajdhani-500.woff2',
  'fonts/rajdhani-700.woff2',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Primero intenta la red (para recibir actualizaciones); si no hay conexion, usa lo guardado.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});
