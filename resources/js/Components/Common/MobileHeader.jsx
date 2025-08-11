export default function MobileHeader({ setSidebarOpen }) {
    return (
        <button
            onClick={() => setSidebarOpen(true)}
            className="group relative p-2.5 transition-all duration-300 bg-black rounded-xl shadow-lg backdrop-blur-sm border border-white/10 dark:border-gray-700/30 hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/20 active:scale-95"
        >
            <svg
                className="w-5 h-5 text-white transition-all duration-300 group-hover:text-gray-200 drop-shadow-lg"
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
            <div className="absolute inset-0 transition-opacity duration-300 opacity-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:opacity-100"></div>
        </button>
    );
}
