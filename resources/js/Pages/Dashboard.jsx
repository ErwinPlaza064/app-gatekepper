import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import Typography from "@/Components/UI/Typography";
import axios from "axios";
import { useState } from "react";
import { Link } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";

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

    const { data, setData, post, processing, errors, reset } = useForm({
        message: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("complaints.store"), {
            onSuccess: () => {
                reset("message");
            },
            onError: (errors) => {
                console.error(errors);
            },
        });
    };

    const isAdmin = auth.user.rol === "administrador";

    return (
        <Authenticated user={auth.user}>
            <Head title="Dashboard" />
            <section className="px-10 py-20 max-w-7xl mx-aut">
                <Typography
                    className="p-2"
                    as={"h1"}
                    variant={"h1"}
                    color={"black"}
                >
                    Bienvenid@,{" "}
                    <span className="text-gray-700">{auth.user.name}!</span>
                </Typography>
                {isAdmin ? (
                    <div className="mt-5">
                        <Link
                            href="/admin"
                            className="p-2 text-white bg-black rounded-lg hover:bg-blue-700"
                        >
                            Ir al Panel de Administración
                        </Link>
                    </div>
                ) : (
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
                                Dirección:{" "}
                                {auth.user.address ?? "No disponible"}
                            </Typography>
                        </div>

                        <div className="p-5 bg-white rounded-lg shadow-md">
                            <Typography
                                as="h2"
                                variant="h2"
                                color="black"
                                className="mb-3 text-xl font-semibold"
                            >
                                Generar Queja
                            </Typography>
                            <form
                                onSubmit={handleSubmit}
                                className="flex flex-col gap-5"
                            >
                                <input
                                    name="message"
                                    value={data.message}
                                    onChange={(e) =>
                                        setData("message", e.target.value)
                                    }
                                    className={`w-full p-2 border rounded ${
                                        errors.message ? "border-red-600" : ""
                                    }`}
                                    placeholder="Escribe tu queja aqui"
                                />

                                {errors.message && (
                                    <div className="text-red-600">
                                        {errors.message}
                                    </div>
                                )}

                                {props.flash?.success && (
                                    <div
                                        className="relative px-4 py-3 text-green-700 bg-green-100 border border-green-400 rounded"
                                        role="alert"
                                    >
                                        <span className="block sm:inline">
                                            {props.flash.success}
                                        </span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-3 py-1 mt-20 text-sm text-white bg-black rounded hover:bg-blue-700"
                                >
                                    Enviar Queja
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </section>
        </Authenticated>
    );
}
