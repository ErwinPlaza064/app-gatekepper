import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import Typography from "@/Components/UI/Typography";
import { toast } from "react-hot-toast";
import {
    FaQrcode,
    FaUser,
    FaIdCard,
    FaCar,
    FaClock,
    FaCheck,
    FaTimes,
    FaRedo,
    FaBullseye,
    FaRedoAlt,
    FaCalendarAlt,
} from "react-icons/fa";

export default function QRDashboard({ userId }) {
    const [qrCodes, setQrCodes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQrCodes();
    }, []);

    const fetchQrCodes = async () => {
        try {
            // Usar URL con fallback y forzar HTTPS
            let API_URL =
                import.meta.env.VITE_API_URL ||
                "https://app-gatekepper-production.up.railway.app";

            // Forzar HTTPS si la URL usa HTTP
            if (API_URL.startsWith("http://")) {
                API_URL = API_URL.replace("http://", "https://");
            }

            const response = await fetch(`${API_URL}/api/user/qr-codes`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "same-origin",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setQrCodes(data);
        } catch (error) {
            console.error("Error fetching QR codes:", error);
            toast.error("Error al cargar los códigos QR");
        } finally {
            setLoading(false);
        }
    };

    // Función para obtener el token CSRF de forma más robusta
    const getCsrfToken = async () => {
        // Intentar obtener el token de diferentes fuentes
        let metaToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content");

        // Si no hay token, esperar un poco e intentar de nuevo
        if (!metaToken) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            metaToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");
        }

        // Si aún no hay token, intentar obtenerlo del endpoint
        if (!metaToken) {
            try {
                let API_URL =
                    import.meta.env.VITE_API_URL ||
                    "https://app-gatekepper-production.up.railway.app";

                // Forzar HTTPS si la URL usa HTTP
                if (API_URL.startsWith("http://")) {
                    API_URL = API_URL.replace("http://", "https://");
                }

                const response = await fetch(`${API_URL}/csrf-token`);
                if (response.ok) {
                    const data = await response.json();
                    return data.token;
                }
            } catch (e) {
                console.warn("No se pudo obtener token del endpoint");
            }
        }

        const inputToken = document.querySelector(
            'input[name="_token"]'
        )?.value;
        const windowToken = window.Laravel?.csrfToken;

        const token = metaToken || inputToken || windowToken || "";

        if (!token) {
            console.warn("No se pudo obtener el token CSRF");
        }

        return token;
    };

    const handleDeactivate = async (qrId) => {
        try {
            let API_URL =
                import.meta.env.VITE_API_URL ||
                "https://app-gatekepper-production.up.railway.app";

            // Forzar HTTPS si la URL usa HTTP
            if (API_URL.startsWith("http://")) {
                API_URL = API_URL.replace("http://", "https://");
            }

            console.log("Deactivating QR with URL:", API_URL); // Debug

            const response = await fetch(
                `${API_URL}/api/qr-codes/${qrId}/deactivate`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                    credentials: "same-origin",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error al desactivar QR");
            }

            const data = await response.json();
            toast.success(data.message || "QR desactivado correctamente");

            // Actualizar el estado local inmediatamente para mejor UX
            setQrCodes((prevCodes) =>
                prevCodes.map((qr) =>
                    qr.id === qrId
                        ? { ...qr, status: "inactive", is_active: false }
                        : qr
                )
            );

            // Refrescar los datos del servidor para asegurar sincronización
            await fetchQrCodes();
        } catch (error) {
            console.error("Error deactivating QR:", error);
            toast.error(error.message || "Error al desactivar QR");
        }
    };

    const handleReactivate = async (qrId) => {
        try {
            let API_URL =
                import.meta.env.VITE_API_URL ||
                "https://app-gatekepper-production.up.railway.app";

            // Forzar HTTPS si la URL usa HTTP
            if (API_URL.startsWith("http://")) {
                API_URL = API_URL.replace("http://", "https://");
            }

            console.log("Reactivating QR with URL:", API_URL); // Debug

            const response = await fetch(
                `${API_URL}/api/qr-codes/${qrId}/reactivate`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                    credentials: "same-origin",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error al reactivar QR");
            }

            const data = await response.json();
            toast.success(data.message || "QR reactivado correctamente");

            // Actualizar el estado local inmediatamente para mejor UX
            setQrCodes((prevCodes) =>
                prevCodes.map((qr) =>
                    qr.id === qrId
                        ? { ...qr, status: "active", is_active: true }
                        : qr
                )
            );

            // Refrescar los datos del servidor para asegurar sincronización
            await fetchQrCodes();
        } catch (error) {
            console.error("Error reactivating QR:", error);
            toast.error(error.message || "Error al reactivar QR");
        }
    };

    // Función para obtener las clases de fondo según el estado
    const getCardBackgroundClasses = (status) => {
        const backgrounds = {
            active: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30",
            expired:
                "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30",
            exhausted:
                "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/30",
            inactive:
                "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/70",
        };
        return (
            backgrounds[status] ||
            "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/80"
        );
    };

    // Función para obtener las clases de texto según el estado
    const getTextClasses = (status) => {
        const textColors = {
            active: "text-green-900 dark:text-green-100",
            expired: "text-red-900 dark:text-red-100",
            exhausted: "text-orange-900 dark:text-orange-100",
            inactive: "text-gray-900 dark:text-gray-100",
        };
        return textColors[status] || "text-gray-900 dark:text-gray-100";
    };

    // Función para obtener las clases de texto secundario según el estado
    const getSecondaryTextClasses = (status) => {
        const textColors = {
            active: "text-green-700 dark:text-green-300",
            expired: "text-red-700 dark:text-red-300",
            exhausted: "text-orange-700 dark:text-orange-300",
            inactive: "text-gray-600 dark:text-gray-400",
        };
        return textColors[status] || "text-gray-600 dark:text-gray-400";
    };

    const getStatusBadge = (status) => {
        const styles = {
            active: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700",
            expired:
                "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700",
            exhausted:
                "bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-700",
            inactive:
                "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700",
        };

        const labels = {
            active: "Activo",
            expired: "Expirado",
            exhausted: "Agotado",
            inactive: "Inactivo",
        };

        const icons = {
            active: <FaCheck className="w-3 h-3" />,
            expired: null,
            exhausted: <FaClock className="w-3 h-3" />,
            inactive: null,
        };

        return (
            <span
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg ${styles[status]}`}
            >
                {icons[status] && icons[status]}
                {labels[status]}
            </span>
        );
    };

    const getTypeIcon = (type) => {
        const icons = {
            single_use: (
                <FaBullseye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            ),
            time_limited: (
                <FaClock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            ),
            recurring: (
                <FaRedoAlt className="w-4 h-4 text-green-600 dark:text-green-400" />
            ),
        };

        return (
            <div className="flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                {icons[type] || (
                    <FaQrcode className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
            </div>
        );
    };

    const getTypeLabel = (type) => {
        const labels = {
            single_use: "Uso único",
            time_limited: "Tiempo limitado",
            recurring: "Recurrente",
        };
        return labels[type] || type;
    };

    if (loading) {
        return (
            <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-xl dark:bg-gray-900 dark:border-gray-700">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-black rounded-full">
                            <FaQrcode className="w-6 h-6 text-white animate-pulse" />
                        </div>
                        <div>
                            <Typography
                                as="h4"
                                variant="h4"
                                className="text-xl font-semibold text-gray-900 dark:text-white"
                            >
                                Mis Códigos QR
                            </Typography>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Cargando tus códigos QR...
                            </p>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
                    <div className="space-y-4 animate-pulse">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-24 bg-gray-200 rounded-lg dark:bg-gray-700"
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-xl dark:bg-gray-900 dark:border-gray-700">
            {/* Header con estilo Material Design */}
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-black rounded-full">
                        <FaQrcode className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <Typography
                            as="h4"
                            variant="h4"
                            className="text-xl font-semibold text-gray-900 dark:text-white"
                        >
                            Mis Códigos QR
                        </Typography>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Gestiona todos tus códigos QR
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
                {qrCodes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                            <FaQrcode className="w-8 h-8 text-gray-400" />
                        </div>
                        <Typography
                            as="p"
                            variant="p"
                            className="mb-2 text-lg font-medium text-gray-600 dark:text-gray-400"
                        >
                            Sin códigos QR
                        </Typography>
                        <Typography
                            as="p"
                            variant="p"
                            className="text-sm text-gray-500 dark:text-gray-500"
                        >
                            Genera tu primer código QR para visitantes
                        </Typography>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {qrCodes.map((qr) => (
                            <div
                                key={qr.id}
                                className={`p-6 rounded-lg border transition-all duration-200 hover:shadow-md ${getCardBackgroundClasses(
                                    qr.status
                                )}`}
                            >
                                {/* Header de la card */}
                                <div className="flex flex-col justify-between gap-3 mb-4 sm:flex-row sm:items-start sm:gap-0">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800">
                                            <span className="text-lg font-bold text-white">
                                                {qr.visitor_name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h5
                                                className={`text-lg font-bold truncate ${getTextClasses(
                                                    qr.status
                                                )}`}
                                            >
                                                {qr.visitor_name}
                                            </h5>
                                            <div className="flex flex-col gap-1 mt-1 sm:flex-row sm:items-center sm:gap-4">
                                                <span
                                                    className={`text-sm flex items-center gap-1 ${getSecondaryTextClasses(
                                                        qr.status
                                                    )}`}
                                                >
                                                    <FaIdCard className="w-3 h-3" />
                                                    {qr.document_id}
                                                </span>
                                                <span
                                                    className={`text-sm flex items-center gap-1 ${getSecondaryTextClasses(
                                                        qr.status
                                                    )}`}
                                                >
                                                    <FaCar className="w-3 h-3" />
                                                    {qr.vehicle_plate ||
                                                        "Sin vehículo"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between space-x-2 sm:justify-end sm:space-x-3">
                                        {getStatusBadge(qr.status)}
                                        {getTypeIcon(qr.qr_type)}
                                    </div>
                                </div>

                                {/* Grid de información */}
                                <div className="grid grid-cols-2 gap-3 mb-4 lg:grid-cols-4 sm:gap-4">
                                    <div className="p-3 text-center bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                                        <span
                                            className={`text-xs font-medium ${getSecondaryTextClasses(
                                                qr.status
                                            )}`}
                                        >
                                            Tipo
                                        </span>
                                        <p
                                            className={`font-bold text-sm mt-1 ${getTextClasses(
                                                qr.status
                                            )}`}
                                        >
                                            {getTypeLabel(qr.qr_type)}
                                        </p>
                                    </div>
                                    <div className="p-3 text-center bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                                        <span
                                            className={`text-xs font-medium ${getSecondaryTextClasses(
                                                qr.status
                                            )}`}
                                        >
                                            Usos
                                        </span>
                                        <p
                                            className={`font-bold text-sm mt-1 ${getTextClasses(
                                                qr.status
                                            )}`}
                                        >
                                            {qr.current_uses}/{qr.max_uses}
                                        </p>
                                    </div>
                                    {qr.valid_until && (
                                        <div className="p-3 text-center bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                                            <span
                                                className={`text-xs font-medium ${getSecondaryTextClasses(
                                                    qr.status
                                                )}`}
                                            >
                                                Expira
                                            </span>
                                            <p
                                                className={`font-bold text-xs mt-1 ${getTextClasses(
                                                    qr.status
                                                )}`}
                                            >
                                                {new Date(
                                                    qr.valid_until
                                                ).toLocaleDateString("es-ES", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "2-digit",
                                                })}
                                            </p>
                                        </div>
                                    )}
                                    {qr.time_remaining && (
                                        <div className="p-3 text-center bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                                            <span
                                                className={`text-xs font-medium ${getSecondaryTextClasses(
                                                    qr.status
                                                )}`}
                                            >
                                                Restante
                                            </span>
                                            <p
                                                className={`font-bold text-xs mt-1 ${
                                                    qr.status === "active"
                                                        ? "text-blue-600 dark:text-blue-400"
                                                        : getTextClasses(
                                                              qr.status
                                                          )
                                                }`}
                                            >
                                                {qr.time_remaining.human}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer con acciones */}
                                <div
                                    className={`flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t gap-3 sm:gap-0 ${
                                        qr.status === "expired"
                                            ? "border-red-200 dark:border-red-700"
                                            : qr.status === "active"
                                            ? "border-green-200 dark:border-green-700"
                                            : qr.status === "exhausted"
                                            ? "border-orange-200 dark:border-orange-700"
                                            : "border-gray-200 dark:border-gray-700"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <FaCalendarAlt
                                            className={`w-3 h-3 ${getSecondaryTextClasses(
                                                qr.status
                                            )}`}
                                        />
                                        <span
                                            className={`text-xs ${getSecondaryTextClasses(
                                                qr.status
                                            )}`}
                                        >
                                            Creado:{" "}
                                            {new Date(
                                                qr.created_at
                                            ).toLocaleDateString("es-ES", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-end space-x-2">
                                        {qr.status === "active" ? (
                                            <button
                                                onClick={() =>
                                                    handleDeactivate(qr.id)
                                                }
                                                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-700 transition-all duration-200 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/50 hover:bg-red-200 dark:hover:bg-red-900/50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                            >
                                                <FaTimes className="w-3 h-3" />
                                                <span className="hidden sm:inline">
                                                    Desactivar
                                                </span>
                                                <span className="sm:hidden">
                                                    Desact.
                                                </span>
                                            </button>
                                        ) : qr.status === "inactive" &&
                                          qr.current_uses < qr.max_uses &&
                                          (!qr.valid_until ||
                                              new Date() <
                                                  new Date(qr.valid_until)) ? (
                                            <button
                                                onClick={() =>
                                                    handleReactivate(qr.id)
                                                }
                                                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-green-700 transition-all duration-200 bg-green-100 border border-green-200 rounded-lg dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/50 hover:bg-green-200 dark:hover:bg-green-900/50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                            >
                                                <FaRedo className="w-3 h-3" />
                                                <span className="hidden sm:inline">
                                                    Reactivar
                                                </span>
                                                <span className="sm:hidden">
                                                    React.
                                                </span>
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
