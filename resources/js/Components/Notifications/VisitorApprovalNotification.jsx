import React, { useState } from "react";
import axios from "axios";
import {
    FaUser,
    FaCar,
    FaIdCard,
    FaClock,
    FaCheck,
    FaTimes,
    FaSpinner,
} from "react-icons/fa";

export default function VisitorApprovalNotification({
    notification,
    onUpdate,
    showToast,
}) {
    const [loading, setLoading] = useState(false);
    const [processed, setProcessed] = useState(false);

    const visitor = notification.data?.visitor;
    const expiresAt = notification.data?.expires_at;
    const isExpired = expiresAt && new Date(expiresAt) < new Date();

    const handleApprove = async () => {
        if (loading || processed) return;

        setLoading(true);
        try {
            let API_URL = window.location.origin;

            if (
                !API_URL ||
                API_URL.includes("localhost") ||
                API_URL.includes("192.168")
            ) {
                API_URL =
                    import.meta.env.VITE_API_URL || "https://gatekepper.com";
            }

            if (
                API_URL.startsWith("http://") &&
                !API_URL.includes("localhost")
            ) {
                API_URL = API_URL.replace("http://", "https://");
            }

            const csrfResponse = await axios.get(`${API_URL}/csrf-token`);
            const csrfToken = csrfResponse.data.token;

            const response = await axios.post(
                `${API_URL}/api/approval/approve`,
                {
                    visitor_id: visitor.id,
                    notes: "Aprobado desde la aplicación web",
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                    withCredentials: true,
                }
            );

            if (response.data.success) {
                setProcessed(true);
                showToast(
                    `✅ Visitante ${visitor.name} aprobado correctamente`,
                    "success"
                );

                if (onUpdate) {
                    onUpdate(notification.id, {
                        processed: true,
                        action: "approved",
                    });
                }
            } else {
                showToast(
                    response.data.message || "Error al aprobar visitante",
                    "error"
                );
            }
        } catch (error) {
            console.error("Error approving visitor:", error);
            const message =
                error.response?.data?.message ||
                "Error al aprobar el visitante";
            showToast(message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (loading || processed) return;

        setLoading(true);
        try {
            let API_URL = window.location.origin;

            if (
                !API_URL ||
                API_URL.includes("localhost") ||
                API_URL.includes("192.168")
            ) {
                API_URL =
                    import.meta.env.VITE_API_URL || "https://gatekepper.com";
            }

            if (
                API_URL.startsWith("http://") &&
                !API_URL.includes("localhost")
            ) {
                API_URL = API_URL.replace("http://", "https://");
            }

            // Obtener CSRF token
            const csrfResponse = await axios.get(`${API_URL}/csrf-token`);
            const csrfToken = csrfResponse.data.token;

            const response = await axios.post(
                `${API_URL}/api/approval/reject`,
                {
                    visitor_id: visitor.id,
                    reason: "Rechazado desde la aplicación web",
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                    withCredentials: true,
                }
            );

            if (response.data.success) {
                setProcessed(true);
                showToast(`❌ Visitante ${visitor.name} rechazado`, "error");

                if (onUpdate) {
                    onUpdate(notification.id, {
                        processed: true,
                        action: "rejected",
                    });
                }
            } else {
                showToast(
                    response.data.message || "Error al rechazar visitante",
                    "error"
                );
            }
        } catch (error) {
            console.error("Error rejecting visitor:", error);
            const message =
                error.response?.data?.message ||
                "Error al rechazar el visitante";
            showToast(message, "error");
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getTimeRemaining = () => {
        if (!expiresAt) return null;
        const now = new Date();
        const expires = new Date(expiresAt);
        const diff = expires - now;

        if (diff <= 0) return "Expirado";

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        return `${minutes}m ${seconds}s`;
    };

    return (
        <div
            className={`relative p-4 mb-4 transition-all duration-200 border rounded-lg shadow-sm ${
                isExpired || processed
                    ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    : "bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 hover:shadow-md"
            }`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div
                        className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                            isExpired || processed
                                ? "bg-gray-200 dark:bg-gray-700"
                                : "bg-blue-500 dark:bg-blue-600"
                        }`}
                    >
                        <FaUser
                            className={`w-5 h-5 ${
                                isExpired || processed
                                    ? "text-gray-500 dark:text-gray-400"
                                    : "text-white"
                            }`}
                        />
                    </div>
                    <div>
                        <h3
                            className={`font-semibold text-lg ${
                                isExpired || processed
                                    ? "text-gray-600 dark:text-gray-400"
                                    : "text-gray-900 dark:text-gray-100"
                            }`}
                        >
                            Nueva solicitud de visita
                        </h3>
                        {!isExpired && !processed && (
                            <div className="flex items-center gap-2 mt-1">
                                <FaClock className="w-3 h-3 text-orange-500" />
                                <span className="text-sm text-orange-600 dark:text-orange-400">
                                    Expira en {getTimeRemaining()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {isExpired && (
                    <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full dark:bg-red-900/30 dark:text-red-300">
                        Expirado
                    </span>
                )}

                {processed && (
                    <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full dark:bg-green-900/30 dark:text-green-300">
                        Procesado
                    </span>
                )}
            </div>

            <div className="p-4 mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FaUser className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Visitante:
                            </span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {visitor?.name}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FaIdCard className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Documento:
                            </span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {visitor?.id_document}
                        </span>
                    </div>

                    {visitor?.vehicle_plate && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FaCar className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Vehículo:
                                </span>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {visitor.vehicle_plate}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FaClock className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Solicitud:
                            </span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {formatTime(visitor?.entry_time)}
                        </span>
                    </div>
                </div>

                {visitor?.additional_info && (
                    <div className="p-3 mt-3 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                        <p className="mb-1 text-sm font-medium text-blue-700 dark:text-blue-300">
                            Información adicional:
                        </p>
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                            {visitor.additional_info}
                        </p>
                    </div>
                )}
            </div>

            {!isExpired && !processed && (
                <div className="flex gap-3">
                    <button
                        onClick={handleApprove}
                        disabled={loading}
                        className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <FaSpinner className="w-4 h-4 animate-spin" />
                        ) : (
                            <FaCheck className="w-4 h-4" />
                        )}
                        <span>Aprobar</span>
                    </button>

                    <button
                        onClick={handleReject}
                        disabled={loading}
                        className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <FaSpinner className="w-4 h-4 animate-spin" />
                        ) : (
                            <FaTimes className="w-4 h-4" />
                        )}
                        <span>Rechazar</span>
                    </button>
                </div>
            )}

            {isExpired && (
                <div className="p-3 border border-orange-200 rounded-lg bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
                    <div className="flex items-center gap-2">
                        <FaClock className="w-4 h-4 text-orange-500" />
                        <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                            Solicitud Expirada
                        </p>
                    </div>
                    <p className="mt-1 text-sm text-orange-600 dark:text-orange-400">
                        Esta solicitud expiró automáticamente después de 7
                        minutos.
                    </p>
                </div>
            )}

            <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Recibida: {formatTime(notification.created_at)}</span>
                    {!isExpired && !processed && (
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span>Pendiente</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
