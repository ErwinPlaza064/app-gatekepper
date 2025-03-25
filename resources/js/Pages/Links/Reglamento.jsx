import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import Typography from "@/Components/UI/Typography";

export default function Reglamento({ auth }) {
    return (
        <Authenticated user={auth.user}>
            <Head title="Reglamento" />
            <div className="max-w-4xl px-6 py-20 mx-auto">
                <Typography
                    as="h1"
                    variant="h1"
                    color="black"
                    className="p-2 text-center"
                >
                    Reglamento de Visitas
                </Typography>

                <div className="p-8 space-y-6 bg-gray-100 rounded-lg shadow-md">
                    <div>
                        <Typography
                            as="h2"
                            variant="h2"
                            color="black"
                            className="text-xl font-semibold"
                        >
                            Identificación Obligatoria
                        </Typography>
                        <Typography
                            as="p"
                            variant="p"
                            color="black"
                            className="mt-2 text-gray-700"
                        >
                            Todos los visitantes deben presentar una
                            identificación oficial al ingresar al recinto. Sin
                            excepción.
                        </Typography>
                    </div>

                    <div>
                        <Typography
                            as="h2"
                            variant="h2"
                            color="black"
                            className="text-xl font-semibold"
                        >
                            Comportamiento y Seguridad
                        </Typography>
                        <Typography
                            as="p"
                            variant="p"
                            color="black"
                            className="mt-2 text-gray-700"
                        >
                            Se espera que todos los visitantes respeten las
                            normas del recinto. Cualquier alteración del orden
                            resultará en la expulsión inmediata.
                        </Typography>
                    </div>

                    <div>
                        <Typography
                            as="h2"
                            variant="h2"
                            color="black"
                            className="text-xl font-semibold"
                        >
                            Registro Obligatorio
                        </Typography>
                        <Typography
                            as="p"
                            variant="p"
                            color="black"
                            className="mt-2 text-gray-700"
                        >
                            Todos los ingresos deben ser registrados en el
                            sistema. El residente será responsable de sus
                            visitantes en todo momento.
                        </Typography>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}
