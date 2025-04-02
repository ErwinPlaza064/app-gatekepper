import Typography from "@/Components/UI/Typography";
import axios from "axios";
import { useState } from "react";
import { usePage } from "@inertiajs/react";

export default function NotificationCard() {
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
                        {notifications.slice(0, 2).map((notification) => (
                            <li
                                key={notification.id}
                                className="pb-2 text-gray-700 border-b"
                            >
                                {notification.data.message} <br />
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
                        className="px-3 py-1 mt-3 text-sm text-white transition-all duration-300 ease-in-out bg-black rounded hover:bg-blue-700"
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
    );
}
