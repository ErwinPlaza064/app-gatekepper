import React, { useEffect, useState } from "react";
import { Head, router } from "@inertiajs/react";
import Sidebar from "@/Components/Common/Sidebar";
import MobileHeader from "@/Components/Common/MobileHeader";
import DashboardContent from "@/Components/Common/DashboardContent";
import UserProfile from "@/Components/Common/UserProfile";
import Notification from "@/Components/Common/Notification";
import NotificationListener from "@/Components/Common/NotificationListener";
import { ThemeProvider } from "@/Contexts/ThemeContext";
import toast from "react-hot-toast";

export default function Dashboard({ auth, visits, stats, visitsChartData }) {
    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem("sidebarActiveTab") || "escritorio";
    });
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState(
        auth.user.notifications || []
    );

    useEffect(() => {
        if (auth.user.rol === "administrador" || auth.user.rol === "admin") {
            const timeout = setTimeout(() => {
                router.visit("/admin");
            }, 2000);
            return () => clearTimeout(timeout);
        }
    }, [auth.user.rol]);

    useEffect(() => {
        localStorage.setItem("sidebarActiveTab", activeTab);
    }, [activeTab]);

    if (auth.user.rol === "administrador" || auth.user.rol === "admin") {
        return (
            <ThemeProvider>
                <div className="dashboard-gradient flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="inline-block w-8 h-8 border-4 border-indigo-600 dark:border-indigo-400 border-solid rounded-full animate-spin border-t-transparent"></div>
                        <p className="mt-4 text-lg text-secondary">
                            Redirigiendo al panel de administración...
                        </p>
                    </div>
                </div>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider>
            <Head title="Dashboard" />
            <NotificationListener
                userId={auth.user.id}
                onNotification={(notification) => {
                    toast(notification.title + ": " + notification.body);
                }}
            />
            <div className="flex flex-col h-screen dashboard-gradient">
                <header className="flex items-center w-full gap-4 py-0 header-glass shadow-md dark:shadow-gray-800/50 relative z-[9998]">
                    <MobileHeader setSidebarOpen={setSidebarOpen} />

                    <div className="flex items-center relative z-[9999]">
                        <Notification
                            notifications={notifications}
                            setNotifications={setNotifications}
                        />
                        <UserProfile
                            user={auth.user}
                            showThemeToggle
                            showLogout
                        />
                    </div>
                </header>
                <div className="flex flex-1">
                    <Sidebar
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />

                    {sidebarOpen && (
                        <div
                            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}

                    <main className="flex-1 overflow-auto">
                        <section className="p-6 min-h-full">
                            <DashboardContent
                                activeTab={activeTab}
                                auth={auth}
                                visits={visits}
                                stats={stats}
                            />
                        </section>
                    </main>
                </div>
            </div>
        </ThemeProvider>
    );
}
