import "./bootstrap";
import "../css/app.css";

import { createRoot } from "react-dom/client";
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { router } from "@inertiajs/react";

const appName = import.meta.env.VITE_APP_NAME || "GateKepper";

// CONFIGURAR INERTIA PARA USAR HTTPS
if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    // Interceptar todas las visitas de Inertia para forzar HTTPS
    const originalVisit = router.visit;
    router.visit = function(url, options = {}) {
        // Si la URL es relativa, no necesita cambios
        // Si es absoluta y usa HTTP, cambiar a HTTPS
        if (typeof url === 'string' && url.startsWith('http://')) {
            url = url.replace('http://', 'https://');
        }
        
        return originalVisit.call(this, url, options);
    };
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob("./Pages/**/*.jsx", { eager: false })
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: "#4B5563",
        showSpinner: true,
    },
});

// Registrar Service Worker solo en producción
if ("serviceWorker" in navigator && import.meta.env.PROD) {
    window.addEventListener("load", function () {
        navigator.serviceWorker
            .register("/service-worker.js")
            .then(function (registration) {
                console.log("ServiceWorker registrado:", registration);
            })
            .catch(function (error) {
                console.log("Error registrando ServiceWorker:", error);
            });
    });
}
