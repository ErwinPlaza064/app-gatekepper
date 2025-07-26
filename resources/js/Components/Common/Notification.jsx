import React, { useRef } from "react";
import axios from "axios";
import { FaBell } from "react-icons/fa";

export default function Notification({ notifications, setNotifications }) {
    const [showNotifications, setShowNotifications] = React.useState(false);
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

    const markAllAsRead = async () => {
        try {
            // Usar URL con fallback y forzar HTTPS
            let API_URL =
                import.meta.env.VITE_API_URL ||
                "https://app-gatekepper-production.up.railway.app";

            // Forzar HTTPS si la URL usa HTTP
            if (API_URL.startsWith("http://")) {
                API_URL = API_URL.replace("http://", "https://");
            }

            console.log("Using API URL for notifications:", API_URL);

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
        } catch (error) {
            console.error("Error marking notifications as read:", error);

            // Opcional: mostrar un mensaje de error al usuario
            if (error.response?.status === 404) {
                console.warn("Endpoint de notificaciones no encontrado");
            } else if (error.response?.status === 401) {
                console.warn("No autorizado para marcar notificaciones");
            }
        }
    };

    const unreadCount = notifications.filter((n) => !n.read_at).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                className="relative p-2 transition bg-black rounded-full shadow-md hover:bg-gray-800 focus:outline-none"
                onClick={() => setShowNotifications((v) => !v)}
            >
                <span className="sr-only">Ver notificaciones</span>
                <FaBell className="w-6 h-6 mx-auto text-white" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full shadow">
                        {unreadCount}
                    </span>
                )}
            </button>
            {showNotifications && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm"
                        style={{ transition: "all 0.2s" }}
                        onClick={() => setShowNotifications(false)}
                    />
                    <div
                        className="absolute right-0 z-50 mt-2 overflow-hidden bg-white border border-gray-100 shadow-2xl rounded-xl animate-fade-in"
                        style={{
                            width: "18rem",
                            maxWidth: "95vw",
                            left: "auto",
                            right: 0,
                            ...(window.innerWidth <= 500
                                ? {
                                      width: "70vw",
                                      right: "-1vw",
                                      borderRadius: "1rem",
                                  }
                                : {}),
                        }}
                    >
                        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
                            <span className="text-base font-semibold text-gray-700">
                                Notificaciones
                            </span>
                            <button
                                className="px-2 py-1 text-xs font-medium text-blue-700 transition rounded bg-blue-50 hover:bg-blue-100"
                                onClick={markAllAsRead}
                            >
                                Marcar como leídas
                            </button>
                        </div>
                        <div
                            className="overflow-y-auto divide-y divide-gray-100 max-h-64"
                            style={{ maxHeight: "16rem" }}
                        >
                            {notifications.length === 0 ? (
                                <div className="px-3 py-8 text-sm text-center text-gray-400">
                                    No tienes notificaciones.
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className={`group px-3 py-3 text-sm cursor-pointer transition-all ${
                                            n.read_at
                                                ? "bg-white text-gray-400 hover:bg-gray-50"
                                                : "bg-blue-50 text-gray-800 hover:bg-blue-100"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="text-sm font-medium"
                                                style={{
                                                    wordBreak: "break-word",
                                                }}
                                            >
                                                {n.data?.message ||
                                                    n.data?.body ||
                                                    "Notificación"}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-xs text-gray-400">
                                            {n.created_at
                                                ? new Date(
                                                      n.created_at
                                                  ).toLocaleString()
                                                : ""}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
