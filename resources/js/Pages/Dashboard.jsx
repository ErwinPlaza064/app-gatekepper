import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import axios from "axios";
import { useState } from "react";

export default function Dashboard({ auth, visits }) {
    const { props } = usePage();
    const [notifications, setNotifications] = useState(
        props.auth.notifications || []
    );

    const markAsRead = () => {
        axios
            .post(route("notifications.markAsRead"))
            .then(() => {
                setNotifications([]); // 🔥 Vacía la lista de notificaciones sin recargar
            })
            .catch((error) =>
                console.error("Error al marcar como leídas", error)
            );
    };

    return (
        <Authenticated user={auth.user}>
            <Head title="Inicio" />
            <div className="max-w-7xl mx-auto py-20">
                <h1 className="text-2xl font-bold mb-5">
                    Bienvenido, {auth.user.name}!
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 📌 Tarjeta de Notificaciones */}
                    <div className="bg-white shadow-md rounded-lg p-5">
                        <h2 className="text-xl font-semibold mb-3">
                            Notificaciones
                        </h2>
                        {notifications.length > 0 ? (
                            <>
                                <ul className="space-y-3">
                                    {notifications.map((notification) => (
                                        <li
                                            key={notification.id}
                                            className="text-gray-700 border-b pb-2"
                                        >
                                            {notification.data.message} <br />
                                            <span className="text-gray-500 text-sm">
                                                {new Date(
                                                    notification.created_at
                                                ).toLocaleString()}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={markAsRead}
                                    className="mt-3 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                >
                                    Marcar todas como leídas
                                </button>
                            </>
                        ) : (
                            <p className="text-gray-500">
                                No tienes notificaciones recientes.
                            </p>
                        )}
                    </div>

                    {/* 🏠 Tarjeta de Visitas Recientes */}
                    <div className="bg-white shadow-md rounded-lg p-5">
                        <h2 className="text-xl font-semibold mb-3">
                            Visitas Recientes
                        </h2>
                        {visits.length > 0 ? (
                            <ul className="space-y-3">
                                {visits.map((visit, index) => (
                                    <li
                                        key={index}
                                        className="flex justify-between"
                                    >
                                        <span>{visit.name}</span>
                                        <span className="text-gray-600 text-sm">
                                            {new Date(
                                                visit.entry_time
                                            ).toLocaleString()}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">
                                No hay visitas recientes.
                            </p>
                        )}
                    </div>

                    {/* 🧑‍💻 Tarjeta de Perfil */}
                    <div className="bg-white shadow-md rounded-lg p-5">
                        <h2 className="text-xl font-semibold mb-3">
                            Tu Perfil
                        </h2>
                        <p>Nombre: {auth.user.name}</p>
                        <p>Email: {auth.user.email}</p>
                        <p>Dirección: {auth.user.address ?? "No disponible"}</p>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}
