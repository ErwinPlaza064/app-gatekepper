import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

export default function Dashboard({ auth }) {
    return (
        <Authenticated user={auth.user}>
            <Head title="Inicio" />
            <div className="max-w-7xl mx-auto py-20">
                <h1 className="text-2xl font-bold mb-5">
                    Bienvenido, {auth.user.name}!
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white shadow-md rounded-lg p-5">
                        <h2 className="text-xl font-semibold mb-3">
                            Visitas Recientes
                        </h2>
                        <ul className="space-y-3">
                            <li className="flex justify-between">
                                <span>Juan Pérez</span>
                                <span className="text-gray-600 text-sm">
                                    Hace 2 días
                                </span>
                            </li>
                            <li className="flex justify-between">
                                <span>Ana Gómez</span>
                                <span className="text-gray-600 text-sm">
                                    Hace 1 semana
                                </span>
                            </li>
                            <li className="flex justify-between">
                                <span>María López</span>
                                <span className="text-gray-600 text-sm">
                                    Hace 3 semanas
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white shadow-md rounded-lg p-5">
                        <h2 className="text-xl font-semibold mb-3">
                            Notificaciones
                        </h2>
                        <ul className="space-y-3">
                            <li className="text-gray-700">
                                Tienes 2 notificaciones pendientes.
                            </li>
                            <li className="text-gray-700">
                                Se ha registrado una nueva visita a tu nombre.
                            </li>
                        </ul>
                    </div>

                    {/* Tarjeta de perfil */}
                    <div className="bg-white shadow-md rounded-lg p-5">
                        <h2 className="text-xl font-semibold mb-3">
                            Tu Perfil
                        </h2>
                        <p>Nombre: {auth.user.name}</p>
                        <p>Email: {auth.user.email}</p>
                        <p>Dirección: {auth.user.address ?? "No disponible"}</p>
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-3">
                        Sugerencias o Soporte
                    </h2>
                    <button className="bg-black text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600">
                        Enviar una Sugerencia
                    </button>
                    <p className="mt-3 text-gray-600">
                        Si tienes algún problema o sugerencia, no dudes en
                        contactarnos.
                    </p>
                </div>
            </div>
        </Authenticated>
    );
}
