export default function MobileHeader({ setSidebarOpen }) {
    return (
        <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 transition-colors text-primary rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/50"
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
    );
}
