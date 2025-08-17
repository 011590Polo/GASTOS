const CACHE_NAME = 'gastos-app-v1.0.0';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './material-design.css',
  './script.js',
  './gastos.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://unpkg.com/@material/web@1.0.0/material-web.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Instalación completada');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error en instalación:', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activación completada');
      return self.clients.claim();
    })
  );
});

// Interceptación de peticiones
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estrategia: Cache First para recursos estáticos
  if (request.method === 'GET' && (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.json')
  )) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            console.log('Service Worker: Sirviendo desde cache:', request.url);
            return response;
          }
          return fetch(request)
            .then((response) => {
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });
              return response;
            });
        })
    );
  }
  // Estrategia: Network First para datos dinámicos
  else if (request.method === 'GET' && url.pathname === './gastos.json') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
  }
  // Estrategia: Network First para la página principal
  else if (request.method === 'GET' && (
    url.pathname === './' ||
    url.pathname === './index.html'
  )) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
  }
});

// Manejo de mensajes del cliente
self.addEventListener('message', (event) => {
  console.log('Service Worker: Mensaje recibido:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    event.waitUntil(
      self.skipWaiting().then(() => {
        // Responder al cliente que el skipWaiting se completó
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ type: 'SKIP_WAITING_COMPLETED' });
        }
      })
    );
  }
  
  // Responder inmediatamente para evitar el error de canal cerrado
  if (event.ports && event.ports[0]) {
    event.ports[0].postMessage({ type: 'MESSAGE_RECEIVED' });
  }
});

// Manejo de notificaciones push (para futuras funcionalidades)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push recibido');
  
  let notificationData = {
    title: 'Administrador de Gastos',
    body: 'Nueva notificación de Gastos',
    icon: './icons/icon-192x192.png',
    badge: './icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    requireInteraction: true,
    tag: 'gastos-notification',
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: './'
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver Gastos',
        icon: './icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: './icons/icon-96x96.png'
      }
    ]
  };

  // Si hay datos en el push, usarlos
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = { ...notificationData, ...pushData };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notificación clickeada', event.action);
  
  event.notification.close();

  // Determinar la URL a abrir
  let urlToOpen = './';
  if (event.notification.data && event.notification.data.url) {
    urlToOpen = event.notification.data.url;
  }

  if (event.action === 'explore') {
    urlToOpen = './';
  }

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Buscar si ya hay una ventana abierta
      for (const client of clientList) {
        if (client.url.includes(window.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Si no hay ventana abierta, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
