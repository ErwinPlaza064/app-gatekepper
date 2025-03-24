import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import Typography from "@/Components/UI/Typography";

export default function MisVisitas({ auth }) {
    const { visits = [] } = usePage().props;

    return (
        <Authenticated user={auth.user}>
            <Head title="Mis Visitas" />
            <div className="max-w-7xl mx-auto px-6 py-20">
                <Typography
                    as="h1"
                    variant="h1"
                    color="black"
                    className="text-4xl font-extrabold text-center mb-8"
                >
                    Mis Visitas
                </Typography>

                <div className="bg-gradient-to-r from-gray-50 to-gray-200 shadow-lg rounded-xl p-8">
                    {visits.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {visits.map((visit, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-5 rounded-lg shadow-md transition duration-300 transform hover:scale-105 hover:shadow-lg"
                                >
                                    <Typography
                                        as="h2"
                                        variant="h2"
                                        color="black"
                                        className="text-lg font-semibold"
                                    >
                                        {visit.name}
                                    </Typography>
                                    <p className="text-gray-600 mt-2">
                                        <span className="font-semibold">
                                            Fecha y Hora:
                                        </span>{" "}
                                        {new Date(
                                            visit.entry_time
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Typography
                                as="p"
                                variant="p"
                                color="black"
                                className="text-gray-600 text-lg"
                            >
                                No tienes visitas registradas.
                            </Typography>
                        </div>
                    )}
                </div>
            </div>
        </Authenticated>
    );
}
