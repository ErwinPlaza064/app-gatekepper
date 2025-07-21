import { Link } from "@inertiajs/react";
import Typography from "@/Components/UI/Typography";

export default function Error() {
    return (
        <section className="flex flex-col items-center justify-center h-screen text-center gap-7 bg-gray-50">
            <Typography as={"h1"} variant={"h1"} color={"error"}>
                Error 403 No tienes suficientes permisos.
            </Typography>

            <div>
                <Link
                    href="/"
                    className="px-3 py-1 mt-24 text-sm text-white bg-black rounded hover:bg-blue-700"
                >
                    Regresar
                </Link>
            </div>
        </section>
    );
}
