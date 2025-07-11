import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import Typography from "@/Components/UI/Typography";
import { toast } from "react-hot-toast";

export default function QRDashboard({ userId }) {
    const [qrCodes, setQrCodes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQrCodes();
    }, []);

    const fetchQrCodes = async () => {
        try {
            const response = await fetch("/api/user/qr-codes", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN":
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content") || "",
                },
                credentials: "same-origin",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setQrCodes(data);
        } catch (error) {
            console.error("Error fetching QR codes:", error);
            toast.error("Error al cargar los códigos QR");
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivate = async (qrId) => {
        try {
            const response = await fetch(`/api/qr-codes/${qrId}/deactivate`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN":
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content") || "",
                },
                credentials: "same-origin",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error al desactivar QR");
            }

            toast.success("QR desactivado correctamente");
            fetchQrCodes();
        } catch (error) {
            toast.error(error.message || "Error al desactivar QR");
        }
    };

    const handleReactivate = async (qrId) => {
        try {
            const response = await fetch(`/api/qr-codes/${qrId}/reactivate`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN":
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content") || "",
                },
                credentials: "same-origin",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error al reactivar QR");
            }

            toast.success("QR reactivado correctamente");
            fetchQrCodes();
        } catch (error) {
            toast.error(error.message || "Error al reactivar QR");
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            active: "bg-green-100 text-green-800",
            expired: "bg-red-100 text-red-800",
            exhausted: "bg-orange-100 text-orange-800",
            inactive: "bg-gray-100 text-gray-800",
        };

        const labels = {
            active: "Activo",
            expired: "Expirado",
            exhausted: "Agotado",
            inactive: "Inactivo",
        };

        return (
            <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}
            >
                {labels[status]}
            </span>
        );
    };

    const getTypeLabel = (type) => {
        const labels = {
            single_use: "Uso único",
            time_limited: "Tiempo limitado",
            recurring: "Recurrente",
        };
        return labels[type] || type;
    };

    if (loading) {
        return (
            <div className="p-5 bg-white rounded-lg shadow-md">
                <div className="animate-pulse">
                    <div className="h-4 mb-4 bg-gray-200 rounded"></div>
                    <div className="space-y-3">
                        <div className="h-16 bg-gray-200 rounded"></div>
                        <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-5 bg-white rounded-lg shadow-md">
            <Typography
                as={"h4"}
                variant={"h4"}
                color={"black"}
                className="mb-4 text-lg font-semibold"
            >
                Mis Códigos QR
            </Typography>

            {qrCodes.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                    <p>No has generado ningún código QR aún</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {qrCodes.map((qr) => (
                        <div
                            key={qr.id}
                            className="p-4 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h5 className="font-medium text-gray-900">
                                        {qr.visitor_name}
                                    </h5>
                                    <p className="text-sm text-gray-600">
                                        Doc: {qr.document_id} | Placa:{" "}
                                        {qr.vehicle_plate || "N/A"}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {getStatusBadge(qr.status)}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-3 text-sm md:grid-cols-4">
                                <div>
                                    <span className="text-gray-500">Tipo:</span>
                                    <p className="font-medium">
                                        {getTypeLabel(qr.qr_type)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Usos:</span>
                                    <p className="font-medium">
                                        {qr.current_uses}/{qr.max_uses}
                                    </p>
                                </div>
                                {qr.valid_until && (
                                    <div>
                                        <span className="text-gray-500">
                                            Expira:
                                        </span>
                                        <p className="font-medium">
                                            {new Date(
                                                qr.valid_until
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                                {qr.time_remaining && (
                                    <div>
                                        <span className="text-gray-500">
                                            Tiempo restante:
                                        </span>
                                        <p className="font-medium text-blue-600">
                                            {qr.time_remaining.human}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <span className="text-xs text-gray-500">
                                    Creado:{" "}
                                    {new Date(
                                        qr.created_at
                                    ).toLocaleDateString()}
                                </span>
                                <div className="space-x-2">
                                    {qr.status === "active" ? (
                                        <button
                                            onClick={() =>
                                                handleDeactivate(qr.qr_id)
                                            }
                                            className="px-3 py-1 text-xs font-medium text-red-600 transition-colors rounded bg-red-50 hover:bg-red-100"
                                        >
                                            Desactivar
                                        </button>
                                    ) : qr.status === "inactive" &&
                                      qr.current_uses < qr.max_uses &&
                                      (!qr.valid_until ||
                                          new Date() <
                                              new Date(qr.valid_until)) ? (
                                        <button
                                            onClick={() =>
                                                handleReactivate(qr.qr_id)
                                            }
                                            className="px-3 py-1 text-xs font-medium text-green-600 transition-colors rounded bg-green-50 hover:bg-green-100"
                                        >
                                            Reactivar
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
