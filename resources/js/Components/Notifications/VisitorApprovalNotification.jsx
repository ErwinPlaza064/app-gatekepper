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

            // Obtener CSRF token
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

                // Marcar notificación como leída
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

                // Marcar notificación como leída
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
            className={`group relative px-5 py-5 text-sm transition-all duration-300 rounded-xl border-2 shadow-sm hover:shadow-md ${
                isExpired || processed
                    ? "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 border-gray-300 dark:border-gray-600"
                    : "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/20 border-blue-300 dark:border-blue-700 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/40 dark:hover:to-indigo-900/30"
            }`}
        >
            {/* Header con título y tiempo */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div
                        className={`flex items-center justify-center w-12 h-12 rounded-2xl shadow-lg ${
                            isExpired || processed
                                ? "bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800"
                                : "bg-gradient-to-br from-blue-400 to-indigo-500 dark:from-blue-600 dark:to-indigo-700"
                        }`}
                    >
                        <FaUser
                            className={`w-5 h-5 ${
                                isExpired || processed
                                    ? "text-gray-500"
                                    : "text-white"
                            }`}
                        />
                    </div>
                    <div>
                        <h4
                            className={`font-bold text-lg ${
                                isExpired || processed
                                    ? "text-gray-600 dark:text-gray-400"
                                    : "text-gray-900 dark:text-gray-100"
                            }`}
                        >
                            🔔 Solicitud de Visita
                        </h4>
                        {!isExpired && !processed && (
                            <div className="flex items-center gap-2 mt-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                                <FaClock className="w-3 h-3 text-orange-600 dark:text-orange-400 animate-pulse" />
                                <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">
                                    ⏱️ {getTimeRemaining()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {isExpired && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-xl border border-red-200 dark:border-red-800">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-bold text-red-700 dark:text-red-400">
                            ⏰ Expirado
                        </span>
                    </div>
                )}

                {processed && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border border-green-200 dark:border-green-800">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-bold text-green-700 dark:text-green-400">
                            ✅ Procesado
                        </span>
                    </div>
                )}
            </div>

            {/* Información del visitante */}
            <div className="mb-5 p-4 bg-white/60 dark:bg-gray-900/30 rounded-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                            <FaUser className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Visitante
                            </p>
                            <p
                                className={`font-bold ${
                                    isExpired || processed
                                        ? "text-gray-600 dark:text-gray-400"
                                        : "text-gray-900 dark:text-gray-100"
                                }`}
                            >
                                {visitor?.name}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                            <FaIdCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Documento
                            </p>
                            <p className="font-medium text-gray-700 dark:text-gray-300">
                                {visitor?.id_document}
                            </p>
                        </div>
                    </div>

                    {visitor?.vehicle_plate && (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg">
                                <FaCar className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    Vehículo
                                </p>
                                <p className="font-medium text-gray-700 dark:text-gray-300">
                                    {visitor.vehicle_plate}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                            <FaClock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Solicitud
                            </p>
                            <p className="font-medium text-gray-700 dark:text-gray-300">
                                {formatTime(visitor?.entry_time)}
                            </p>
                        </div>
                    </div>
                </div>

                {visitor?.additional_info && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide font-semibold mb-1">
                            📝 Información adicional
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            {visitor.additional_info}
                        </p>
                    </div>
                )}
            </div>

            {/* Botones de acción */}
            {!isExpired && !processed && (
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleApprove}
                        disabled={loading}
                        className="flex items-center justify-center gap-3 px-6 py-4 text-sm font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-500/50 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex-1 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                    >
                        {loading ? (
                            <FaSpinner className="w-4 h-4 animate-spin" />
                        ) : (
                            <FaCheck className="w-4 h-4" />
                        )}
                        <span className="tracking-wide">✅ APROBAR ACCESO</span>
                    </button>

                    <button
                        onClick={handleReject}
                        disabled={loading}
                        className="flex items-center justify-center gap-3 px-6 py-4 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-xl hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-4 focus:ring-red-500/50 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex-1 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                    >
                        {loading ? (
                            <FaSpinner className="w-4 h-4 animate-spin" />
                        ) : (
                            <FaTimes className="w-4 h-4" />
                        )}
                        <span className="tracking-wide">
                            ❌ RECHAZAR ACCESO
                        </span>
                    </button>
                </div>
            )}

            {/* Mensaje para visitantes expirados */}
            {isExpired && (
                <div className="flex items-center gap-3 px-4 py-3 text-sm bg-gradient-to-r from-orange-100 to-amber-100 border-l-4 border-orange-500 rounded-lg dark:from-orange-900/30 dark:to-amber-900/30 dark:border-orange-400">
                    <div className="flex items-center justify-center w-8 h-8 bg-orange-500 rounded-full">
                        <FaClock className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <div>
                        <p className="font-semibold text-orange-800 dark:text-orange-200">
                            ⏰ Solicitud Expirada
                        </p>
                        <p className="text-orange-700 dark:text-orange-300">
                            El visitante fue aprobado automáticamente por
                            timeout del sistema.
                        </p>
                    </div>
                </div>
            )}

            {/* Footer con tiempo */}
            <div className="mt-4 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <FaClock className="w-3 h-3" />
                        <span>
                            Recibida: {formatTime(notification.created_at)}
                        </span>
                    </p>
                    {!isExpired && !processed && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                Pendiente
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
