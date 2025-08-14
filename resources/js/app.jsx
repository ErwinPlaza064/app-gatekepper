// resources/js/app.jsx - Configuración para gatekepper.com
import "./bootstrap";
import "../css/app.css";

import { createRoot } from "react-dom/client";
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { router } from "@inertiajs/react";
import axios from "axios";

const appName = import.meta.env.VITE_APP_NAME || "GateKepper";

// CONFIGURACIÓN ESPECÍFICA PARA GATEKEPPER.COM EN RAILWAY
function setupCSRF() {
    const token = document.querySelector('meta[name="csrf-token"]')?.content;

    if (token) {
        // Configuración específica para Railway + dominio personalizado
        axios.defaults.headers.common["X-CSRF-TOKEN"] = token;
        axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
        axios.defaults.withCredentials = true; // CRÍTICO para Railway

        // Base URL para producción
        axios.defaults.baseURL = "https://gatekepper.com";

        // Headers adicionales para Railway
        axios.defaults.headers.common["Accept"] = "application/json";
        axios.defaults.headers.common["Content-Type"] = "application/json";

        window.axios = axios;
        window.Laravel = { csrfToken: token };

        console.log("✅ CSRF configurado para gatekepper.com en Railway");
    } else {
        console.warn("⚠️ No se encontró el token CSRF");
    }
}

// Función para refrescar CSRF token específica para Railway
window.refreshCSRFToken = function () {
    return fetch("https://gatekepper.com/csrf-token", {
        method: "GET",
        credentials: "include", // IMPORTANTE para Railway
        headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            const newToken = data.token;
            document.querySelector('meta[name="csrf-token"]').content =
                newToken;
            axios.defaults.headers.common["X-CSRF-TOKEN"] = newToken;
            window.Laravel.csrfToken = newToken;
            console.log("🔄 Token CSRF actualizado");
            return newToken;
        })
        .catch((error) => {
            console.error("❌ Error actualizando token CSRF:", error);
            // En caso de error, recargar la página
            window.location.reload();
        });
};

// Inicializar CSRF
setupCSRF();

// Interceptor para manejar errores 419 específico para Railway
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 419) {
            console.log(
                "🔄 Error 419 detectado, intentando refrescar token..."
            );

            // Intentar refrescar token una vez
            if (!window.csrfRefreshAttempted) {
                window.csrfRefreshAttempted = true;
                return window
                    .refreshCSRFToken()
                    .then(() => {
                        // Reintentar la request original
                        const originalRequest = error.config;
                        originalRequest.headers["X-CSRF-TOKEN"] =
                            window.Laravel.csrfToken;
                        return axios(originalRequest);
                    })
                    .catch(() => {
                        window.location.reload();
                    });
            } else {
                // Si ya se intentó refrescar, recargar página
                window.location.reload();
            }
        }
        return Promise.reject(error);
    }
);

// CONFIGURAR INERTIA
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

// Interceptar navegación de Inertia
router.on("before", (event) => {
    // Reset del flag de intento de refresh
    window.csrfRefreshAttempted = false;

    // Asegurar token en headers
    const currentToken = document.querySelector(
        'meta[name="csrf-token"]'
    )?.content;
    if (currentToken) {
        axios.defaults.headers.common["X-CSRF-TOKEN"] = currentToken;
    }
});

// Manejar errores específicos de Inertia para Railway
router.on("error", (event) => {
    const errors = event.detail?.errors;

    if (errors?.status === 419 || (errors && errors.message?.includes("419"))) {
        console.error("🔄 CSRF token expirado en Inertia, refrescando...");

        // Intentar refrescar token
        window.refreshCSRFToken().catch(() => {
            window.location.reload();
        });
    }
});

// Verificar estado de sesión cada 5 minutos
setInterval(() => {
    fetch("https://gatekepper.com/csrf-token", {
        method: "GET",
        credentials: "include",
        headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
        },
    }).catch(() => {
        console.warn("⚠️ Sesión posiblemente expirada");
    });
}, 5 * 60 * 1000);

// Service Worker
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
