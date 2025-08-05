import { useState, useEffect, useMemo, useCallback } from "react";

/**
 * Hook optimizado para manejar el estado del dashboard
 */
export function useDashboardOptimization(initialTab = "escritorio") {
    const [activeTab, setActiveTab] = useState(() => {
        try {
            return localStorage.getItem("sidebarActiveTab") || initialTab;
        } catch {
            return initialTab;
        }
    });
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Memoizar el handler para cambiar tab
    const handleTabChange = useCallback((newTab) => {
        setActiveTab(newTab);
        try {
            localStorage.setItem("sidebarActiveTab", newTab);
        } catch (error) {
            console.warn("No se pudo guardar en localStorage:", error);
        }
    }, []);

    // Memoizar el handler para toggle sidebar
    const toggleSidebar = useCallback(() => {
        setSidebarOpen((prev) => !prev);
    }, []);

    const closeSidebar = useCallback(() => {
        setSidebarOpen(false);
    }, []);

    // Limpiar estado cuando se cambia de tab
    useEffect(() => {
        if (sidebarOpen) {
            setSidebarOpen(false);
        }
    }, [activeTab]);

    return {
        activeTab,
        sidebarOpen,
        setActiveTab: handleTabChange,
        setSidebarOpen,
        toggleSidebar,
        closeSidebar,
    };
}

/**
 * Hook para optimizar el manejo de notificaciones
 */
export function useNotificationOptimization(initialNotifications = []) {
    const [notifications, setNotifications] = useState(initialNotifications);

    const addNotification = useCallback((notification) => {
        setNotifications((prev) => [notification, ...prev.slice(0, 49)]); // Limitar a 50
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const markAsRead = useCallback((id) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    }, []);

    const unreadCount = useMemo(
        () => notifications.filter((n) => !n.read).length,
        [notifications]
    );

    return {
        notifications,
        setNotifications,
        addNotification,
        removeNotification,
        clearNotifications,
        markAsRead,
        unreadCount,
    };
}

/**
 * Hook para optimizar stats del dashboard
 */
export function useStatsOptimization(stats) {
    return useMemo(() => {
        if (!stats) return { visitas: 0, quejas: 0, qrs: 0 };

        return {
            visitas: Number(stats.visitas) || 0,
            quejas: Number(stats.quejas) || 0,
            qrs: Number(stats.qrs) || 0,
        };
    }, [stats]);
}

/**
 * Hook para detectar si debemos mostrar componentes pesados
 */
export function usePerformanceMode() {
    const [isLowEndDevice, setIsLowEndDevice] = useState(false);

    useEffect(() => {
        // Detectar dispositivos de bajo rendimiento
        const checkPerformance = () => {
            // Verificar memoria disponible
            const memory = navigator.deviceMemory || 4;

            // Verificar número de núcleos
            const cores = navigator.hardwareConcurrency || 2;

            // Verificar conexión
            const connection = navigator.connection;
            const isSlowConnection =
                connection &&
                (connection.effectiveType === "slow-2g" ||
                    connection.effectiveType === "2g" ||
                    connection.effectiveType === "3g");

            // Dispositivo de bajo rendimiento si:
            const lowEnd = memory < 4 || cores < 4 || isSlowConnection;

            setIsLowEndDevice(lowEnd);
        };

        checkPerformance();
    }, []);

    return {
        isLowEndDevice,
        shouldUseLazyLoading: isLowEndDevice,
        shouldDisableAnimations: isLowEndDevice,
    };
}
