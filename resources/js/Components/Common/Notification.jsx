import React, { useRef } from "react";
import axios from "axios";
import { FaBell, FaCheck, FaInfoCircle } from "react-icons/fa";

export default function Notification({ notifications, setNotifications }) {
    const [showNotifications, setShowNotifications] = React.useState(false);
    const [toast, setToast] = React.useState(null);
    const dropdownRef = useRef(null);

    React.useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowNotifications(false);
            }
        }
        if (showNotifications) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showNotifications]);

    // Función para mostrar toast
    const showToast = (message, type = "info") => {
        setToast({ message, type });
        setTimeout(() => {
            setToast(null);
        }, 3000);
    };

    const markAllAsRead = async () => {
        // Verificar si hay notificaciones no leídas
        const unreadNotifications = notifications.filter((n) => !n.read_at);

        if (unreadNotifications.length === 0) {
            showToast("No hay notificaciones pendientes por leer", "info");
            return;
        }

        try {
            let API_URL =
                import.meta.env.VITE_API_URL ||
                "https://app-gatekepper-production.up.railway.app";

            if (API_URL.startsWith("http://")) {
                API_URL = API_URL.replace("http://", "https://");
            }

            await axios.post(
                `${API_URL}/notifications/mark-all-read`,
                {},
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                    withCredentials: true,
                }
            );

            setNotifications((prev) =>
                prev.map((n) => ({
                    ...n,
                    read_at: n.read_at || new Date().toISOString(),
                }))
            );

            // Mostrar toast de éxito
            const count = unreadNotifications.length;
            showToast(
                `${count} notificación${count > 1 ? "es" : ""} marcada${
                    count > 1 ? "s" : ""
                } como leída${count > 1 ? "s" : ""}`,
                "success"
            );
        } catch (error) {
            console.error("Error marking notifications as read:", error);
            showToast(
                "Error al marcar las notificaciones como leídas",
                "error"
            );
        }
    };

    const unreadCount = notifications.filter((n) => !n.read_at).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                className="group relative p-3 transition-all duration-500 bg-gradient-to-br from-black/80 via-gray-900/80 to-black/80 rounded-2xl shadow-xl backdrop-blur-sm border border-white/10 dark:border-gray-700/30 hover:from-black hover:via-gray-800 hover:to-black hover:shadow-2xl hover:scale-[1.05] focus:outline-none focus:ring-2 focus:ring-white/20"
                onClick={() => setShowNotifications((v) => !v)}
            >
                <span className="sr-only">Ver notificaciones</span>
                <FaBell className="w-5 h-5 mx-auto text-white transition-all duration-300 group-hover:text-gray-200 drop-shadow-lg" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold leading-none text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg border-2 border-white dark:border-gray-800 animate-pulse">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 transition-opacity duration-500 opacity-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:opacity-100"></div>
            </button>

            {showNotifications && (
                <div className="absolute right-0 left-0 sm:left-auto sm:right-0 z-[9999] mx-2 sm:mx-0 max-w-sm sm:max-w-sm mt-4 overflow-hidden transition-all duration-500 border shadow-2xl w-auto sm:w-80 border-white/20 dark:border-gray-600/20 rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-gray-900/80">
                    {/* Header mejorado */}
                    <div className="relative px-6 py-4 overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-white/10 backdrop-blur-sm rounded-xl">
                                    <FaBell className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-lg font-bold text-white drop-shadow-lg">
                                    Notificaciones
                                </span>
                            </div>
                            <button
                                className="group px-3 py-1.5 text-xs font-semibold text-white/90 transition-all duration-300 rounded-xl backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 hover:text-white"
                                onClick={markAllAsRead}
                            >
                                <span className="drop-shadow-sm">
                                    Marcar leídas
                                </span>
                            </button>
                        </div>
                        <div className="absolute top-0 right-0 w-24 h-24 -mt-12 -mr-12 rounded-full bg-white/5"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 -mb-8 -ml-8 rounded-full bg-white/10"></div>
                    </div>

                    {/* Lista de notificaciones mejorada */}
                    <div className="overflow-y-auto max-h-80 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                                <div className="flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl">
                                    <FaBell className="w-6 h-6 text-gray-400" />
                                </div>
                                <p className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Sin notificaciones
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                    Cuando tengas notificaciones aparecerán aquí
                                </p>
                            </div>
                        ) : (
                            <div className="p-2 space-y-1">
                                {notifications.map((n, index) => (
                                    <div
                                        key={n.id}
                                        className={`group relative px-4 py-3 text-sm cursor-pointer transition-all duration-300 rounded-2xl border ${
                                            n.read_at
                                                ? "bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-gray-800/80 border-transparent hover:border-gray-200/50 dark:hover:border-gray-700/50"
                                                : "bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 text-gray-800 dark:text-gray-200 hover:from-blue-100/90 hover:to-indigo-100/90 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 border-blue-200/30 dark:border-blue-800/30 shadow-sm"
                                        } hover:shadow-md hover:scale-[1.01]`}
                                    >
                                        {!n.read_at && (
                                            <div className="absolute w-2 h-2 bg-blue-500 rounded-full top-3 right-3 animate-pulse"></div>
                                        )}
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0 ${
                                                    n.read_at
                                                        ? "bg-gray-200 dark:bg-gray-700"
                                                        : "bg-blue-100 dark:bg-blue-900/50"
                                                }`}
                                            >
                                                <FaBell
                                                    className={`w-3 h-3 ${
                                                        n.read_at
                                                            ? "text-gray-400"
                                                            : "text-blue-600 dark:text-blue-400"
                                                    }`}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className={`font-medium leading-snug ${
                                                        n.read_at
                                                            ? "text-gray-600 dark:text-gray-400"
                                                            : "text-gray-900 dark:text-gray-100"
                                                    }`}
                                                >
                                                    {n.data?.message ||
                                                        n.data?.body ||
                                                        "Notificación"}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                                                    {n.created_at
                                                        ? new Date(
                                                              n.created_at
                                                          ).toLocaleString(
                                                              "es-ES",
                                                              {
                                                                  day: "2-digit",
                                                                  month: "2-digit",
                                                                  year: "2-digit",
                                                                  hour: "2-digit",
                                                                  minute: "2-digit",
                                                              }
                                                          )
                                                        : ""}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div
                    className={`fixed top-4 right-4 z-[10000] transform transition-all duration-500 ${
                        toast
                            ? "translate-x-0 opacity-100 scale-100"
                            : "translate-x-full opacity-0 scale-95"
                    }`}
                >
                    <div
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border max-w-sm ${
                            toast.type === "success"
                                ? "bg-green-50/95 dark:bg-green-900/95 border-green-200/50 dark:border-green-800/50 text-green-800 dark:text-green-200"
                                : toast.type === "error"
                                ? "bg-red-50/95 dark:bg-red-900/95 border-red-200/50 dark:border-red-800/50 text-red-800 dark:text-red-200"
                                : "bg-blue-50/95 dark:bg-blue-900/95 border-blue-200/50 dark:border-blue-800/50 text-blue-800 dark:text-blue-200"
                        }`}
                    >
                        <div
                            className={`flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0 ${
                                toast.type === "success"
                                    ? "bg-green-100 dark:bg-green-800"
                                    : toast.type === "error"
                                    ? "bg-red-100 dark:bg-red-800"
                                    : "bg-blue-100 dark:bg-blue-800"
                            }`}
                        >
                            {toast.type === "success" ? (
                                <FaCheck
                                    className={`w-4 h-4 ${
                                        toast.type === "success"
                                            ? "text-green-600 dark:text-green-300"
                                            : ""
                                    }`}
                                />
                            ) : (
                                <FaInfoCircle
                                    className={`w-4 h-4 ${
                                        toast.type === "error"
                                            ? "text-red-600 dark:text-red-300"
                                            : "text-blue-600 dark:text-blue-300"
                                    }`}
                                />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium leading-snug">
                                {toast.message}
                            </p>
                        </div>
                        <button
                            onClick={() => setToast(null)}
                            className={`flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-200 hover:bg-black/10 dark:hover:bg-white/10 ${
                                toast.type === "success"
                                    ? "text-green-600 dark:text-green-400"
                                    : toast.type === "error"
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-blue-600 dark:text-blue-400"
                            }`}
                        >
                            <span className="text-lg leading-none">×</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
