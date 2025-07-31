import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import Typography from "@/Components/UI/Typography";
import { toast } from "react-hot-toast";

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
            active: "bg-green-50 border-green-200 hover:bg-green-100",
            expired: "bg-red-50 border-red-200 hover:bg-red-100",
            exhausted: "bg-orange-50 border-orange-200 hover:bg-orange-100",
            inactive: "bg-gray-50 border-gray-200 hover:bg-gray-100",
        };
        return (
            backgrounds[status] || "bg-white border-gray-200 hover:bg-gray-50"
        );
    };

    // Función para obtener las clases de texto según el estado
    const getTextClasses = (status) => {
        const textColors = {
            active: "text-green-900",
            expired: "text-red-900",
            exhausted: "text-orange-900",
            inactive: "text-gray-900",
        };
        return textColors[status] || "text-gray-900";
    };

    // Función para obtener las clases de texto secundario según el estado
    const getSecondaryTextClasses = (status) => {
        const textColors = {
            active: "text-green-700",
            expired: "text-red-700",
            exhausted: "text-orange-700",
            inactive: "text-gray-600",
        };
        return textColors[status] || "text-gray-600";
    };

    const getStatusBadge = (status) => {
        const styles = {
            active: "bg-green-100 text-green-800",
            expired: "bg-red-100 text-red-800",
            exhausted: "bg-orange-100 text-orange-800",
            inactive: "bg-gray-100 text-gray-800",
        };

        const labels = {
            active: "Activo",
            expired: "Expirado",
            exhausted: "Agotado",
            inactive: "Inactivo",
        };

        return (
            <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}
            >
                {labels[status]}
            </span>
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
            <div className="p-5 bg-white rounded-lg shadow-md">
                <div className="animate-pulse">
                    <div className="h-4 mb-4 bg-gray-200 rounded"></div>
                    <div className="space-y-3">
                        <div className="h-16 bg-gray-200 rounded"></div>
                        <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-5 bg-white rounded-lg shadow-md">
            <Typography
                as={"h4"}
                variant={"h4"}
                color={"black"}
                className="mb-4 text-lg font-semibold"
            >
                Mis Códigos QR
            </Typography>

            {qrCodes.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                    <p>No has generado ningún código QR aún</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {qrCodes.map((qr) => (
                        <div
                            key={qr.id}
                            className={`p-4 transition-colors border rounded-lg ${getCardBackgroundClasses(
                                qr.status
                            )}`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h5
                                        className={`font-medium ${getTextClasses(
                                            qr.status
                                        )}`}
                                    >
                                        {qr.visitor_name}
                                    </h5>
                                    <p
                                        className={`text-sm ${getSecondaryTextClasses(
                                            qr.status
                                        )}`}
                                    >
                                        Doc: {qr.document_id} | Placa:{" "}
                                        {qr.vehicle_plate || "N/A"}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {getStatusBadge(qr.status)}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-3 text-sm md:grid-cols-4">
                                <div>
                                    <span
                                        className={getSecondaryTextClasses(
                                            qr.status
                                        )}
                                    >
                                        Tipo:
                                    </span>
                                    <p
                                        className={`font-medium ${getTextClasses(
                                            qr.status
                                        )}`}
                                    >
                                        {getTypeLabel(qr.qr_type)}
                                    </p>
                                </div>
                                <div>
                                    <span
                                        className={getSecondaryTextClasses(
                                            qr.status
                                        )}
                                    >
                                        Usos:
                                    </span>
                                    <p
                                        className={`font-medium ${getTextClasses(
                                            qr.status
                                        )}`}
                                    >
                                        {qr.current_uses}/{qr.max_uses}
                                    </p>
                                </div>
                                {qr.valid_until && (
                                    <div>
                                        <span
                                            className={getSecondaryTextClasses(
                                                qr.status
                                            )}
                                        >
                                            Expira:
                                        </span>
                                        <p
                                            className={`font-medium ${getTextClasses(
                                                qr.status
                                            )}`}
                                        >
                                            {new Date(
                                                qr.valid_until
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                                {qr.time_remaining && (
                                    <div>
                                        <span
                                            className={getSecondaryTextClasses(
                                                qr.status
                                            )}
                                        >
                                            Tiempo restante:
                                        </span>
                                        <p
                                            className={`font-medium ${
                                                qr.status === "active"
                                                    ? "text-blue-600"
                                                    : getTextClasses(qr.status)
                                            }`}
                                        >
                                            {qr.time_remaining.human}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div
                                className={`flex items-center justify-between pt-3 border-t ${
                                    qr.status === "expired"
                                        ? "border-red-200"
                                        : qr.status === "active"
                                        ? "border-green-200"
                                        : qr.status === "exhausted"
                                        ? "border-orange-200"
                                        : "border-gray-200"
                                }`}
                            >
                                <span
                                    className={`text-xs ${getSecondaryTextClasses(
                                        qr.status
                                    )}`}
                                >
                                    Creado:{" "}
                                    {new Date(
                                        qr.created_at
                                    ).toLocaleDateString()}
                                </span>
                                <div className="space-x-2">
                                    {qr.status === "active" ? (
                                        <button
                                            onClick={() =>
                                                handleDeactivate(qr.id)
                                            }
                                            className="px-3 py-1 text-xs font-medium text-red-600 transition-colors rounded bg-red-50 hover:bg-red-100"
                                        >
                                            Desactivar
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
                                            className="px-3 py-1 text-xs font-medium text-green-600 transition-colors rounded bg-green-50 hover:bg-green-100"
                                        >
                                            Reactivar
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
