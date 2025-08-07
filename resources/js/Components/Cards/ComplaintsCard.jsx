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
        <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
            {/* Header Material Design */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg dark:bg-orange-900/30">
                        <FaExclamationTriangle className="w-5 h-5 text-black dark:text-orange-400" />
                    </div>
                    <div>
                        <Typography
                            as="h2"
                            variant="h3"
                            className="text-gray-900 dark:text-white"
                        >
                            Generar Queja
                        </Typography>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Reporta cualquier inconveniente o sugerencia
                        </p>
                    </div>
                </div>
            </div>

            {/* Formulario Material Design */}
            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <div className="flex items-center gap-2">
                                <FaCommentDots className="w-4 h-4" />
                                Mensaje
                            </div>
                        </label>
                        <textarea
                            name="message"
                            value={data.message}
                            onChange={(e) => setData("message", e.target.value)}
                            rows={4}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors duration-200 resize-none ${
                                errors.message
                                    ? "border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-500 dark:focus:border-red-500"
                                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400`}
                            placeholder="Describe tu queja o sugerencia de manera detallada..."
                        />
                    </div>

                    {errors.message && (
                        <div className="flex items-start gap-2 p-3 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                            <FaExclamationTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-red-700 dark:text-red-300">
                                {errors.message}
                            </span>
                        </div>
                    )}

                    {props.flash?.success && (
                        <div className="flex items-start gap-2 p-3 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                            <FaPaperPlane className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-green-700 dark:text-green-300">
                                {props.flash.success}
                            </span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={processing}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 font-medium rounded-lg transition-colors duration-200 ${
                            processing
                                ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                : "bg-black hover:bg-blue-700 focus:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                        }`}
                    >
                        {processing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-gray-300 rounded-full animate-spin border-t-gray-600 dark:border-gray-600 dark:border-t-gray-300"></div>
                                <span>Enviando...</span>
                            </>
                        ) : (
                            <>
                                <FaPaperPlane className="h-4 w -4" />
                                <span>Enviar Queja</span>
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Historial de quejas Material Design */}
            <div className="border-t border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg dark:bg-blue-900/30">
                            <FaHistory className="w-4 h-4 text-black dark:text-blue-400" />
                        </div>
                        <Typography
                            as="h3"
                            variant="h4"
                            className="text-gray-900 dark:text-white"
                        >
                            Historial de Quejas
                        </Typography>
                    </div>

                    <div className="overflow-y-auto bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-600 max-h-80">
                        {complaints.length === 0 ? (
                            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-gray-100 rounded-lg dark:bg-gray-700">
                                    <FaCommentDots className="w-6 h-6 text-gray-400" />
                                </div>
                                <Typography
                                    as="p"
                                    variant="p"
                                    className="mb-2 text-gray-600 dark:text-gray-400"
                                >
                                    Sin quejas registradas
                                </Typography>
                                <Typography
                                    as="p"
                                    variant="small"
                                    className="text-gray-500 dark:text-gray-500"
                                >
                                    Tus quejas y sugerencias aparecerán aquí una
                                    vez que las envíes
                                </Typography>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-600">
                                {complaints.map((c, index) => (
                                    <div
                                        key={c.id}
                                        className="p-4 transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 mt-1 bg-orange-100 rounded-full dark:bg-orange-900/30">
                                                <span className="text-xs font-medium text-blackdark:text-orange-400">
                                                    {index + 1}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <Typography
                                                    as="p"
                                                    variant="small"
                                                    className="mb-2 leading-relaxed text-gray-900 dark:text-gray-100"
                                                >
                                                    {c.message}
                                                </Typography>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                    <FaClock className="w-3 h-3" />
                                                    <span>
                                                        {new Date(
                                                            c.created_at
                                                        ).toLocaleString(
                                                            "es-ES",
                                                            {
                                                                day: "2-digit",
                                                                month: "2-digit",
                                                                year: "2-digit",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            }
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
