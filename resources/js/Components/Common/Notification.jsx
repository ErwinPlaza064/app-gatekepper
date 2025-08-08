import React, { useRef } from "react";
import axios from "axios";
import { FaBell, FaCheck, FaInfoCircle } from "react-icons/fa";
import VisitorApprovalNotification from "../Notifications/VisitorApprovalNotification";

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

    const showToast = (message, type = "info") => {
        setToast({ message, type });
        setTimeout(() => {
            setToast(null);
        }, 3000);
    };

    const markAllAsRead = async () => {
        const unreadNotifications = notifications.filter((n) => !n.read_at);

        if (unreadNotifications.length === 0) {
            showToast("No hay notificaciones pendientes por leer", "info");
            return;
        }

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

    const updateNotification = (notificationId, updates) => {
        setNotifications((prev) =>
            prev.map((n) => 
                n.id === notificationId 
                    ? { ...n, ...updates, read_at: n.read_at || new Date().toISOString() }
                    : n
            )
        );
    };

    const unreadCount = notifications.filter((n) => !n.read_at).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                className="group relative p-3 transition-all duration-500 bg-black rounded-xl shadow-xl backdrop-blur-sm border border-white/10 dark:border-gray-700/30 hover:from-black hover:via-gray-800 hover:to-black hover:shadow-2xl hover:scale-[1.05] focus:outline-none focus:ring-2 focus:ring-white/20"
                onClick={() => setShowNotifications((v) => !v)}
            >
                <span className="sr-only">Ver notificaciones</span>
                <FaBell className="w-5 h-5 mx-auto text-white transition-all duration-300 group-hover:text-gray-200 drop-shadow-lg" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold leading-none text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg border-2 border-white dark:border-gray-800 animate-pulse">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
                <div className="absolute inset-0 transition-opacity duration-500 opacity-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:opacity-100"></div>
            </button>

            {showNotifications && (
                <div className="absolute left-1/2 transform -translate-x-1/2 sm:left-auto sm:right-0 sm:transform-none z-50 mt-4 w-80 max-w-[calc(100vw-2rem)] sm:max-w-sm overflow-hidden transition-all duration-300 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-lg bg-white dark:bg-gray-900">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full dark:bg-blue-600/20">
                                    <FaBell className="w-4 h-4 text-black dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Notificaciones
                                    </h3>
                                    {unreadCount > 0 && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {unreadCount} sin leer
                                        </p>
                                    )}
                                </div>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-600/10 rounded-md hover:bg-blue-100 dark:hover:bg-blue-600/20 transition-colors duration-200"
                                    onClick={markAllAsRead}
                                >
                                    Marcar leídas
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="overflow-y-auto max-h-80 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                                <div className="flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full dark:bg-gray-800">
                                    <FaBell className="w-6 h-6 text-gray-400" />
                                </div>
                                <p className="mb-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                                    Sin notificaciones
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Cuando tengas notificaciones aparecerán aquí
                                </p>
                            </div>
                        ) : (
                            <div className="p-2 space-y-2">
                                {notifications.map((n, index) => {
                                    // Verificar si es una notificación de aprobación de visitante
                                    if (n.data?.type === 'visitor_approval_request') {
                                        return (
                                            <VisitorApprovalNotification
                                                key={n.id}
                                                notification={n}
                                                onUpdate={updateNotification}
                                                showToast={showToast}
                                            />
                                        );
                                    }

                                    // Renderizado normal para otras notificaciones
                                    return (
                                        <div
                                            key={n.id}
                                            className={`group relative px-4 py-3 text-sm cursor-pointer transition-all duration-200 rounded-lg border ${
                                                n.read_at
                                                    ? "bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
                                                    : "bg-blue-50 dark:bg-blue-900/20 text-gray-900 dark:text-gray-100 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800"
                                            } hover:shadow-sm`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${
                                                        n.read_at
                                                            ? "bg-gray-200 dark:bg-gray-700"
                                                            : "bg-blue-100 dark:bg-blue-800"
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
                                                {!n.read_at && (
                                                    <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {toast && (
                <div
                    className={`fixed top-4 right-4 z-[10000] transform transition-all duration-300 ${
                        toast
                            ? "translate-x-0 opacity-100 scale-100"
                            : "translate-x-full opacity-0 scale-95"
                    }`}
                >
                    <div className="max-w-sm overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-900 dark:border-gray-700">
                        <div
                            className={`flex items-center gap-3 px-4 py-3 ${
                                toast.type === "success"
                                    ? "bg-green-50 dark:bg-green-900/20 border-l-4 border-l-green-500"
                                    : toast.type === "error"
                                    ? "bg-red-50 dark:bg-red-900/20 border-l-4 border-l-red-500"
                                    : "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500"
                            }`}
                        >
                            <div
                                className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${
                                    toast.type === "success"
                                        ? "bg-green-100 dark:bg-green-800"
                                        : toast.type === "error"
                                        ? "bg-red-100 dark:bg-red-800"
                                        : "bg-blue-100 dark:bg-blue-800"
                                }`}
                            >
                                {toast.type === "success" ? (
                                    <FaCheck className="w-4 h-4 text-green-600 dark:text-green-300" />
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
                                <p
                                    className={`text-sm font-medium leading-snug ${
                                        toast.type === "success"
                                            ? "text-green-900 dark:text-green-100"
                                            : toast.type === "error"
                                            ? "text-red-900 dark:text-red-100"
                                            : "text-blue-900 dark:text-blue-100"
                                    }`}
                                >
                                    {toast.message}
                                </p>
                            </div>
                            <button
                                onClick={() => setToast(null)}
                                className={`flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5 ${
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
                </div>
            )}
        </div>
    );
}
