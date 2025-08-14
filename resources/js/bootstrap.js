/**
 * Configuración Axios + CSRF automática para Laravel
 */

import axios from "axios";
window.axios = axios;

axios.defaults.baseURL = "https://gatekepper.com";
axios.defaults.withCredentials = true;
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

// Obtener CSRF Token
function getCSRFToken() {
    let token = document.head.querySelector('meta[name="csrf-token"]')?.content;
    if (!token) {
        const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
        if (match) {
            token = decodeURIComponent(match[1]);
        }
    }
    return token;
}

// Antes de métodos que requieren CSRF, obtener cookie
axios.interceptors.request.use(async (config) => {
    const needsCSRF = ["post", "put", "patch", "delete"].includes(
        config.method?.toLowerCase()
    );
    if (needsCSRF) {
        try {
            await axios.get("/sanctum/csrf-cookie");
            const token = getCSRFToken();
            if (token) {
                config.headers["X-CSRF-TOKEN"] = token;
                console.log(
                    "🔑 CSRF Token enviado:",
                    token.substring(0, 10) + "..."
                );
            }
        } catch (e) {
            console.error("Error al obtener CSRF cookie:", e);
        }
    }
    return config;
});

// Manejar 419 (token expirado)
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 419) {
            console.warn("⚠️ CSRF token expirado. Refrescando...");
            try {
                await axios.get("/sanctum/csrf-cookie");
                const token = getCSRFToken();
                if (token) {
                    error.config.headers["X-CSRF-TOKEN"] = token;
                    return axios(error.config);
                }
            } catch (e) {
                console.error("No se pudo refrescar el CSRF token");
            }
        }
        return Promise.reject(error);
    }
);

export default axios;
