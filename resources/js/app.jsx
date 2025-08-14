import "./bootstrap";
import "../css/app.css";

import { createRoot } from "react-dom/client";
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { router } from "@inertiajs/react";
import axios from "axios";

const appName = import.meta.env.VITE_APP_NAME || "GateKepper";

// CONFIGURACIÓN CRÍTICA: Asegurar que axios tenga el CSRF token
const token = document.querySelector('meta[name="csrf-token"]')?.content;
if (token) {
    axios.defaults.headers.common["X-CSRF-TOKEN"] = token;
    // También configurar los headers que Inertia usa internamente
    axios.defaults.headers.common["X-XSRF-TOKEN"] = token;
    console.log("✅ CSRF configurado para Inertia");
}

// CONFIGURAR INERTIA PARA USAR HTTPS Y CSRF
if (typeof window !== "undefined") {
    // Forzar HTTPS en producción
    if (window.location.protocol === "https:") {
        const originalVisit = router.visit;
        router.visit = function (url, options = {}) {
            // Si la URL es absoluta y usa HTTP, cambiar a HTTPS
            if (typeof url === "string" && url.startsWith("http://")) {
                url = url.replace("http://", "https://");
            }

            // Asegurar que el CSRF token esté presente en los headers
            if (!options.headers) {
                options.headers = {};
            }

            const currentToken = document.querySelector(
                'meta[name="csrf-token"]'
            )?.content;
            if (currentToken) {
                options.headers["X-CSRF-TOKEN"] = currentToken;
            }

            return originalVisit.call(this, url, options);
        };
    }

    // Interceptar eventos de Inertia para asegurar CSRF
    router.on("before", (event) => {
        // Obtener el token más reciente antes de cada navegación
        const currentToken = document.querySelector(
            'meta[name="csrf-token"]'
        )?.content;
        if (currentToken) {
            axios.defaults.headers.common["X-CSRF-TOKEN"] = currentToken;
        }
    });

    // Manejar errores 419 (CSRF token mismatch)
    router.on("error", (event) => {
        if (event.detail.errors && event.detail.errors.status === 419) {
            console.error("🔄 CSRF token expirado, recargando...");
            window.location.reload();
        }
    });
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
