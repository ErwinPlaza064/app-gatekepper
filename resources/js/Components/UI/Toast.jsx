import React, { createContext, useContext, useState, useEffect } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = "info", duration = 3000) => {
        const id = Date.now();
        const newToast = { id, message, type, duration };

        // Si el nuevo toast es success o error, remover todos los toasts de tipo loading
        if (type === "success" || type === "error") {
            setToasts((prev) =>
                prev.filter((toast) => toast.type !== "loading")
            );
        }

        setToasts((prev) => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id; // Retornar el ID por si se necesita remover manualmente
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    const removeAllLoadingToasts = () => {
        setToasts((prev) => prev.filter((toast) => toast.type !== "loading"));
    };

    return (
        <ToastContext.Provider
            value={{ addToast, removeToast, removeAllLoadingToasts }}
        >
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="fixed z-50 space-y-4 top-4 right-4">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    {...toast}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
}

function Toast({ id, message, type, onClose }) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Add entrance animation
        const timer = setTimeout(() => {
            setIsExiting(false);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const styles = {
        success: {
            bg: "bg-green-50",
            border: "border-green-200",
            text: "text-green-800",
            icon: (
                <svg
                    className="w-6 h-6 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            ),
        },
        error: {
            bg: "bg-red-50",
            border: "border-red-200",
            text: "text-red-800",
            icon: (
                <svg
                    className="w-6 h-6 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            ),
        },
        warning: {
            bg: "bg-yellow-50",
            border: "border-yellow-200",
            text: "text-yellow-800",
            icon: (
                <svg
                    className="w-6 h-6 text-yellow-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
            ),
        },
        info: {
            bg: "bg-blue-50",
            border: "border-blue-200",
            text: "text-blue-800",
            icon: (
                <svg
                    className="w-6 h-6 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            ),
        },
        loading: {
            bg: "bg-blue-50",
            border: "border-blue-200",
            text: "text-blue-800",
            icon: (
                <div className="w-6 h-6 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
            ),
        },
    };

    const currentStyle = styles[type] || styles.info;

    return (
        <div
            className={`
                ${currentStyle.bg} ${currentStyle.border} ${currentStyle.text}
                border-2 rounded-lg shadow-lg p-4 min-w-[300px] max-w-md
                transform transition-all duration-300 ease-in-out
                ${
                    isExiting
                        ? "translate-x-full opacity-0"
                        : "translate-x-0 opacity-100"
                }
            `}
        >
            <div className="flex items-start">
                <div className="flex-shrink-0">{currentStyle.icon}</div>
                <div className="flex-1 ml-3">
                    <p className="text-sm font-medium">{message}</p>
                </div>
                {type !== "loading" && (
                    <button
                        onClick={handleClose}
                        className={`flex-shrink-0 ml-4 inline-flex ${currentStyle.text} hover:opacity-70 focus:outline-none transition-opacity`}
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}

export default Toast;
