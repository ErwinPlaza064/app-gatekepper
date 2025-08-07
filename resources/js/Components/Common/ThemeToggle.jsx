import React from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import { useDashboardTheme } from "@/Contexts/DashboardThemeContext";

export default function ThemeToggle({ className = "" }) {
    const { isDarkMode, toggleTheme } = useDashboardTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`relative inline-flex items-center justify-center w-10 h-10 rounded-xl
                       bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
                       transition-all duration-300 group ${className}`}
            title={
                isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
            }
        >
            <div className="relative w-5 h-5">
                <FaSun
                    className={`absolute inset-0 w-5 h-5 text-yellow-500 transition-all duration-300 transform
                               ${
                                   isDarkMode
                                       ? "rotate-90 scale-0 opacity-0"
                                       : "rotate-0 scale-100 opacity-100"
                               }`}
                />
                <FaMoon
                    className={`absolute inset-0 w-5 h-5 text-blue-400 transition-all duration-300 transform
                               ${
                                   isDarkMode
                                       ? "rotate-0 scale-100 opacity-100"
                                       : "-rotate-90 scale-0 opacity-0"
                               }`}
                />
            </div>

            {/* Efecto de hover */}
            <div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-400/20 to-blue-400/20
                           opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
        </button>
    );
}
