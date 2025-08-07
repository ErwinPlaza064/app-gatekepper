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
                className="group relative p-2 transition-all duration-500 bg-black rounded-xl shadow-xl backdrop-blur-sm border border-white/10 dark:border-gray-700/30 hover:from-black hover:via-gray-800 hover:to-black hover:shadow-2xl hover:scale-[1.05] focus:outline-none focus:ring-2 focus:ring-white/20"
            >
                <FaTimes className="w-4 h-4 mx-auto text-white transition-all duration-300 group-hover:text-gray-200 drop-shadow-lg" />
                <div className="absolute inset-0 transition-opacity duration-500 opacity-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:opacity-100"></div>
            </button>
        </div>
    );
}
