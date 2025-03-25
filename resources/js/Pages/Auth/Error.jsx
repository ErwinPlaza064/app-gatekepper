import { Link } from "@inertiajs/react";
import Typography from "@/Components/UI/Typography";

export default function Error() {
    return (
        <section className="flex flex-col gap-7 items-center justify-center h-screen bg-gray-50">
            <Typography as={"h1"} variant={"h1"} color={"error"}>
                Error 403 No tienes suficientes permisos.
            </Typography>

            <div>
                <Link
                    href="/"
                    className="mt-24 text-sm bg-black text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                    Regresar
                </Link>
            </div>
        </section>
    );
}
