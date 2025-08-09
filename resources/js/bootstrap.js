/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */

import axios from "axios";
window.axios = axios;

// Configurar base URL con HTTPS forzado para Railway
let baseURL;

// Detectar entorno y configurar URL apropiada
if (typeof window !== 'undefined') {
    // En el navegador, usar la URL actual pero forzar HTTPS
    const currentURL = window.location.origin;
    baseURL = currentURL.replace("http://", "https://");
} else {
    // Fallback para SSR
    baseURL = import.meta.env.VITE_API_URL || "https://gatekepper.com";
}

// Asegurar que siempre use HTTPS
axios.defaults.baseURL = baseURL.replace("http://", "https://");
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
axios.defaults.withCredentials = true;

// Interceptor para forzar HTTPS en todas las peticiones
axios.interceptors.request.use(
    (config) => {
        // Forzar HTTPS en todas las URLs
        if (config.url && config.url.startsWith("http://")) {
            config.url = config.url.replace("http://", "https://");
        }

        // Si la baseURL también usa HTTP, cambiarla
        if (config.baseURL && config.baseURL.startsWith("http://")) {
            config.baseURL = config.baseURL.replace("http://", "https://");
        }

        // Debug en desarrollo
        if (import.meta.env.DEV) {
            console.log("Request URL:", config.url);
            console.log("Base URL:", config.baseURL);
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
        if (import.meta.env.DEV) {
            console.error("Axios error:", error);

            if (error.code === "ERR_NETWORK") {
                console.error("Network error - check if URL is using HTTPS");
                console.error("Request config:", error.config);
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

// Eliminado: Echo y Pusher
