export default function UserProfile({ user }) {
    return (
        <div className="p-6 border-t border-white/20">
            <div className="flex items-center p-4 space-x-3 transition-all duration-300 rounded-2xl bg-gradient-to-r from-white/60 to-white/30 backdrop-blur-sm hover:from-white/70 hover:to-white/40">
                <div className="relative">
                    <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl">
                        <span className="font-bold text-white">
                            {user.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="absolute w-4 h-4 bg-green-500 border-2 border-white rounded-full -bottom-1 -right-1"></div>
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500 capitalize">
                        {user.rol}
                    </p>
                </div>
            </div>
        </div>
    );
}
