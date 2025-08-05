import React, { useEffect, lazy, Suspense, memo } from "react";
import { Head, router } from "@inertiajs/react";
import { ThemeProvider } from "@/Contexts/ThemeContext";
import toast from "react-hot-toast";
import {
    useDashboardOptimization,
    useNotificationOptimization,
} from "@/Hooks/useDashboardOptimization";

// Importar directamente componentes ligeros y críticos
import DashboardContent from "@/Components/Common/DashboardContent";

// Lazy loading solo para componentes no críticos
const Sidebar = lazy(() => import("@/Components/Common/Sidebar"));
const MobileHeader = lazy(() => import("@/Components/Common/MobileHeader"));
const UserProfile = lazy(() => import("@/Components/Common/UserProfile"));
const Notification = lazy(() => import("@/Components/Common/Notification"));
const NotificationListener = lazy(() =>
    import("@/Components/Common/NotificationListener")
);

// Componente de loading más simple y rápido
const QuickLoader = memo(() => (
    <div className="w-8 h-8 border-2 border-gray-300 rounded-full border-t-gray-600 animate-spin"></div>
));

const Dashboard = memo(({ auth, visits, stats, visitsChartData }) => {
    const {
        activeTab,
        sidebarOpen,
        setActiveTab,
        closeSidebar,
        toggleSidebar,
    } = useDashboardOptimization();
    const { notifications, setNotifications } = useNotificationOptimization(
        auth.user.notifications || []
    );

    useEffect(() => {
        if (auth.user.rol === "administrador" || auth.user.rol === "admin") {
            const timeout = setTimeout(() => {
                router.visit("/admin");
            }, 1500); // Reducir tiempo de espera
            return () => clearTimeout(timeout);
        }
    }, [auth.user.rol]);

    // Renderizado optimizado para admin redirect
    if (auth.user.rol === "administrador" || auth.user.rol === "admin") {
        return (
            <ThemeProvider>
                <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
                    <div className="text-center">
                        <QuickLoader />
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
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
            <Suspense fallback={<LoadingSpinner />}>
                <NotificationListener
                    userId={auth.user.id}
                    onNotification={(notification) => {
                        toast(notification.title + ": " + notification.body);
                    }}
                />
            </Suspense>

            <div className="flex flex-col h-screen dashboard-gradient">
                <header className="relative z-40 flex items-center justify-between w-full px-4 shadow-md header-glass dark:shadow-gray-800/50">
                    <Suspense fallback={<div className="w-8 h-8"></div>}>
                        <MobileHeader setSidebarOpen={setSidebarOpen} />
                    </Suspense>

                    <div className="relative z-40 flex items-center gap-4">
                        <Suspense fallback={<div className="w-8 h-8"></div>}>
                            <Notification
                                notifications={notifications}
                                setNotifications={setNotifications}
                            />
                        </Suspense>
                        <Suspense
                            fallback={
                                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            }
                        >
                            <UserProfile
                                user={auth.user}
                                showThemeToggle
                                showLogout
                            />
                        </Suspense>
                    </div>
                </header>

                <div className="flex flex-1">
                    <Suspense
                        fallback={<div className="w-64 bg-gray-100"></div>}
                    >
                        <Sidebar
                            sidebarOpen={sidebarOpen}
                            setSidebarOpen={setSidebarOpen}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                    </Suspense>

                    {sidebarOpen && (
                        <div
                            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}

                    <main className="flex-1 overflow-auto">
                        <section className="min-h-full p-6">
                            {/* DashboardContent sin Suspense - ya maneja su propio lazy loading */}
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
});

Dashboard.displayName = "Dashboard";

export default Dashboard;
