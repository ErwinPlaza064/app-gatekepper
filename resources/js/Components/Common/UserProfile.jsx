import { FaSignOutAlt } from "react-icons/fa";
import React, { useState, useRef, useEffect } from "react";
import { router } from "@inertiajs/react";

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
            className="relative p-2 mr-4 border-t border-white/20"
            ref={dropdownRef}
        >
            <div
                className="flex items-center p-1 space-x-3 transition-all duration-300 bg-black cursor-pointer rounded-2xl hover:bg-neutral-800"
                onClick={() => setOpen((v) => !v)}
            >
                <div className="relative">
                    <div className="flex items-center justify-center w-12 h-12 bg-black shadow-lg rounded-2xl">
                        <span className="font-bold text-white">
                            {user.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>
            <div
                className={`absolute right-0 mt-2 min-w-[220px] rounded-xl shadow-2xl z-50 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 overflow-hidden transition-all duration-300 ${
                    open
                        ? "opacity-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 -translate-y-4 pointer-events-none"
                }`}
                style={{ willChange: "opacity, transform" }}
            >
                <div className="px-5 py-4 text-white bg-gradient-to-r from-black/90 to-neutral-800">
                    <div className="text-lg font-bold leading-tight">
                        {user.name}
                    </div>
                    <div className="text-xs text-gray-300">Residente</div>
                </div>
                <div className="border-t border-neutral-200 dark:border-neutral-700" />
                {showLogout && (
                    <button
                        className="flex items-center w-full gap-2 px-5 py-4 text-sm font-semibold text-left text-red-600 transition-all duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        type="button"
                        tabIndex={0}
                        onClick={handleLogout}
                    >
                        <FaSignOutAlt className="w-4 h-4" />
                        Cerrar sesión
                    </button>
                )}
            </div>
        </div>
    );
}
