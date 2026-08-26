// service-worker.js
// Cachea el shell de la app y la vista "Mis reservas" para que funcionen sin
// conexion, tal como pide el enunciado (PWA con lo basico offline).
// Optimizado para iOS con mejor manejo de cache y estrategias de actualización.
const CACHE_NAME = 'coworkhub-shell-v5';
const SHELL_ASSETS = [
  '/index.html',
  '/login.html',
  '/select-plan.html',
  '/my-plan.html',
  '/my-reservations.html',
  '/admin.html',
  '/css/styles.css',
  '/js/api.js',
  '/js/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  console.log('[SW] Instalando service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cacheando assets del shell...');
      // Cachear cada archivo individualmente para que si uno falla, los otros se cacheen
      return Promise.all(
        SHELL_ASSETS.map(url => 
          cache.add(url).catch(err => {
            console.warn('[SW] No se pudo cachear:', url, err);
            // No fallar la instalación si un archivo no existe
          })
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activando service worker...');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => {
            console.log('[SW] Eliminando cache viejo:', k);
            return caches.delete(k);
          })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Las llamadas a la API nunca se sirven desde cache: son datos vivos.
  if (request.url.includes('/auth/') || request.url.includes('/me') || request.url.includes('/plans') || request.url.includes('/spaces') || request.url.includes('/members') || request.url.includes('/reservations') || request.url.includes('/reports') || request.url.includes('/test')) {
    console.log('[SW] Pasando solicitud de API:', request.url);
    event.respondWith(fetch(request));
    return;
  }

  // Estrategia: Network First para todo para evitar cache de datos
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Solo cacheamos assets estáticos (HTML, CSS, JS, imágenes)
        if (request.url.includes('.html') || request.url.includes('.css') || request.url.includes('.js') || request.url.includes('.png') || request.url.includes('.jpg') || request.url.includes('.webp') || request.url.includes('/icons/') || request.url.includes('/img/')) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Cacheando asset estático:', request.url);
            cache.put(request, copy);
          });
        }
        return response;
      })
      .catch(() => {
        console.log('[SW] Error de red, intentando fallback:', request.url);
        // Fallback para HTML: servir index.html
        if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
          return caches.match('/index.html');
        }
        // Fallback para assets estáticos
        return caches.match(request);
      })
  );
});
