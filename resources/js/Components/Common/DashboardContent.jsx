import React from "react";
import VisitsCard from "@/Components/Cards/VisitsCard";
import ComplaintsCard from "@/Components/Cards/ComplaintsCard";
import QRGenerator from "@/Components/Common/QRGenerator";
import QRDashboard from "@/Components/Common/QRDashboard";
import VisitsHistory from "@/Components/Common/VisitsHistory";
import StatsCard from "@/Components/Cards/StatsCard";
import QuickStatsChart from "@/Components/Common/QuickStatsChart";

export default function DashboardContent({ activeTab, auth, visits, stats }) {
    return (
        <div className="space-y-2">
            {activeTab === "escritorio" && (
                <>
                    <div className="flex justify-center">
                        <div className="w-full max-w-2xl">
                            <QuickStatsChart stats={stats} />
                        </div>
                    </div>
                    <StatsCard stats={stats} />
                </>
            )}

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
        </div>
    );
}
