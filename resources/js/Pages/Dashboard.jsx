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
            <Head title="Dashboard" />
            <div className="px-10 py-20 max-w-7xl mx-aut">
                <Typography
                    className="p-2"
                    as={"h1"}
                    variant={"h1"}
                    color={"black"}
                >
                    Bienvenido, !{auth.user.name}!
                </Typography>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    <div className="p-5 bg-white rounded-lg shadow-md">
                        <Typography
                            as={"h2"}
                            variant={"h2"}
                            color={"black"}
                            className="mb-3 text-xl font-semibold"
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
                                                className="pb-2 text-gray-700 border-b"
                                            >
                                                {notification.data.message}{" "}
                                                <br />
                                                <span className="text-sm text-gray-500">
                                                    {new Date(
                                                        notification.created_at
                                                    ).toLocaleString()}
                                                </span>
                                            </li>
                                        ))}
                                </ul>
                                <button
                                    onClick={markAsRead}
                                    className="px-3 py-1 mt-3 text-sm text-white bg-black rounded hover:bg-blue-700"
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
                    <div className="p-5 bg-white rounded-lg shadow-md">
                        <Typography
                            as={"h2"}
                            variant={"h2"}
                            color={"black"}
                            className="mb-3 text-xl font-semibold"
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
                                        <span className="text-sm text-gray-600">
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

                    <div className="p-5 bg-white rounded-lg shadow-md">
                        <Typography
                            as={"h2"}
                            variant={"h2"}
                            color={"black"}
                            className="mb-3 text-xl font-semibold"
                        >
                            Tu Perfil
                        </Typography>
                        <Typography as={"p"} variant={"p"} color={"black"}>
                            Nombre: {auth.user.name}
                            <br />
                            Dirección: {auth.user.address ?? "No disponible"}
                        </Typography>
                    </div>
                    <div className="flex flex-col items-center gap-5 p-5 bg-white shadow-md rounden-lg">
                        <Typography
                            as={"h2"}
                            variant={"h2"}
                            color={"black"}
                            className="mb-3 text-xl font-semibold"
                        >
                            Contactanos
                        </Typography>
                        <Typography
                            className="px-10 text-center"
                            as={"p"}
                            variant={"p"}
                            color={"black"}
                        >
                            No dudes en{" "}
                            <Link href={"/contacto"} className="text-blue-700">
                                contactarnos
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
