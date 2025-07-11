import { useState, useEffect } from "react";
import Typography from "@/Components/UI/Typography";
import { toast } from "react-hot-toast";

export default function VisitorHistory({ userId }) {
    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: "",
        dateFrom: "",
        dateTo: "",
    });

    useEffect(() => {
        fetchVisitors();
    }, []);

    const fetchVisitors = async () => {
        try {
            const params = new URLSearchParams(filters);
            const response = await fetch(`/api/user/visitors?${params}`, {
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
            setVisitors(data);
        } catch (error) {
            console.error("Error fetching visitors:", error);
            toast.error("Error al cargar el historial de visitantes");
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const applyFilters = () => {
        setLoading(true);
        fetchVisitors();
    };

    const clearFilters = () => {
        setFilters({
            search: "",
            dateFrom: "",
            dateTo: "",
        });
        setLoading(true);
        fetchVisitors();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusBadge = (visitor) => {
        if (visitor.exit_time) {
            return (
                <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                    Salió
                </span>
            );
        }
        return (
            <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                Dentro
            </span>
        );
    };

    if (loading) {
        return (
            <div className="p-5 bg-white rounded-lg shadow-md">
                <div className="animate-pulse">
                    <div className="h-4 mb-4 bg-gray-200 rounded"></div>
                    <div className="space-y-3">
                        <div className="h-16 bg-gray-200 rounded"></div>
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
                Historial de Visitantes
            </Typography>

            {/* Filtros */}
            <div className="p-4 mb-6 rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Buscar:
                        </label>
                        <input
                            type="text"
                            placeholder="Nombre o documento..."
                            value={filters.search}
                            onChange={(e) =>
                                handleFilterChange("search", e.target.value)
                            }
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Desde:
                        </label>
                        <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) =>
                                handleFilterChange("dateFrom", e.target.value)
                            }
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Hasta:
                        </label>
                        <input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) =>
                                handleFilterChange("dateTo", e.target.value)
                            }
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="flex items-end space-x-2">
                        <button
                            onClick={applyFilters}
                            className="px-4 py-2 text-white transition-colors bg-blue-600 rounded hover:bg-blue-700"
                        >
                            Filtrar
                        </button>
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-gray-600 transition-colors bg-gray-200 rounded hover:bg-gray-300"
                        >
                            Limpiar
                        </button>
                    </div>
                </div>
            </div>

            {visitors.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                    <p>No hay visitantes registrados</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {visitors.map((visitor) => (
                        <div
                            key={visitor.id}
                            className="p-4 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h5 className="font-medium text-gray-900">
                                        {visitor.name}
                                    </h5>
                                    <p className="text-sm text-gray-600">
                                        Doc: {visitor.id_document} | Placa:{" "}
                                        {visitor.vehicle_plate || "N/A"}
                                    </p>
                                    {visitor.qr_code && (
                                        <p className="text-xs text-blue-600">
                                            QR Code: {visitor.qr_code.qr_id}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    {getStatusBadge(visitor)}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                                <div>
                                    <span className="text-gray-500">
                                        Entrada:
                                    </span>
                                    <p className="font-medium">
                                        {formatDate(visitor.entry_time)}
                                    </p>
                                </div>
                                {visitor.exit_time && (
                                    <div>
                                        <span className="text-gray-500">
                                            Salida:
                                        </span>
                                        <p className="font-medium">
                                            {formatDate(visitor.exit_time)}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <span className="text-gray-500">
                                        Tipo de acceso:
                                    </span>
                                    <p className="font-medium">
                                        {visitor.qr_code ? "QR Code" : "Manual"}
                                    </p>
                                </div>
                                {visitor.qr_code && (
                                    <div>
                                        <span className="text-gray-500">
                                            Tipo QR:
                                        </span>
                                        <p className="font-medium">
                                            {visitor.qr_code.qr_type ===
                                                "single_use" && "Uso único"}
                                            {visitor.qr_code.qr_type ===
                                                "time_limited" &&
                                                "Tiempo limitado"}
                                            {visitor.qr_code.qr_type ===
                                                "recurring" && "Recurrente"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
