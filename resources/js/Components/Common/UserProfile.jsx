import { FaSignOutAlt } from "react-icons/fa";
import React, { useState, useRef, useEffect } from "react";
import { router } from "@inertiajs/react";
import ThemeToggle from "./ThemeToggle";
import { useDashboardTheme } from "@/Contexts/DashboardThemeContext";

export default function UserProfile({ user, showThemeToggle, showLogout }) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { resetTheme } = useDashboardTheme();

    useEffect(() => {
        if (!open) return;
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    const handleLogout = (e) => {
        e.preventDefault();

        // Limpiar el tema del dashboard antes de cerrar sesión
        resetTheme();

        router.post(
            "/logout",
            {},
            {
                onFinish: () => {
                    router.visit("/", { replace: true });
                },
            }
        );
    };

    return (
        <div
            className="relative"
            ref={dropdownRef}
        >
            <div className="flex items-center">
                <div
                    className="group flex items-center transition-all duration-300 cursor-pointer rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95"
                    onClick={() => setOpen((v) => !v)}
                >
                    <div className="relative">
                        <div className="flex items-center justify-center w-10 h-10 transition-all duration-300 bg-black shadow-lg rounded-xl border border-white/10 dark:border-gray-700/30 group-hover:shadow-xl">
                            <span className="text-sm font-bold text-white drop-shadow-lg">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div
                className={`absolute right-0 mt-3 min-w-[300px] rounded-lg shadow-xl z-50 transition-all duration-300 ${
                    open
                        ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                        : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                }`}
                style={{ willChange: "opacity, transform" }}
            >
                <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-2xl dark:bg-gray-900 dark:border-gray-700">
                    <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 bg-black rounded-full shadow-lg">
                                <span className="text-lg font-semibold text-white">
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {user.name}
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Residente Autorizado
                                </p>
                            </div>
                        </div>
                    </div>

                    {showThemeToggle && (
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full dark:bg-blue-600/20">
                                        <svg
                                            className="w-4 h-4 text-blue-600 dark:text-blue-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a4 4 0 004-4V5z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                            Apariencia
                                        </h4>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            Personalizar interfaz
                                        </p>
                                    </div>
                                </div>
                                <div className="p-1 bg-gray-200 rounded-md dark:bg-gray-700">
                                    <ThemeToggle />
                                </div>
                            </div>
                        </div>
                    )}

                    {showLogout && (
                        <div className="p-4">
                            <button
                                className="flex items-center w-full gap-3 px-4 py-3 text-sm font-medium text-left transition-all duration-200 bg-transparent border border-transparent rounded-md group hover:bg-red-50 dark:hover:bg-red-600/10 dark:hover:border-red-600/20"
                                type="button"
                                tabIndex={0}
                                onClick={handleLogout}
                            >
                                <div className="flex items-center justify-center w-8 h-8 transition-colors bg-red-100 rounded-full dark:bg-red-600/20 group-hover:bg-red-200 dark:group-hover:bg-red-600/30">
                                    <FaSignOutAlt className="w-4 h-4 text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300">
                                        Cerrar Sesión
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400">
                                        Salir del sistema de forma segura
                                    </div>
                                </div>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
