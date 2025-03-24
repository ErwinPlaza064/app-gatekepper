import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import Typography from "@/Components/UI/Typography";
import axios from "axios";
import { useState } from "react";
import { Link } from "@inertiajs/react";

export default function Dashboard({ auth, visits }) {
    const { props } = usePage();
    const [notifications, setNotifications] = useState(
        props.auth.notifications || []
    );

    const markAsRead = () => {
        axios
            .post(route("notifications.markAsRead"))
            .then(() => {
                setNotifications([]);
            })
            .catch((error) =>
                console.error("Error al marcar como leídas", error)
            );
    };

    return (
        <Authenticated user={auth.user}>
            <Head title="Inicio" />
            <div className="max-w-7xl mx-aut px-10 py-20">
                <Typography
                    as={"h1"}
                    variant={"h1"}
                    color={"black"}
                    className="text-2xl font-bold mb-5"
                >
                    Bienvenido, {auth.user.name}!
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white flex flex-col ju shadow-md rounded-lg p-5">
                        <Typography
                            as={"h2"}
                            variant={"h2"}
                            color={"black"}
                            className="text-xl font-semibold mb-3"
                        >
                            Notificaciones
                        </Typography>
                        {notifications.length > 0 ? (
                            <>
                                <ul className="space-y-3">
                                    {notifications
                                        .slice(0, 2)
                                        .map((notification) => (
                                            <li
                                                key={notification.id}
                                                className="text-gray-700 border-b pb-2"
                                            >
                                                {notification.data.message}{" "}
                                                <br />
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
                                    className="mt-24 text-sm bg-black text-white px-3 py-1 rounded hover:bg-blue-700"
                                >
                                    Marcar todas como leídas
                                </button>
                            </>
                        ) : (
                            <Typography
                                as={"p"}
                                variant={"p"}
                                color={"black"}
                                className="text-gray-500"
                            >
                                No tienes notificaciones recientes.
                            </Typography>
                        )}
                    </div>
                    <div className="bg-white shadow-md rounded-lg p-5">
                        <Typography
                            as={"h2"}
                            variant={"h2"}
                            color={"black"}
                            className="text-xl font-semibold mb-3"
                        >
                            Visitas Recientes
                        </Typography>
                        {visits.length > 0 ? (
                            <ul className="space-y-3">
                                {visits.slice(0, 2).map((visit, index) => (
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
                            <Typography
                                as={"p"}
                                variant={"p"}
                                color={"p"}
                                className="text-gray-500"
                            >
                                No hay visitas recientes.
                            </Typography>
                        )}
                    </div>

                    <div className="bg-white shadow-md rounded-lg p-5">
                        <Typography
                            as={"h2"}
                            variant={"h2"}
                            color={"black"}
                            className="text-xl font-semibold mb-3"
                        >
                            Tu Perfil
                        </Typography>
                        <Typography as={"p"} variant={"p"} color={"black"}>
                            Nombre: {auth.user.name}
                            <br />
                            Dirección: {auth.user.address ?? "No disponible"}
                        </Typography>
                    </div>
                    <div className="p-5 flex flex-col items-center gap-5 bg-white shadow-md rounden-lg">
                        <Typography
                            as={"h2"}
                            variant={"h2"}
                            color={"black"}
                            className="text-xl font-semibold mb-3"
                        >
                            Contactanos
                        </Typography>
                        <Typography
                            className="text-center px-10"
                            as={"p"}
                            variant={"p"}
                            color={"black"}
                        >
                            <Link href={"contacto"} className="text-blue-500">
                                Contactanos
                            </Link>
                            <br />
                            para cualquier sugerencia o duda.
                        </Typography>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}
