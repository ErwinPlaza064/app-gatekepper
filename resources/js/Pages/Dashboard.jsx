import React, { useEffect, useState } from "react";
import { Head } from "@inertiajs/react";
import Sidebar from "@/Components/Common/Sidebar";
import MobileHeader from "@/Components/Common/MobileHeader";
import DashboardContent from "@/Components/Common/DashboardContent";
import UserProfile from "@/Components/Common/UserProfile";
import Notification from "@/Components/Common/Notification";
import NotificationListener from "@/Components/Common/NotificationListener";
import toast from "react-hot-toast";
import { subscribeUserToPush } from "@/Utils/pushNotifications";

export default function Dashboard({ auth, visits, stats, visitsChartData }) {
    const [activeTab, setActiveTab] = useState("escritorio");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState(
        auth.user.notifications || []
    );

    useEffect(() => {
        if (
            typeof window !== "undefined" &&
            "Notification" in window &&
            typeof window.Notification.requestPermission === "function" &&
            window.Notification.permission !== "granted"
        ) {
            window.Notification.requestPermission();
        }
        // Solo suscribir si el usuario está autenticado
        if (auth.user) {
            subscribeUserToPush(import.meta.env.VITE_VAPID_PUBLIC_KEY);
        }
    }, []);

    return (
        <>
            <Head title="Dashboard" />
            <NotificationListener
                userId={auth.user.id}
                onNotification={(notification) => {
                    toast(notification.title + ": " + notification.body);
                }}
            />
            <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
                <header className="flex items-center w-full gap-4 py-0 bg-white shadow-md">
                    <MobileHeader setSidebarOpen={setSidebarOpen} />

                    <div className="flex items-center">
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
                        <section className="p-6">
                            <DashboardContent
                                activeTab={activeTab}
                                auth={auth}
                                visits={visits}
                            />
                        </section>
                    </main>
                </div>
            </div>
        </>
    );
}
