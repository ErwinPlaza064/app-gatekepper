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
            className={`group relative px-6 py-6 text-sm transition-all duration-300 rounded-2xl border-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                isExpired || processed
                    ? "bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-800/50 dark:via-gray-800/40 dark:to-gray-800/30 border-gray-300 dark:border-gray-600"
                    : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/25 dark:to-purple-900/20 border-blue-400 dark:border-blue-600 hover:from-blue-100 hover:via-indigo-100 hover:to-purple-100 dark:hover:from-blue-900/40 dark:hover:via-indigo-900/35 dark:hover:to-purple-900/30"
            } backdrop-blur-sm`}
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div
                        className={`relative flex items-center justify-center w-14 h-14 rounded-2xl shadow-xl ${
                            isExpired || processed
                                ? "bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-700 dark:to-gray-800"
                                : "bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700"
                        } transform transition-transform group-hover:scale-110`}
                    >
                        <FaUser
                            className={`w-6 h-6 ${
                                isExpired || processed
                                    ? "text-gray-500 dark:text-gray-400"
                                    : "text-white drop-shadow-lg"
                            }`}
                        />
                        {!isExpired && !processed && (
                            <div className="absolute w-4 h-4 bg-red-500 border-2 border-white rounded-full -top-1 -right-1 animate-pulse dark:border-gray-800"></div>
                        )}
                    </div>
                    <div>
                        <h4
                            className={`font-bold text-xl ${
                                isExpired || processed
                                    ? "text-gray-600 dark:text-gray-400"
                                    : "text-gray-900 dark:text-gray-100"
                            }`}
                        >
                            🏠 Solicitud de Visita
                        </h4>
                        {!isExpired && !processed && (
                            <div className="flex items-center gap-2 px-4 py-2 mt-2 border border-orange-300 rounded-full bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 dark:border-orange-800">
                                <FaClock className="w-4 h-4 text-orange-600 dark:text-orange-400 animate-pulse" />
                                <span className="text-sm font-bold text-orange-700 dark:text-orange-300">
                                    ⏱️ Expira en: {getTimeRemaining()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {isExpired && (
                    <div className="flex items-center gap-3 px-5 py-3 border-2 border-red-300 shadow-lg bg-gradient-to-r from-red-100 via-orange-100 to-yellow-100 dark:from-red-900/30 dark:via-orange-900/30 dark:to-yellow-900/30 rounded-2xl dark:border-red-700">
                        <div className="w-3 h-3 bg-red-500 rounded-full shadow-md animate-pulse"></div>
                        <span className="text-sm font-bold text-red-800 dark:text-red-300">
                            ⏰ EXPIRADO
                        </span>
                    </div>
                )}

                {processed && (
                    <div className="flex items-center gap-3 px-5 py-3 border-2 border-green-300 shadow-lg bg-gradient-to-r from-green-100 via-emerald-100 to-teal-100 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-teal-900/30 rounded-2xl dark:border-green-700">
                        <div className="w-3 h-3 bg-green-500 rounded-full shadow-md"></div>
                        <span className="text-sm font-bold text-green-800 dark:text-green-300">
                            ✅ PROCESADO
                        </span>
                    </div>
                )}
            </div>

            <div className="p-6 mb-6 border-2 shadow-inner bg-white/80 dark:bg-gray-900/40 rounded-2xl border-gray-200/70 dark:border-gray-700/70 backdrop-blur-md">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-4 p-4 border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-blue-200/50 dark:border-blue-800/50">
                        <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                            <FaUser className="w-5 h-5 text-white drop-shadow-sm" />
                        </div>
                        <div>
                            <p className="text-xs font-medium tracking-wider text-blue-600 uppercase dark:text-blue-400">
                                👤 Visitante
                            </p>
                            <p
                                className={`font-bold text-lg ${
                                    isExpired || processed
                                        ? "text-gray-600 dark:text-gray-400"
                                        : "text-gray-900 dark:text-gray-100"
                                }`}
                            >
                                {visitor?.name}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 border bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border-indigo-200/50 dark:border-indigo-800/50">
                        <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                            <FaIdCard className="w-5 h-5 text-white drop-shadow-sm" />
                        </div>
                        <div>
                            <p className="text-xs font-medium tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                                🆔 Documento
                            </p>
                            <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                {visitor?.id_document}
                            </p>
                        </div>
                    </div>

                    {visitor?.vehicle_plate && (
                        <div className="flex items-center gap-4 p-4 border bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-green-200/50 dark:border-green-800/50">
                            <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                                <FaCar className="w-5 h-5 text-white drop-shadow-sm" />
                            </div>
                            <div>
                                <p className="text-xs font-medium tracking-wider text-green-600 uppercase dark:text-green-400">
                                    🚗 Vehículo
                                </p>
                                <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {visitor.vehicle_plate}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-4 p-4 border bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border-orange-200/50 dark:border-orange-800/50">
                        <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl">
                            <FaClock className="w-5 h-5 text-white drop-shadow-sm" />
                        </div>
                        <div>
                            <p className="text-xs font-medium tracking-wider text-orange-600 uppercase dark:text-orange-400">
                                🕐 Solicitud
                            </p>
                            <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                {formatTime(visitor?.entry_time)}
                            </p>
                        </div>
                    </div>
                </div>

                {visitor?.additional_info && (
                    <div className="col-span-1 p-5 mt-4 border-2 border-blue-300 shadow-lg sm:col-span-2 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 dark:border-blue-700">
                        <p className="mb-3 text-sm font-bold tracking-wider text-blue-700 uppercase dark:text-blue-300">
                            📝 Información adicional
                        </p>
                        <p className="text-base font-medium leading-relaxed text-blue-900 dark:text-blue-100">
                            {visitor.additional_info}
                        </p>
                    </div>
                )}
            </div>

            {!isExpired && !processed && (
                <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                        onClick={handleApprove}
                        disabled={loading}
                        className="flex items-center justify-center flex-1 gap-4 px-8 py-5 text-base font-bold text-white transition-all duration-300 transform border-2 shadow-2xl group bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 rounded-2xl hover:from-green-600 hover:via-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-green-500/50 focus:ring-offset-4 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-green-500/25 hover:scale-105 active:scale-95 border-green-400/20"
                    >
                        {loading ? (
                            <FaSpinner className="w-5 h-5 animate-spin" />
                        ) : (
                            <FaCheck className="w-5 h-5 group-hover:animate-bounce" />
                        )}
                        <span className="tracking-wider">
                            ✅ APROBAR ACCESO
                        </span>
                    </button>

                    <button
                        onClick={handleReject}
                        disabled={loading}
                        className="flex items-center justify-center flex-1 gap-4 px-8 py-5 text-base font-bold text-white transition-all duration-300 transform border-2 shadow-2xl group bg-gradient-to-r from-red-500 via-rose-600 to-pink-600 rounded-2xl hover:from-red-600 hover:via-rose-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-red-500/50 focus:ring-offset-4 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-red-500/25 hover:scale-105 active:scale-95 border-red-400/20"
                    >
                        {loading ? (
                            <FaSpinner className="w-5 h-5 animate-spin" />
                        ) : (
                            <FaTimes className="w-5 h-5 group-hover:animate-bounce" />
                        )}
                        <span className="tracking-wider">
                            ❌ RECHAZAR ACCESO
                        </span>
                    </button>
                </div>
            )}

            {isExpired && (
                <div className="flex items-center gap-5 px-6 py-5 text-sm border-l-8 border-orange-500 shadow-xl rounded-2xl bg-gradient-to-r from-orange-100 via-amber-100 to-yellow-100 dark:from-orange-900/30 dark:via-amber-900/30 dark:to-yellow-900/30 dark:border-orange-400">
                    <div className="flex items-center justify-center shadow-lg w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl">
                        <FaClock className="w-6 h-6 text-white animate-pulse drop-shadow-lg" />
                    </div>
                    <div>
                        <p className="mb-2 text-xl font-bold text-orange-900 dark:text-orange-100">
                            ⏰ Solicitud Expirada
                        </p>
                        <p className="text-base leading-relaxed text-orange-800 dark:text-orange-200">
                            El visitante fue aprobado automáticamente por
                            timeout del sistema (7 minutos).
                        </p>
                    </div>
                </div>
            )}

            <div className="pt-4 mt-6 border-t-2 border-gray-200/60 dark:border-gray-700/60">
                <div className="flex items-center justify-between">
                    <p className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                        <FaClock className="w-4 h-4" />
                        <span>
                            📅 Recibida: {formatTime(notification.created_at)}
                        </span>
                    </p>
                    {!isExpired && !processed && (
                        <div className="flex items-center gap-2 px-4 py-2 border border-blue-300 rounded-full shadow-md bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 dark:border-blue-700">
                            <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm animate-pulse"></div>
                            <span className="text-sm font-bold text-blue-800 dark:text-blue-200">
                                ⏳ PENDIENTE
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
