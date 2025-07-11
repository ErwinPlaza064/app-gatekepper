import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useState } from "react";
import Typography from "@/Components/UI/Typography";
import QRGenerator from "@/Components/Common/QRGenerator";
import QRDashboard from "@/Components/Common/QRDashboard";
import VisitorHistory from "@/Components/Common/VisitorHistory";
import NotificationCard from "@/Components/Cards/NotificationCard";
import VisitsCard from "@/Components/Cards/VisitsCard";
import ProfileCard from "@/Components/Cards/ProfileCard";
import ComplaintsCard from "@/Components/Cards/ComplaintsCard";
import IsAdmin from "@/Components/UI/IsAdmin";

export default function Dashboard({ auth, visits }) {
    const [activeTab, setActiveTab] = useState("dashboard");

    const isAdmin =
        auth.user.rol === "administrador" ||
        auth.user.rol === "portero" ||
        auth.user.rol === "adminresidencial";

    return (
        <Authenticated user={auth.user}>
            <Head title="Dashboard" />
            <section className="px-10 py-20 mx-auto max-w-7xl">
                {isAdmin ? (
                    <IsAdmin />
                ) : (
                    <>
                        {/* Navegación con pestañas - Solo para residentes */}
                        <div className="mb-8">
                            <nav className="flex p-1 space-x-4 bg-white rounded-lg shadow-sm">
                                <button
                                    onClick={() => setActiveTab("dashboard")}
                                    className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                                        activeTab === "dashboard"
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                                >
                                    📊 Dashboard
                                </button>
                                <button
                                    onClick={() => setActiveTab("generate")}
                                    className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                                        activeTab === "generate"
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                                >
                                    🔗 Generar QR
                                </button>
                                <button
                                    onClick={() =>
                                        setActiveTab("qr-management")
                                    }
                                    className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                                        activeTab === "qr-management"
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                                >
                                    📱 Mis QR Codes
                                </button>
                            </nav>
                        </div>

                        {/* Contenido de las pestañas */}
                        <div className="min-h-[500px]">
                            {activeTab === "dashboard" && (
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                                    <NotificationCard />
                                    <VisitsCard visits={visits} />
                                    <ProfileCard auth={auth} />
                                    <ComplaintsCard />
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
                        </div>
                    </>
                )}
            </section>
        </Authenticated>
    );
}
