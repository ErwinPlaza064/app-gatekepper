import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import Typography from "@/Components/UI/Typography";
import { useState, useEffect } from "react";
import { debounce } from "lodash";

export default function MisVisitas({ auth }) {
    const { visits = [], searchQuery = "" } = usePage().props;
    const [search, setSearch] = useState(searchQuery);

    useEffect(() => {
        const delaySearch = debounce(() => {
            router.get(
                route("mis-visitas"),
                { search },
                { preserveState: true, replace: true }
            );
        }, 500);

        delaySearch();
        return () => delaySearch.cancel();
    }, [search]);

    return (
        <Authenticated user={auth.user}>
            <Head title="Mis Visitas" />
            <div className="px-6 py-20 mx-auto max-w-7xl">
                <Typography
                    as="h1"
                    variant="h1"
                    color="black"
                    className="p-2 text-center"
                >
                    Mis Visitas
                </Typography>
                <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    className="w-full p-2 mb-5 bg-gray-200 border-none rounded"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <div className="p-8 shadow-lg bg-gradient-to-r from-gray-50 to-gray-200 rounded-xl">
                    {visits.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                            {visits.map((visit, index) => (
                                <div
                                    key={index}
                                    className="p-5 transition duration-300 transform bg-white rounded-lg shadow-md hover:scale-105 hover:shadow-lg"
                                >
                                    <Typography
                                        as="h2"
                                        variant="h2"
                                        color="black"
                                        className="text-lg font-semibold"
                                    >
                                        {visit.name}
                                    </Typography>
                                    <p className="mt-2 text-gray-600">
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
                        <div className="py-12 text-center">
                            <Typography
                                as="p"
                                variant="p"
                                color="black"
                                className="text-lg text-gray-600"
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
