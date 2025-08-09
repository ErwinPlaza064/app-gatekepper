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
if (typeof window !== 'undefined') {
    const currentURL = window.location.origin;
    baseURL = currentURL.replace("http://", "https://");
    
    // Si estamos en producción (gatekepper.com), forzar HTTPS siempre
    if (currentURL.includes('gatekepper.com')) {
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

// INTERCEPTOR MÁS AGRESIVO PARA FORZAR HTTPS
axios.interceptors.request.use(
    (config) => {
        // SIEMPRE forzar HTTPS en todas las URLs
        if (config.url) {
            // Si es una URL completa, forzar HTTPS
            if (config.url.startsWith("http://")) {
                config.url = config.url.replace("http://", "https://");
            }
            // Si es una URL relativa y estamos en gatekepper.com, usar baseURL HTTPS
            else if (!config.url.startsWith("http") && config.url.startsWith("/")) {
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

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// Configurar Echo con Pusher
window.Echo = new Echo({
    broadcaster: 'pusher',
    key: '7fa6f3ebe8d4679dd6ac',
    cluster: 'us3',
    forceTLS: true,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: baseURL + '/broadcasting/auth',
    auth: {
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
        },
    },
});

// Debug para desarrollo
if (import.meta.env.DEV) {
    window.Echo.connector.pusher.connection.bind('connected', () => {
        console.log('✅ Pusher connected successfully');
    });
    
    window.Echo.connector.pusher.connection.bind('error', (error) => {
        console.error('❌ Pusher connection error:', error);
    });
}
