import { useForm, usePage } from "@inertiajs/react";
import Typography from "@/Components/UI/Typography";

export default function ComplaintsCard() {
    const { props } = usePage();
    const { data, setData, post, processing, errors, reset } = useForm({
        message: "",
    });
    // Usar las quejas pasadas como prop desde el backend
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
        <div className="flex flex-col h-full max-w-2xl p-6 mx-auto bg-white border shadow rounded-xl">
            <Typography
                as="h2"
                variant="h2"
                color="black"
                className="mb-3 text-xl font-semibold"
            >
                Generar Queja
            </Typography>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 mb-8">
                <input
                    name="message"
                    value={data.message}
                    onChange={(e) => setData("message", e.target.value)}
                    className={`w-full p-2 border rounded ${
                        errors.message ? "border-red-600" : ""
                    }`}
                    placeholder="Escribe tu queja aqui"
                />

                {errors.message && (
                    <div className="text-red-600">{errors.message}</div>
                )}

                {props.flash?.success && (
                    <div className="relative text-green-700" role="alert">
                        <span className="block sm:inline">
                            {props.flash.success}
                        </span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={processing}
                    className="px-3 py-1 mt-1 text-sm text-white transition-all duration-300 ease-in-out bg-black rounded hover:bg-blue-700"
                >
                    Enviar Queja
                </button>
            </form>

            <Typography
                as="h3"
                variant="h3"
                color="black"
                className="mb-2 text-lg font-semibold"
            >
                Historial de Quejas
            </Typography>
            <div className="overflow-y-auto divide-y divide-gray-200 max-h-64">
                {complaints.length === 0 ? (
                    <div className="py-4 text-center text-gray-500">
                        No has enviado quejas aún.
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {complaints.map((c) => (
                            <li key={c.id} className="px-2 py-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-800">
                                        {c.message}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(
                                            c.created_at
                                        ).toLocaleString()}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
