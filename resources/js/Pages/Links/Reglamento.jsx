import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import Typography from "@/Components/UI/Typography";

export default function Reglamento({ auth }) {
    return (
        <Authenticated user={auth.user}>
            <Head title="Reglamento" />
            <div className="max-w-4xl mx-auto px-6 py-20">
                <Typography
                    as="h1"
                    variant="h1"
                    color="black"
                    className="text-3xl font-bold text-center mb-8"
                >
                    Reglamento de Visitas
                </Typography>

                <div className="bg-gray-100 shadow-md rounded-lg p-8 space-y-6">
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
                            className="text-gray-700 mt-2"
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
                            className="text-gray-700 mt-2"
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
                            className="text-gray-700 mt-2"
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
