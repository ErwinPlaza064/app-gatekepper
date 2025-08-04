import { FaSignOutAlt } from "react-icons/fa";
import React, { useState, useRef, useEffect } from "react";
import { router } from "@inertiajs/react";
import ThemeToggle from "./ThemeToggle";

export default function UserProfile({ user, showThemeToggle, showLogout }) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

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
            className="relative p-2 mr-4 border-t border-white/10 dark:border-gray-700/10"
            ref={dropdownRef}
        >
            <div className="flex items-center gap-2">
                <div
                    className="group flex items-center p-1 space-x-3 transition-all duration-500 cursor-pointer rounded-3xl backdrop-blur-sm bg-gradient-to-r from-black/40 via-gray-900/40 to-black/40 hover:from-black/60 hover:via-gray-800/60 hover:to-black/60 border border-white/20 dark:border-gray-700/30 shadow-xl hover:shadow-2xl hover:scale-[1.02]"
                    onClick={() => setOpen((v) => !v)}
                >
                    <div className="relative">
                        <div className="flex items-center justify-center w-12 h-12 transition-all duration-500 shadow-2xl bg-gradient-to-br from-black via-gray-900 to-black rounded-3xl group-hover:shadow-black/50">
                            <span className="text-lg font-bold text-white drop-shadow-lg">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div
                className={`absolute right-0 mt-3 min-w-[280px] rounded-3xl shadow-2xl z-[9999] backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border border-white/20 dark:border-gray-700/30 overflow-hidden transition-all duration-500 ${
                    open
                        ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                        : "opacity-0 -translate-y-6 scale-95 pointer-events-none"
                }`}
                style={{ willChange: "opacity, transform" }}
            >
                <div className="relative px-6 py-5 overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="relative z-10">
                        <div className="text-xl font-bold leading-tight text-white drop-shadow-lg">
                            {user.name}
                        </div>
                        <div className="text-sm font-medium text-gray-300">
                            Residente
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full bg-white/5"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 -mb-12 -ml-12 rounded-full bg-white/10"></div>
                </div>

                {showThemeToggle && (
                    <div className="px-6 py-4 bg-gradient-to-r from-gray-100/70 to-white/70 dark:from-gray-900/70 dark:to-black/70 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    Apariencia
                                </span>
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                    Personaliza tu experiencia
                                </span>
                            </div>
                            <div className="ml-4">
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                )}

                {showLogout && (
                    <div className="p-2">
                        <button
                            className="flex items-center w-full gap-3 px-4 py-3 text-sm font-semibold text-left text-red-600 transition-all duration-300 bg-transparent border-2 border-transparent group rounded-2xl dark:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/20 dark:hover:to-red-800/20 hover:text-red-700 dark:hover:text-red-300 hover:shadow-lg hover:border-red-200 dark:hover:border-red-800/30"
                            type="button"
                            tabIndex={0}
                            onClick={handleLogout}
                        >
                            <div className="flex items-center justify-center w-8 h-8 transition-all duration-300 bg-transparent rounded-xl dark:bg-gray-800 group-hover:bg-black dark:group-hover:bg-gray-700">
                                <FaSignOutAlt className="w-4 h-4 text-red-500" />
                            </div>
                            <span>Cerrar sesión</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
