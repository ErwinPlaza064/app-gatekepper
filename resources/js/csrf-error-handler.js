/**
 * Utilidad para manejar errores de CSRF y autenticación en el frontend
 * Debe ser incluido en el app.js principal
 */

// Configuración global para manejar errores de CSRF
window.csrfErrorHandler = {
    // Contador de intentos de renovación
    refreshAttempts: 0,
    maxRefreshAttempts: 3,
    isRefreshing: false,

    /**
     * Maneja errores 419 (CSRF Token Mismatch)
     */
    handleCsrfError: async function () {
        if (
            this.isRefreshing ||
            this.refreshAttempts >= this.maxRefreshAttempts
        ) {
            console.warn("Maximum CSRF refresh attempts reached");
            this.redirectToLogin();
            return false;
        }

        this.isRefreshing = true;
        this.refreshAttempts++;

        try {
            console.log("Attempting to refresh CSRF token...");

            // Intentar obtener nuevo token CSRF
            const response = await fetch("/csrf-token", {
                method: "GET",
                credentials: "same-origin",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
            });

            if (response.ok) {
                const data = await response.json();

                // Actualizar el token CSRF en el meta tag
                const metaTag = document.querySelector(
                    'meta[name="csrf-token"]'
                );
                if (metaTag) {
                    metaTag.setAttribute("content", data.csrf_token);
                }

                // Actualizar configuración global de axios si existe
                if (window.axios && window.axios.defaults.headers.common) {
                    window.axios.defaults.headers.common["X-CSRF-TOKEN"] =
                        data.csrf_token;
                }

                // Actualizar configuración de jQuery si existe
                if (window.$ && $.ajaxSetup) {
                    $.ajaxSetup({
                        headers: {
                            "X-CSRF-TOKEN": data.csrf_token,
                        },
                    });
                }

                console.log("CSRF token refreshed successfully");
                this.isRefreshing = false;
                return true;
            } else {
                throw new Error("Failed to refresh CSRF token");
            }
        } catch (error) {
            console.error("Error refreshing CSRF token:", error);
            this.isRefreshing = false;

            if (this.refreshAttempts >= this.maxRefreshAttempts) {
                this.redirectToLogin();
            }
            return false;
        }
    },

    /**
     * Maneja errores 403 (Forbidden/Authentication)
     */
    handleAuthError: function () {
        console.warn("Authentication error detected");
        this.redirectToLogin();
    },

    /**
     * Redirige al login con mensaje de error
     */
    redirectToLogin: function () {
        const currentUrl = encodeURIComponent(window.location.href);
        const loginUrl = `/login?redirect=${currentUrl}&error=session_expired`;

        // Mostrar mensaje al usuario antes de redirigir
        if (
            confirm("Su sesión ha expirado. ¿Desea iniciar sesión nuevamente?")
        ) {
            window.location.href = loginUrl;
        } else {
            window.location.href = "/login";
        }
    },

    /**
     * Configura interceptores para manejar errores automáticamente
     */
    setupErrorInterceptors: function () {
        // Interceptor para fetch API
        const originalFetch = window.fetch;
        window.fetch = async function (...args) {
            try {
                const response = await originalFetch.apply(this, args);

                if (response.status === 419) {
                    console.log("CSRF error detected in fetch request");
                    const refreshed =
                        await window.csrfErrorHandler.handleCsrfError();
                    if (refreshed) {
                        // Reintentar la petición original con el nuevo token
                        const newArgs = [...args];
                        if (newArgs[1] && newArgs[1].headers) {
                            const metaTag = document.querySelector(
                                'meta[name="csrf-token"]'
                            );
                            if (metaTag) {
                                newArgs[1].headers["X-CSRF-TOKEN"] =
                                    metaTag.getAttribute("content");
                            }
                        }
                        return originalFetch.apply(this, newArgs);
                    }
                } else if (response.status === 403) {
                    window.csrfErrorHandler.handleAuthError();
                }

                return response;
            } catch (error) {
                console.error("Fetch error:", error);
                throw error;
            }
        };

        // Interceptor para axios si está disponible
        if (window.axios) {
            window.axios.interceptors.response.use(
                (response) => response,
                async (error) => {
                    if (error.response) {
                        if (error.response.status === 419) {
                            console.log("CSRF error detected in axios request");
                            const refreshed =
                                await window.csrfErrorHandler.handleCsrfError();
                            if (refreshed) {
                                // Reintentar la petición original
                                error.config.headers["X-CSRF-TOKEN"] = document
                                    .querySelector('meta[name="csrf-token"]')
                                    .getAttribute("content");
                                return window.axios.request(error.config);
                            }
                        } else if (error.response.status === 403) {
                            window.csrfErrorHandler.handleAuthError();
                        }
                    }
                    return Promise.reject(error);
                }
            );
        }

        // Interceptor para jQuery si está disponible
        if (window.$ && $.ajaxSetup) {
            $(document).ajaxError(async function (event, xhr, settings) {
                if (xhr.status === 419) {
                    console.log("CSRF error detected in jQuery request");
                    const refreshed =
                        await window.csrfErrorHandler.handleCsrfError();
                    if (refreshed) {
                        // Reintentar la petición
                        $.ajax(settings);
                    }
                } else if (xhr.status === 403) {
                    window.csrfErrorHandler.handleAuthError();
                }
            });
        }
    },

    /**
     * Inicializa el manejador de errores
     */
    init: function () {
        console.log("Initializing CSRF error handler...");
        this.setupErrorInterceptors();

        // Resetear contadores cada 5 minutos
        setInterval(() => {
            this.refreshAttempts = 0;
            this.isRefreshing = false;
        }, 5 * 60 * 1000);
    },
};

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function () {
    window.csrfErrorHandler.init();
});

// También disponible como módulo ES6
export default window.csrfErrorHandler;
