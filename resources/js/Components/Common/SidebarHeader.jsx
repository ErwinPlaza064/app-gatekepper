import { FaTimes } from "react-icons/fa";

export default function SidebarHeader({ setSidebarOpen }) {
    return (
        <div className="flex items-center justify-between w-full pb-4 border-b border-white/20 dark:border-gray-700/50">
            <div className="flex items-center space-x-3">
                <div>
                    <h2 className="text-xl font-bold text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text">
                        GateKeeper
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Panel De Control
                    </p>
                </div>
            </div>
            <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-gray-600 transition-colors rounded-xl hover:bg-white/30 dark:hover:bg-gray-700/50 dark:text-gray-300"
            >
                <FaTimes className="w-4 h-4 mx-auto text-white" />
            </button>
        </div>
    );
}
