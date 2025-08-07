export default function MobileHeader({ setSidebarOpen }) {
    return (
        <button
            onClick={() => setSidebarOpen(true)}
            className="group relative p-3 transition-all duration-500 bg-black rounded-xl shadow-xl backdrop-blur-sm border border-white/10 dark:border-gray-700/30 hover:from-black hover:via-gray-800 hover:to-black hover:shadow-2xl hover:scale-[1.05] focus:outline-none focus:ring-2 focus:ring-white/20"
        >
            <svg
                className="w-6 h-6 text-white transition-all duration-300 group-hover:text-gray-200 drop-shadow-lg"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                />
            </svg>
            <div className="absolute inset-0 transition-opacity duration-500 opacity-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:opacity-100"></div>
        </button>
    );
}
