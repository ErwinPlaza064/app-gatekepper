import { Head } from "@inertiajs/react";
import { useState } from "react";
import Sidebar from "@/Components/Common/Sidebar";
import MobileHeader from "@/Components/Common/MobileHeader";
import DashboardContent from "@/Components/Common/DashboardContent";

export default function Dashboard({ auth, visits }) {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    user={auth.user}
                />

                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <main className="flex-1 overflow-auto">
                    <MobileHeader setSidebarOpen={setSidebarOpen} />

                    <section className="p-6">
                        <DashboardContent
                            activeTab={activeTab}
                            auth={auth}
                            visits={visits}
                        />
                    </section>
                </main>
            </div>
        </>
    );
}
