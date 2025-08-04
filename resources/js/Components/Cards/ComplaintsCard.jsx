import { useForm, usePage } from "@inertiajs/react";
import Typography from "@/Components/UI/Typography";
import {
    FaExclamationTriangle,
    FaPaperPlane,
    FaHistory,
    FaCommentDots,
    FaClock,
} from "react-icons/fa";

export default function ComplaintsCard() {
    const { props } = usePage();
    const { data, setData, post, processing, errors, reset } = useForm({
        message: "",
    });
    const complaints = props.complaints || [];

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("complaints.store"), {
            onSuccess: () => {
                reset("message");
            },
        });
    };

    return (
        <div className="relative overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 max-w-2xl mx-auto">
            {/* Header con gradiente negro */}
            <div className="relative px-8 py-6 bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl">
                        <FaExclamationTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <Typography
                            as="h2"
                            variant="h2"
                            className="text-2xl font-bold text-white drop-shadow-lg"
                        >
                            Generar Queja
                        </Typography>
                        <p className="text-sm text-white/80 mt-1">
                            Reporta cualquier inconveniente o sugerencia
                        </p>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            </div>

            {/* Formulario mejorado */}
            <div className="p-8 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group">
                        <div className="absolute top-4 left-4 flex items-center pointer-events-none">
                            <FaCommentDots className="h-5 w-5 text-gray-400 group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition-colors" />
                        </div>
                        <textarea
                            name="message"
                            value={data.message}
                            onChange={(e) => setData("message", e.target.value)}
                            rows={4}
                            className={`w-full pl-14 pr-4 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border rounded-2xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 hover:bg-white dark:hover:bg-gray-800 resize-none ${
                                errors.message
                                    ? "border-red-400 dark:border-red-500 focus:ring-red-400/50 dark:focus:ring-red-500/50"
                                    : "border-gray-200/50 dark:border-gray-700/50 focus:ring-black/20 dark:focus:ring-white/20"
                            }`}
                            placeholder="Describe tu queja o sugerencia de manera detallada..."
                        />
                    </div>

                    {errors.message && (
                        <div className="flex items-center gap-2 px-4 py-3 bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-2xl backdrop-blur-sm">
                            <FaExclamationTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                            <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                                {errors.message}
                            </span>
                        </div>
                    )}

                    {props.flash?.success && (
                        <div className="flex items-center gap-3 px-4 py-3 bg-green-50/80 dark:bg-green-900/20 border border-green-200/50 dark:border-green-800/50 rounded-2xl backdrop-blur-sm">
                            <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-800/50 rounded-xl flex-shrink-0">
                                <FaPaperPlane className="w-4 h-4 text-green-600 dark:text-green-300" />
                            </div>
                            <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                                {props.flash.success}
                            </span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={processing}
                        className={`group relative w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-black via-gray-900 to-black text-white font-semibold rounded-2xl shadow-xl border border-white/10 transition-all duration-300 backdrop-blur-sm ${
                            processing
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:from-gray-900 hover:via-black hover:to-gray-900 hover:shadow-2xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/20"
                        }`}
                    >
                        {processing ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                                <span className="drop-shadow-sm">
                                    Enviando...
                                </span>
                            </>
                        ) : (
                            <>
                                <FaPaperPlane className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                <span className="drop-shadow-sm">
                                    Enviar Queja
                                </span>
                            </>
                        )}
                        {!processing && (
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        )}
                    </button>
                </form>
            </div>

            {/* Historial de quejas mejorado */}
            <div className="relative px-8 py-6 bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden border-t border-white/10">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl">
                        <FaHistory className="w-5 h-5 text-white" />
                    </div>
                    <Typography
                        as="h3"
                        variant="h3"
                        className="text-xl font-bold text-white drop-shadow-lg"
                    >
                        Historial de Quejas
                    </Typography>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                    {complaints.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                            <div className="flex items-center justify-center w-16 h-16 mb-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                                <FaCommentDots className="w-6 h-6 text-white/70" />
                            </div>
                            <p className="text-lg font-medium text-white/90 mb-2">
                                Sin quejas registradas
                            </p>
                            <p className="text-sm text-white/60">
                                Tus quejas y sugerencias aparecerán aquí una vez
                                que las envíes
                            </p>
                        </div>
                    ) : (
                        <div className="p-4 space-y-3">
                            {complaints.map((c, index) => (
                                <div
                                    key={c.id}
                                    className="group relative p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-xl flex-shrink-0 mt-1">
                                            <span className="text-xs font-bold text-white">
                                                {index + 1}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white/90 font-medium leading-relaxed mb-3">
                                                {c.message}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-white/60">
                                                <FaClock className="w-3 h-3" />
                                                <span>
                                                    {new Date(
                                                        c.created_at
                                                    ).toLocaleString("es-ES", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "2-digit",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute top-4 right-4 w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
            </div>
        </div>
    );
}
