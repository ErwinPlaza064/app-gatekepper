/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */

import axios from "axios";
window.axios = axios;

// CONFIGURACIÓN INMEDIATA Y ROBUSTA DE HTTPS
// Detectar entorno y configurar URL apropiada ANTES de cualquier request
let baseURL;

// En el navegador, usar la URL actual pero SIEMPRE forzar HTTPS
if (typeof window !== "undefined") {
    const currentURL = window.location.origin;
    baseURL = currentURL.replace("http://", "https://");

    // Si estamos en producción (gatekepper.com), forzar HTTPS siempre
    if (currentURL.includes("gatekepper.com")) {
        baseURL = "https://gatekepper.com";
    }
} else {
    // Fallback para SSR
    baseURL = "https://gatekepper.com";
}

// CONFIGURAR AXIOS INMEDIATAMENTE
axios.defaults.baseURL = baseURL;
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
axios.defaults.withCredentials = true;

// CONFIGURAR CSRF TOKEN - CRÍTICO PARA EVITAR ERROR 403
let token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    axios.defaults.headers.common["X-CSRF-TOKEN"] = token.content;
} else {
    console.error(
        "CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token"
    );
}

// INTERCEPTOR MÁS AGRESIVO PARA FORZAR HTTPS
axios.interceptors.request.use(
    (config) => {
        // Asegurar que el CSRF token esté presente en cada request
        if (!config.headers["X-CSRF-TOKEN"]) {
            const token = document.head.querySelector(
                'meta[name="csrf-token"]'
            );
            if (token) {
                config.headers["X-CSRF-TOKEN"] = token.content;
            }
        }

        // SIEMPRE forzar HTTPS en todas las URLs
        if (config.url) {
            // Si es una URL completa, forzar HTTPS
            if (config.url.startsWith("http://")) {
                config.url = config.url.replace("http://", "https://");
            }
            // Si es una URL relativa y estamos en gatekepper.com, usar baseURL HTTPS
            else if (
                !config.url.startsWith("http") &&
                config.url.startsWith("/")
            ) {
                config.url = baseURL + config.url;
            }
        }

        // Asegurar baseURL HTTPS
        if (config.baseURL && config.baseURL.startsWith("http://")) {
            config.baseURL = config.baseURL.replace("http://", "https://");
        }

        // Debug en desarrollo
        if (import.meta.env.DEV) {
            console.log("🔒 Request URL final:", config.url);
            console.log("🔒 Base URL:", config.baseURL);
            console.log(
                "🔒 CSRF Token:",
                config.headers["X-CSRF-TOKEN"] ? "Present" : "Missing"
            );
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de respuesta
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        // Manejar error 419 (CSRF token mismatch)
        if (error.response && error.response.status === 419) {
            console.error("CSRF token mismatch. Reloading page...");
            window.location.reload();
        }

        if (import.meta.env.DEV) {
            console.error("Axios error:", error);

            if (error.code === "ERR_NETWORK") {
                console.error("Network error - check if URL is using HTTPS");
                console.error("Request config:", error.config);
            }

            if (error.response && error.response.status === 403) {
                console.error(
                    "403 Forbidden - Check CSRF token and authentication"
                );
            }
        }

        return Promise.reject(error);
    }
);

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allows your team to easily build robust real-time web applications.
 */

import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

// Obtener el CSRF token para Echo
const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute("content");

// Configurar Echo con Pusher
window.Echo = new Echo({
    broadcaster: "pusher",
    key: "7fa6f3ebe8d4679dd6ac",
    cluster: "us2",
    forceTLS: true,
    encrypted: true,
    enabledTransports: ["ws", "wss"],
    authEndpoint: baseURL + "/broadcasting/auth",
    auth: {
        headers: {
            "X-CSRF-TOKEN": csrfToken,
            "X-Requested-With": "XMLHttpRequest",
        },
    },
});

// Debug para desarrollo y producción temporal
console.log("🔐 Echo Auth Configuration:", {
    authEndpoint: baseURL + "/broadcasting/auth",
    csrfToken: csrfToken ? "Present" : "Missing",
    baseURL: baseURL,
});

// Debug para desarrollo
if (import.meta.env.DEV || window.location.hostname === "gatekepper.com") {
    window.Echo.connector.pusher.connection.bind("connected", () => {
        console.log("✅ Pusher connected successfully");
    });

    window.Echo.connector.pusher.connection.bind("error", (error) => {
        console.error("❌ Pusher connection error:", error);
    });

    window.Echo.connector.pusher.connection.bind("state_change", (states) => {
        console.log("📡 Pusher state:", states.current);
    });
}
