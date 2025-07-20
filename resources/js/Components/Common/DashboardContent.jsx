import NotificationCard from "@/Components/Cards/NotificationCard";
import VisitsCard from "@/Components/Cards/VisitsCard";
import ComplaintsCard from "@/Components/Cards/ComplaintsCard";
import QRGenerator from "@/Components/Common/QRGenerator";
import QRDashboard from "@/Components/Common/QRDashboard";
import VisitsHistory from "@/Components/Common/VisitsHistory";

export default function DashboardContent({ activeTab, auth, visits }) {
    return (
        <div className="space-y-6">
            {activeTab === "dashboard" && (
                <div className="flex justify-center">
                    <div className="grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
                        <VisitsCard visits={visits} />
                        <ComplaintsCard />
                    </div>
                </div>
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
        </div>
    );
}
