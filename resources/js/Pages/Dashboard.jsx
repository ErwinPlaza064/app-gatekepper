import Authenticated from "@/Layouts/AuthenticatedLayout";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard({ auth }) {
    const [notifications, setNotifications] = useState([]);

    // Obtener las notificaciones del usuario autenticado cuando se monta el componente
    useEffect(() => {
        axios
            .get("/api/notifications")
            .then((response) => {
                setNotifications(response.data);
            })
            .catch((error) => {
                console.error("Error al obtener las notificaciones:", error);
            });
    }, []);

    return (
        <Authenticated user={auth.user}>
            <div className="p-6">
                <h1 className="text-xl font-bold mb-4">Notificaciones</h1>
                <ul>
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <li key={notification.id} className="mb-2">
                                {notification.data.message}
                            </li>
                        ))
                    ) : (
                        <li>No hay notificaciones.</li>
                    )}
                </ul>
            </div>
        </Authenticated>
    );
}
