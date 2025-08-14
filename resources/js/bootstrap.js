/**
 * Configuración Axios + Sanctum + CSRF para Laravel
 */

import axios from "axios";
window.axios = axios;

// Configuración base
axios.defaults.baseURL = "https://gatekepper.com";
axios.defaults.withCredentials = true;
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
axios.defaults.headers.common["Accept"] = "application/json";

// Función para obtener el CSRF token
function getCSRFToken() {
    // Primero intentar obtener del meta tag
    let token = document.head.querySelector('meta[name="csrf-token"]')?.content;

    // Si no está en el meta tag, buscar en las cookies
    if (!token) {
        const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
        if (match) {
            token = decodeURIComponent(match[1]);
        }
    }

    return token;
}

// Configurar el CSRF token inicial
const initialToken = getCSRFToken();
if (initialToken) {
    axios.defaults.headers.common["X-CSRF-TOKEN"] = initialToken;
    axios.defaults.headers.common["X-XSRF-TOKEN"] = initialToken;
}

// Variable para evitar loops infinitos
let isRefreshingToken = false;

// Interceptor para peticiones
axios.interceptors.request.use(
    async (config) => {
        // Asegurar HTTPS en producción
        if (config.url && config.url.startsWith("http://")) {
            config.url = config.url.replace("http://", "https://");
        }

        // Para peticiones que modifican datos, asegurar CSRF
        const needsCSRF = ["post", "put", "patch", "delete"].includes(
            config.method?.toLowerCase()
        );

        if (needsCSRF && !isRefreshingToken) {
            // Obtener token actual
            const token = getCSRFToken();
            if (token) {
                config.headers["X-CSRF-TOKEN"] = token;
                config.headers["X-XSRF-TOKEN"] = token;
            } else {
                // Si no hay token, obtener uno nuevo de Sanctum
                isRefreshingToken = true;
                try {
                    await axios.get("/sanctum/csrf-cookie");
                    const newToken = getCSRFToken();
                    if (newToken) {
                        config.headers["X-CSRF-TOKEN"] = newToken;
                        config.headers["X-XSRF-TOKEN"] = newToken;
                        axios.defaults.headers.common["X-CSRF-TOKEN"] =
                            newToken;
                    }
                } catch (error) {
                    console.error("Error obteniendo CSRF cookie:", error);
                } finally {
                    isRefreshingToken = false;
                }
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para respuestas
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Si es error 419 (CSRF mismatch) y no hemos reintentado
        if (error.response?.status === 419 && !originalRequest._retry) {
            originalRequest._retry = true;
            isRefreshingToken = true;

            try {
                // Obtener nuevo CSRF token
                await axios.get("/sanctum/csrf-cookie");
                const newToken = getCSRFToken();

                if (newToken) {
                    // Actualizar headers
                    originalRequest.headers["X-CSRF-TOKEN"] = newToken;
                    originalRequest.headers["X-XSRF-TOKEN"] = newToken;
                    axios.defaults.headers.common["X-CSRF-TOKEN"] = newToken;

                    // Reintentar la petición original
                    return axios(originalRequest);
                }
            } catch (refreshError) {
                console.error(
                    "No se pudo refrescar el CSRF token:",
                    refreshError
                );
                // Recargar la página como último recurso
                window.location.reload();
            } finally {
                isRefreshingToken = false;
            }
        }

        // Log de errores en desarrollo
        if (import.meta.env.DEV || error.response?.status === 403) {
            console.error("Axios error:", {
                status: error.response?.status,
                message: error.message,
                url: error.config?.url,
                method: error.config?.method,
            });
        }

        return Promise.reject(error);
    }
);

/**
 * Laravel Echo para WebSockets con Pusher
 */

import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

// Configurar Echo
window.Echo = new Echo({
    broadcaster: "pusher",
    key: "7fa6f3ebe8d4679dd6ac",
    cluster: "us2",
    forceTLS: true,
    encrypted: true,
    authEndpoint: "/broadcasting/auth",
    auth: {
        headers: {
            "X-CSRF-TOKEN": getCSRFToken(),
            "X-Requested-With": "XMLHttpRequest",
            Accept: "application/json",
        },
    },
});

// Debug
console.log("🔧 Configuración:", {
    baseURL: axios.defaults.baseURL,
    hasCSRF: !!getCSRFToken(),
    sanctumDomain: "gatekepper.com",
    echoAuthEndpoint: "/broadcasting/auth",
});

// Eventos de conexión Echo
window.Echo.connector.pusher.connection.bind("connected", () => {
    console.log("✅ Pusher conectado exitosamente");
});

window.Echo.connector.pusher.connection.bind("error", (error) => {
    console.error("❌ Error en Pusher:", error);
});

window.Echo.connector.pusher.connection.bind("state_change", (states) => {
    console.log("📡 Estado Pusher:", states.current);
});

export default axios;
