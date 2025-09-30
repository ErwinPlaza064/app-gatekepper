import axios from "axios";
window.axios = axios;

// Importar el manejador de errores CSRF
import "./csrf-error-handler.js";

// Configuración esencial de Axios
window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
window.axios.defaults.withCredentials = true;
window.axios.defaults.timeout = 10000; // Timeout de 10 segundos

// Obtener y configurar CSRF Token
const token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    window.axios.defaults.headers.common["X-CSRF-TOKEN"] = token.content;
} else {
    console.error("CSRF token not found");
    // Intentar obtener el token del servidor
    fetch("/csrf-token", {
        method: "GET",
        credentials: "same-origin",
        headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
        },
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.csrf_token) {
                window.axios.defaults.headers.common["X-CSRF-TOKEN"] =
                    data.csrf_token;
                // Actualizar el meta tag
                let metaTag = document.head.querySelector(
                    'meta[name="csrf-token"]'
                );
                if (!metaTag) {
                    metaTag = document.createElement("meta");
                    metaTag.name = "csrf-token";
                    document.head.appendChild(metaTag);
                }
                metaTag.content = data.csrf_token;
            }
        })
        .catch((error) => {
            console.error("Failed to fetch CSRF token:", error);
        });
}

// Laravel Echo (Pusher)
import Echo from "laravel-echo";
import Pusher from "pusher-js";
window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: "pusher",
    key: "7fa6f3ebe8d4679dd6ac",
    cluster: "us2",
    forceTLS: true,
    authEndpoint: "/broadcasting/auth",
    auth: {
        headers: {
            "X-CSRF-TOKEN": token ? token.content : "",
        },
    },
});
