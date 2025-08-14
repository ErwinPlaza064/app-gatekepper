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

// FUNCIÓN PARA OBTENER CSRF TOKEN DE FORMA ROBUSTA
function getCSRFToken() {
    // Método 1: Meta tag
    let token = document.head.querySelector('meta[name="csrf-token"]')?.content;

    // Método 2: Cookie XSRF-TOKEN
    if (!token) {
        const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
        if (match) {
            token = decodeURIComponent(match[1]);
        }
    }

    // Método 3: Input hidden (para formularios)
    if (!token) {
        const hiddenInput = document.querySelector('input[name="_token"]');
        if (hiddenInput) {
            token = hiddenInput.value;
        }
    }

    return token;
}

// CONFIGURAR AXIOS INMEDIATAMENTE
axios.defaults.baseURL = baseURL;
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
axios.defaults.withCredentials = true;

// CONFIGURAR CSRF TOKEN INICIAL
const initialToken = getCSRFToken();
if (initialToken) {
    axios.defaults.headers.common["X-CSRF-TOKEN"] = initialToken;
} else {
    console.error(
        "CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token"
    );
}

// INTERCEPTOR MEJORADO PARA ASEGURAR CSRF TOKEN
axios.interceptors.request.use(
    (config) => {
        // SIEMPRE obtener el token más reciente antes de cada request
        const currentToken = getCSRFToken();
        if (currentToken) {
            config.headers["X-CSRF-TOKEN"] = currentToken;
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

// INTERCEPTOR MEJORADO PARA MANEJAR ERRORES
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Manejar error 419 (CSRF token mismatch/expired)
        if (error.response && error.response.status === 419) {
            console.warn("CSRF token mismatch/expired. Refreshing token...");

            // Si no hemos intentado renovar el token ya
            if (!originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    // Intentar obtener un nuevo token haciendo una petición GET a la página actual
                    await axios.get(window.location.pathname, {
                        headers: {
                            Accept: "text/html",
                        },
                    });

                    // Obtener el nuevo token
                    const newToken = getCSRFToken();
                    if (newToken) {
                        // Actualizar el token por defecto
                        axios.defaults.headers.common["X-CSRF-TOKEN"] =
                            newToken;
                        // Actualizar el token en el request original
                        originalRequest.headers["X-CSRF-TOKEN"] = newToken;

                        console.log("✅ CSRF token refreshed successfully");

                        // Reintentar el request original
                        return axios(originalRequest);
                    }
                } catch (refreshError) {
                    console.error(
                        "Failed to refresh CSRF token:",
                        refreshError
                    );
                }
            }

            // Si falla la renovación automática, recargar la página como último recurso
            console.warn("Reloading page to get fresh CSRF token...");
            setTimeout(() => window.location.reload(), 1000);
        }

        // Manejar error 403 (Forbidden)
        if (error.response && error.response.status === 403) {
            console.error(
                "403 Forbidden - Check CSRF token and authentication"
            );

            // Verificar si tenemos token
            const token = getCSRFToken();
            if (!token) {
                console.error("No CSRF token found - this might be the issue");
                // Intentar recargar para obtener token
                setTimeout(() => window.location.reload(), 1000);
            }
        }

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

import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

// Obtener el CSRF token para Echo usando la función mejorada
const csrfToken = getCSRFToken();

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

// Función para renovar la conexión de Echo si el token cambia
window.refreshEchoAuth = function () {
    const newToken = getCSRFToken();
    if (newToken && window.Echo) {
        window.Echo.options.auth.headers["X-CSRF-TOKEN"] = newToken;
        console.log("✅ Echo auth token updated");
    }
};

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

// LISTENERS ADICIONALES PARA ASEGURAR CSRF TOKEN ACTUALIZADO
document.addEventListener("DOMContentLoaded", function () {
    // Actualizar token si se carga contenido dinámicamente
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === "childList") {
                const newToken = getCSRFToken();
                if (
                    newToken &&
                    newToken !== axios.defaults.headers.common["X-CSRF-TOKEN"]
                ) {
                    axios.defaults.headers.common["X-CSRF-TOKEN"] = newToken;
                    window.refreshEchoAuth && window.refreshEchoAuth();
                    console.log("🔄 CSRF token updated from DOM change");
                }
            }
        });
    });

    observer.observe(document.head, {
        childList: true,
        subtree: true,
    });
});

// Exponer función para refrescar token manualmente (útil para debugging)
window.refreshCSRFToken = function () {
    const newToken = getCSRFToken();
    if (newToken) {
        axios.defaults.headers.common["X-CSRF-TOKEN"] = newToken;
        window.refreshEchoAuth && window.refreshEchoAuth();
        console.log(
            "✅ CSRF token manually refreshed:",
            newToken.substring(0, 10) + "..."
        );
        return true;
    }
    console.error("❌ Could not find CSRF token to refresh");
    return false;
};
