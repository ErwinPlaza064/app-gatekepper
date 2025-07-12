export default function MobileHeader({ setSidebarOpen }) {
    return (
        <div className="px-4 py-3 border-b lg:hidden bg-white/80 backdrop-blur-xl border-white/20">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 transition-colors rounded-xl hover:bg-white/50"
                >
                    <svg
                        className="w-6 h-6"
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
                </button>
                <h1 className="text-lg font-bold text-transparent bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text">
                    Dashboard
                </h1>
                <div className="w-8"></div>
            </div>
        </div>
    );
}
