import Typography from "@/Components/UI/Typography";
import { useForm } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";

export default function ComplaintsCard() {
    const { props } = usePage();

    const { data, setData, post, processing, errors, reset } = useForm({
        message: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("complaints.store"), {
            onSuccess: () => {
                reset("message");
            },
        });
    };
    return (
        <div className="p-5 bg-white rounded-lg shadow-md">
            <Typography
                as="h2"
                variant="h2"
                color="black"
                className="mb-3 text-xl font-semibold"
            >
                Generar Queja
            </Typography>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
        </div>
    );
}
