self.addEventListener("push", function (event) {
    const data = event.data.json();
    const title = data.title || "Nueva notificación";
    const options = {
        body: data.body,
        icon: "/icon-192x192.png", // Cambia por el ícono de tu app si tienes uno
        data: data.url ? { url: data.url } : {},
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
    event.notification.close();
    if (event.notification.data && event.notification.data.url) {
        clients.openWindow(event.notification.data.url);
    }
});
