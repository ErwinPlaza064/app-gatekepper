/**
 * Configuración robusta de Axios y CSRF para Laravel + React
 */

import axios from "axios";
window.axios = axios;

// Detectar entorno y configurar baseURL
let baseURL;
if (typeof window !== "undefined") {
    const currentURL = window.location.origin;
    baseURL = currentURL.replace("http://", "https://");
    if (currentURL.includes("gatekepper.com")) {
        baseURL = "https://gatekepper.com";
    }
} else {
    baseURL = "https://gatekepper.com";
}

// Función para obtener el token CSRF
function getCSRFToken() {
    let token = document.head.querySelector('meta[name="csrf-token"]')?.content;
    if (!token) {
        const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
        if (match) {
            token = decodeURIComponent(match[1]);
        }
    }
    if (!token) {
        const hiddenInput = document.querySelector('input[name="_token"]');
        if (hiddenInput) {
            token = hiddenInput.value;
        }
    }
    return token;
}

// Configurar Axios
axios.defaults.baseURL = baseURL;
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
axios.defaults.withCredentials = true;

// Configurar CSRF inicial
const initialToken = getCSRFToken();
if (initialToken) {
    axios.defaults.headers.common["X-CSRF-TOKEN"] = initialToken;
} else {
    console.error("CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token");
}

// Interceptor para asegurar CSRF y HTTPS
axios.interceptors.request.use(
    (config) => {
        const currentToken = getCSRFToken();
        if (currentToken) {
            config.headers["X-CSRF-TOKEN"] = currentToken;
        }
        if (config.url) {
            if (config.url.startsWith("http://")) {
                config.url = config.url.replace("http://", "https://");
            } else if (!config.url.startsWith("http") && config.url.startsWith("/")) {
                config.url = baseURL + config.url;
            }
        }
        if (config.baseURL && config.baseURL.startsWith("http://")) {
            config.baseURL = config.baseURL.replace("http://", "https://");
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para manejar errores 419/403
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 419) {
            console.warn("CSRF token mismatch/expired. Refreshing token...");
            if (!originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    await axios.get(window.location.pathname, { headers: { Accept: "text/html" } });
                    const newToken = getCSRFToken();
                    if (newToken) {
                        axios.defaults.headers.common["X-CSRF-TOKEN"] = newToken;
                        originalRequest.headers["X-CSRF-TOKEN"] = newToken;
                        console.log("✅ CSRF token refreshed successfully");
                        return axios(originalRequest);
                    }
                } catch (refreshError) {
                    console.error("Failed to refresh CSRF token:", refreshError);
                }
            }
            setTimeout(() => window.location.reload(), 1000);
        }
        if (error.response && error.response.status === 403) {
            console.error("403 Forbidden - Check CSRF token and authentication");
            const token = getCSRFToken();
            if (!token) {
                console.error("No CSRF token found - this might be the issue");
                setTimeout(() => window.location.reload(), 1000);
            }
        }
        return Promise.reject(error);
    }
);

// Listener para actualizar CSRF si el DOM cambia
if (typeof window !== "undefined") {
    document.addEventListener("DOMContentLoaded", function () {
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === "childList") {
                    const newToken = getCSRFToken();
                    if (
                        newToken &&
                        newToken !== axios.defaults.headers.common["X-CSRF-TOKEN"]
                    ) {
                        axios.defaults.headers.common["X-CSRF-TOKEN"] = newToken;
                        console.log("🔄 CSRF token updated from DOM change");
                    }
                }
            });
        });
        observer.observe(document.head, { childList: true, subtree: true });
    });
}

// Exponer función para refrescar CSRF manualmente
window.refreshCSRFToken = function () {
    const newToken = getCSRFToken();
    if (newToken) {
        axios.defaults.headers.common["X-CSRF-TOKEN"] = newToken;
        console.log("✅ CSRF token manually refreshed:", newToken.substring(0, 10) + "...");
        return true;
    }
    console.error("❌ Could not find CSRF token to refresh");
    return false;
};

// Refresco automático del token CSRF cada 10 minutos
setInterval(() => {
    const refreshed = window.refreshCSRFToken();
    if (refreshed) {
        console.log("🔄 CSRF token auto-refreshed");
    }
}, 600000); // 10 minutos
