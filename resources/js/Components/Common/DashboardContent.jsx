import React, { memo, lazy, Suspense } from "react";

const QRGenerator = lazy(() => import("@/Components/Common/QRGenerator"));
const QRDashboard = lazy(() => import("@/Components/Common/QRDashboard"));
const VisitsHistory = lazy(() => import("@/Components/Common/VisitsHistory"));
const ComplaintsCard = lazy(() => import("@/Components/Cards/ComplaintsCard"));

import StatsCard from "@/Components/Cards/StatsCard";
import QuickStatsChart from "@/Components/Common/QuickStatsChart";

const ContentLoader = () => (
    <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">
            Cargando contenido...
        </span>
    </div>
);

const DashboardContent = memo(({ activeTab, auth, visits, stats }) => {
    if (activeTab === "escritorio") {
        return (
            <div className="min-h-full space-y-2">
                <div className="space-y-6">
                    <div className="flex justify-center">
                        <div className="w-full max-w-2xl">
                            <QuickStatsChart stats={stats} />
                        </div>
                    </div>
                    <StatsCard stats={stats} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full space-y-2">
            <Suspense fallback={<ContentLoader />}>
                {activeTab === "generate" && (
                    <div className="max-w-2xl mx-auto">
                        <QRGenerator userId={auth.user.id} />
                    </div>
                )}

                {activeTab === "qr-management" && (
                    <div className="max-w-4xl mx-auto">
                        <QRDashboard userId={auth.user.id} />
                    </div>
                )}

                {activeTab === "visits-history" && (
                    <div className="max-w-4xl mx-auto">
                        <VisitsHistory visits={visits} />
                    </div>
                )}

                {activeTab === "generar-quejas" && (
                    <div className="max-w-4xl mx-auto">
                        <ComplaintsCard />
                    </div>
                )}
            </Suspense>
        </div>
    );
});

DashboardContent.displayName = "DashboardContent";

export default DashboardContent;
