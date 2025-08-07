import React, { createContext, useContext, useState, useEffect } from "react";
import { router } from "@inertiajs/react";

const DashboardThemeContext = createContext();

export const useDashboardTheme = () => {
    const context = useContext(DashboardThemeContext);
    if (!context) {
        throw new Error(
            "useDashboardTheme debe ser usado dentro de un DashboardThemeProvider"
        );
    }
    return context;
};

export const DashboardThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Solo verificar localStorage para el dashboard
        try {
            const savedTheme = localStorage.getItem("dashboard-theme");
            if (savedTheme) {
                return savedTheme === "dark";
            }
            // Por defecto, usar modo claro para el dashboard
            return false;
        } catch (error) {
            return false;
        }
    });

    useEffect(() => {
        // Aplicar el tema inmediatamente al montar el componente dashboard
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("dashboard-theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("dashboard-theme", "light");
        }
    }, [isDarkMode]);

    // Limpiar tema cuando se desmonta el componente (salir del dashboard)
    useEffect(() => {
        return () => {
            // Al desmontar, remover dark mode y limpiar localStorage
            document.documentElement.classList.remove("dark");
        };
    }, []);

    // Escuchar cambios de ruta con Inertia
    useEffect(() => {
        const removeListener = router.on("navigate", (event) => {
            // Si navegamos fuera del dashboard, limpiar el tema
            if (!event.detail.page.url.includes("/dashboard")) {
                document.documentElement.classList.remove("dark");
            }
        });

        return removeListener;
    }, []);

    const toggleTheme = () => {
        setIsDarkMode((prev) => !prev);
    };

    const resetTheme = () => {
        // Función para limpiar el tema cuando se cierra sesión
        setIsDarkMode(false);
        document.documentElement.classList.remove("dark");
        try {
            localStorage.removeItem("dashboard-theme");
        } catch (error) {
            console.warn("No se pudo limpiar el tema del localStorage:", error);
        }
    };

    const value = {
        isDarkMode,
        toggleTheme,
        resetTheme,
        setTheme: (theme) => setIsDarkMode(theme === "dark"),
    };

    return (
        <DashboardThemeContext.Provider value={value}>
            {children}
        </DashboardThemeContext.Provider>
    );
};
