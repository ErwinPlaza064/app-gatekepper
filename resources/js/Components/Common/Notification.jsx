import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import {
    FaBell,
    FaCheck,
    FaInfoCircle,
    FaExclamationTriangle,
    FaTimes,
} from "react-icons/fa";

const Notification = ({ notifications = [], onClose, show = false }) => {
    const [localNotifications, setLocalNotifications] = useState(notifications);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        setLocalNotifications(notifications);
    }, [notifications]);

    const markAsRead = (notificationId) => {
        router.post(
            `/notifications/${notificationId}/mark-as-read`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setLocalNotifications((prev) =>
                        prev.map((notif) =>
                            notif.id === notificationId
                                ? {
                                      ...notif,
                                      read_at: new Date().toISOString(),
                                  }
                                : notif
                        )
                    );
                },
            }
        );
    };

    const markAllAsRead = () => {
        router.post(
            "/notifications/mark-all-as-read",
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setLocalNotifications((prev) =>
                        prev.map((notif) => ({
                            ...notif,
                            read_at: new Date().toISOString(),
                        }))
                    );
                },
            }
        );
    };

    const deleteNotification = (notificationId) => {
        router.delete(`/notifications/${notificationId}`, {
            preserveScroll: true,
            onSuccess: () => {
                setLocalNotifications((prev) =>
                    prev.filter((notif) => notif.id !== notificationId)
                );
            },
        });
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case "success":
                return <FaCheck className="w-6 h-6 text-green-500" />;
            case "warning":
                return (
                    <FaExclamationTriangle className="w-6 h-6 text-yellow-500" />
                );
            case "error":
                return (
                    <FaExclamationTriangle className="w-6 h-6 text-red-500" />
                );
            default:
                return <FaInfoCircle className="w-6 h-6 text-blue-500" />;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffTime / (1000 * 60));

        if (diffDays > 0) {
            return `Hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;
        } else if (diffHours > 0) {
            return `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
        } else if (diffMinutes > 0) {
            return `Hace ${diffMinutes} minuto${diffMinutes > 1 ? "s" : ""}`;
        } else {
            return "Ahora mismo";
        }
    };

    if (!show) return null;

    const unreadCount = localNotifications.filter(
        (notif) => !notif.read_at
    ).length;

    // Vista móvil: Full screen
    if (isMobile) {
        return (
            <div className="fixed inset-0 z-50 bg-white">
                {/* Header móvil */}
                <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <FaBell className="w-6 h-6 text-gray-600" />
                        <h1 className="text-lg font-semibold text-gray-900">
                            Notificaciones
                        </h1>
                        {unreadCount > 0 && (
                            <span className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 transition-colors rounded-full hover:bg-gray-100"
                    >
                        <FaTimes className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Botón marcar todas como leídas - móvil */}
                {unreadCount > 0 && (
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                        <button
                            onClick={markAllAsRead}
                            className="w-full px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            Marcar todas como leídas ({unreadCount})
                        </button>
                    </div>
                )}

                {/* Lista de notificaciones - móvil */}
                <div className="flex-1 overflow-y-auto">
                    {localNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-4 py-12">
                            <FaBell className="w-16 h-16 mb-4 text-gray-300" />
                            <p className="text-center text-gray-500">
                                No tienes notificaciones
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {localNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-gray-50 transition-colors ${
                                        !notification.read_at
                                            ? "bg-blue-50 border-l-4 border-l-blue-500"
                                            : ""
                                    }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {getNotificationIcon(
                                                notification.data?.type
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="mb-1 text-sm font-medium text-gray-900">
                                                {notification.data?.title ||
                                                    "Notificación"}
                                            </p>
                                            <p className="mb-2 text-sm leading-relaxed text-gray-600">
                                                {notification.data?.message ||
                                                    "Sin mensaje"}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-gray-400">
                                                    {formatDate(
                                                        notification.created_at
                                                    )}
                                                </p>
                                                <div className="flex items-center space-x-2">
                                                    {!notification.read_at && (
                                                        <button
                                                            onClick={() =>
                                                                markAsRead(
                                                                    notification.id
                                                                )
                                                            }
                                                            className="text-xs font-medium text-blue-600 hover:text-blue-800"
                                                        >
                                                            Marcar como leída
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() =>
                                                            deleteNotification(
                                                                notification.id
                                                            )
                                                        }
                                                        className="text-xs font-medium text-red-600 hover:text-red-800"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
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

    // Vista desktop: Modal flotante (estilo actual)
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Overlay */}
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={onClose}
                ></div>

                {/* Modal */}
                <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    {/* Header desktop */}
                    <div className="px-6 py-4 bg-white border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <FaBell className="w-6 h-6 text-gray-600" />
                                <h3 className="text-lg font-medium text-gray-900">
                                    Notificaciones
                                </h3>
                                {unreadCount > 0 && (
                                    <span className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <FaTimes className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Botón marcar todas como leídas - desktop */}
                    {unreadCount > 0 && (
                        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                            <button
                                onClick={markAllAsRead}
                                className="w-full px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                                Marcar todas como leídas ({unreadCount})
                            </button>
                        </div>
                    )}

                    {/* Lista de notificaciones - desktop */}
                    <div className="px-6 py-4 overflow-y-auto bg-white max-h-96">
                        {localNotifications.length === 0 ? (
                            <div className="py-8 text-center">
                                <FaBell className="w-12 h-12 mx-auto text-gray-300" />
                                <p className="mt-2 text-sm text-gray-500">
                                    No tienes notificaciones
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {localNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 rounded-lg border transition-all ${
                                            !notification.read_at
                                                ? "bg-blue-50 border-blue-200"
                                                : "bg-gray-50 border-gray-200"
                                        }`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0">
                                                {getNotificationIcon(
                                                    notification.data?.type
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {notification.data?.title ||
                                                        "Notificación"}
                                                </p>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    {notification.data
                                                        ?.message ||
                                                        "Sin mensaje"}
                                                </p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <p className="text-xs text-gray-400">
                                                        {formatDate(
                                                            notification.created_at
                                                        )}
                                                    </p>
                                                    <div className="flex items-center space-x-2">
                                                        {!notification.read_at && (
                                                            <button
                                                                onClick={() =>
                                                                    markAsRead(
                                                                        notification.id
                                                                    )
                                                                }
                                                                className="text-xs text-blue-600 hover:text-blue-800"
                                                            >
                                                                Marcar como
                                                                leída
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() =>
                                                                deleteNotification(
                                                                    notification.id
                                                                )
                                                            }
                                                            className="text-xs text-red-600 hover:text-red-800"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Notification;
