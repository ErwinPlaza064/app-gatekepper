import SidebarHeader from "./SidebarHeader";
import SidebarMenuItem from "./SidebarMenuItem";
import { sidebarLinks } from "../../../../public/sidebarLinks";

export default function Sidebar({
    sidebarOpen,
    setSidebarOpen,
    activeTab,
    setActiveTab,
}) {
    return (
        <aside
            className={`${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } fixed inset-y-0 left-0 z-[9999] w-72 sidebar-glass shadow-2xl transform transition-all duration-500 ease-out`}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-800/40 glass-effect"></div>

            <div className="relative z-10 flex flex-col h-full">
                <div className="p-6">
                    <SidebarHeader setSidebarOpen={setSidebarOpen} />
                </div>
                <nav className="flex-1 px-6 pb-6 space-y-4">
                    <div className="space-y-3">
                        {sidebarLinks.map((item) => (
                            <SidebarMenuItem
                                key={item.id}
                                item={item}
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                            />
                        ))}
                    </div>
                </nav>
            </div>
        </aside>
    );
}
