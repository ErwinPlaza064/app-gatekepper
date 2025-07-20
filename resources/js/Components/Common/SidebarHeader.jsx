import { FaTimes } from "react-icons/fa";
export default function SidebarHeader({ setSidebarOpen }) {
    return (
        <div className="p-6 mx-auto border-b border-white/20">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div>
                        <h2 className="text-xl font-bold text-transparent bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text">
                            GateKeeper
                        </h2>
                        <p className="text-xs text-center text-gray-500">
                            Panel De Control
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 transition-colors rounded-xl hover:bg-white/30"
                >
                    <FaTimes className="w-4 h-4 mx-auto" />
                </button>
            </div>
        </div>
    );
}
