const CACHE_NAME = "gatekeeper-v1";
const STATIC_CACHE = "gatekeeper-static-v1";

// Assets que se deben cachear inmediatamente
const STATIC_ASSETS = ["/", "/css/app.css", "/js/app.js", "/favicon.ico"];

// Instalar el service worker y cachear assets críticos
self.addEventListener("install", (event) => {
    event.waitUntil(
        Promise.all([
            caches.open(STATIC_CACHE).then((cache) => {
                return cache.addAll(STATIC_ASSETS);
            }),
        ]).then(() => {
            self.skipWaiting();
        })
    );
});

// Activar y limpiar caches antiguos
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (
                            cacheName !== CACHE_NAME &&
                            cacheName !== STATIC_CACHE
                        ) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                self.clients.claim();
            })
    );
});

// Estrategia de cache: Network First para API, Cache First para assets
self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    // Ignorar requests de extensiones del navegador
    if (
        url.protocol === "chrome-extension:" ||
        url.protocol === "moz-extension:"
    ) {
        return;
    }

    // Cache First para assets estáticos
    if (isStaticAsset(event.request.url)) {
        event.respondWith(
            caches.match(event.request).then((response) => {
                return (
                    response ||
                    fetch(event.request).then((fetchResponse) => {
                        const responseClone = fetchResponse.clone();
                        caches.open(STATIC_CACHE).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                        return fetchResponse;
                    })
                );
            })
        );
        return;
    }

    // Network First para rutas de la aplicación
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Solo cachear respuestas exitosas
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Fallback al cache si la red falla
                return caches.match(event.request);
            })
    );
});

// Manejar notificaciones push
self.addEventListener("push", function (event) {
    const data = event.data.json();
    const title = data.title || "Nueva notificación";
    const options = {
        body: data.body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        data: data.url ? { url: data.url } : {},
        actions: [
            {
                action: "view",
                title: "Ver",
                icon: "/favicon.ico",
            },
        ],
        tag: "gatekeeper-notification",
        renotify: true,
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

// Manejar clicks en notificaciones
self.addEventListener("notificationclick", function (event) {
    event.notification.close();

    if (event.action === "view" || !event.action) {
        const urlToOpen = event.notification.data?.url || "/dashboard";

        event.waitUntil(
            clients
                .matchAll({ type: "window", includeUncontrolled: true })
                .then((clientList) => {
                    // Si ya hay una ventana abierta, enfocarla
                    for (const client of clientList) {
                        if (
                            client.url.includes("gatekeeper") &&
                            "focus" in client
                        ) {
                            return client.focus();
                        }
                    }
                    // Si no, abrir nueva ventana
                    if (clients.openWindow) {
                        return clients.openWindow(urlToOpen);
                    }
                })
        );
    }
});

// Función helper para identificar assets estáticos
function isStaticAsset(url) {
    return /\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i.test(url);
}
