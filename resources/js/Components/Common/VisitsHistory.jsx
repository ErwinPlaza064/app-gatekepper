import React, { useState, useEffect } from "react";
import Typography from "@/Components/UI/Typography";
import {
    FaSearch,
    FaCalendarAlt,
    FaHistory,
    FaUser,
    FaIdCard,
    FaCar,
    FaTimes,
    FaFilter,
    FaSync,
} from "react-icons/fa";

export default function VisitsHistory({ visits, onRefresh }) {
    const [globalSearch, setGlobalSearch] = useState("");
    const [vehicleFilter, setVehicleFilter] = useState("all"); // all, with, without
    const [dateRange, setDateRange] = useState("all"); // all, today, week, month, custom
    const [customDateFrom, setCustomDateFrom] = useState("");
    const [customDateTo, setCustomDateTo] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Función para manejar el refresh
    const handleRefresh = async () => {
        if (onRefresh) {
            setIsRefreshing(true);
            try {
                await onRefresh();
            } finally {
                // Simular un pequeño delay para mostrar la animación
                setTimeout(() => {
                    setIsRefreshing(false);
                }, 500);
            }
        }
    };

    // Función para obtener el rango de fechas basado en la selección
    const getDateRange = () => {
        const now = new Date();
        const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );

        switch (dateRange) {
            case "today":
                return {
                    from: today,
                    to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
                };
            case "week":
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                weekEnd.setHours(23, 59, 59, 999);
                return { from: weekStart, to: weekEnd };
            case "month":
                const monthStart = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    1
                );
                const monthEnd = new Date(
                    today.getFullYear(),
                    today.getMonth() + 1,
                    0
                );
                monthEnd.setHours(23, 59, 59, 999);
                return { from: monthStart, to: monthEnd };
            case "custom":
                return {
                    from: customDateFrom ? new Date(customDateFrom) : null,
                    to: customDateTo ? new Date(customDateTo) : null,
                };
            default:
                return { from: null, to: null };
        }
    };

    // Filtrado en tiempo real
    const filteredVisits = (visits || []).filter((visit) => {
        // Búsqueda global en nombre, documento y placa
        const searchTerm = globalSearch.toLowerCase();
        const name = (visit.visitor_name || visit.name || "").toLowerCase();
        const document = (
            visit.document_id ||
            visit.id_document ||
            ""
        ).toLowerCase();
        const plate = (visit.vehicle_plate || "").toLowerCase();

        const matchesSearch =
            !searchTerm ||
            name.includes(searchTerm) ||
            document.includes(searchTerm) ||
            plate.includes(searchTerm);

        // Filtro de vehículo
        const hasVehicle =
            visit.vehicle_plate && visit.vehicle_plate.trim() !== "";
        const matchesVehicle =
            vehicleFilter === "all" ||
            (vehicleFilter === "with" && hasVehicle) ||
            (vehicleFilter === "without" && !hasVehicle);

        // Filtro de fecha
        const visitDate = visit.created_at ? new Date(visit.created_at) : null;
        const { from, to } = getDateRange();
        const matchesDate =
            !from ||
            !to ||
            !visitDate ||
            (visitDate >= from && visitDate <= to);

        return matchesSearch && matchesVehicle && matchesDate;
    });

    // Detectar cuando se selecciona "custom" para mostrar los date pickers
    useEffect(() => {
        setShowDatePicker(dateRange === "custom");
    }, [dateRange]);

    return (
        <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-xl dark:bg-gray-900 dark:border-gray-700">
            <div className="px-4 py-4 border-b border-gray-200 sm:px-6 sm:py-5 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-black rounded-full sm:w-12 sm:h-12">
                        <FaHistory className="w-5 h-5 text-white sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex-1">
                        <Typography
                            as="h4"
                            variant="h4"
                            className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-white"
                        >
                            Historial de Visitas
                        </Typography>
                        <p className="text-xs text-gray-600 sm:text-sm dark:text-gray-400">
                            Registro completo de visitantes
                        </p>
                    </div>
                    {/* Botón de refrescar */}
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-200 ${
                            isRefreshing
                                ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                                : "bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-600"
                        }`}
                        title="Refrescar datos"
                    >
                        <FaSync
                            className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400 transition-transform duration-500 ${
                                isRefreshing
                                    ? "animate-spin"
                                    : "hover:rotate-180"
                            }`}
                        />
                    </button>
                </div>
            </div>

            <div className="p-3 sm:p-6 bg-gray-50 dark:bg-gray-800/50">
                {/* Barra de búsqueda principal */}
                <div className="mb-4 sm:mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none sm:pl-4">
                            <FaSearch className="w-4 h-4 text-gray-400 sm:w-5 sm:h-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar visitante..."
                            value={globalSearch}
                            onChange={(e) => setGlobalSearch(e.target.value)}
                            className="w-full py-3 pl-10 pr-10 text-base text-gray-900 placeholder-gray-500 transition-colors duration-200 bg-white border-2 border-gray-200 rounded-lg shadow-sm sm:py-4 sm:pl-12 sm:pr-4 sm:text-lg dark:text-gray-100 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:placeholder-gray-400"
                        />
                        {globalSearch && (
                            <button
                                onClick={() => setGlobalSearch("")}
                                className="absolute inset-y-0 right-0 flex items-center justify-end pr-3 text-gray-400 bg-transparent sm:pr-4 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <FaTimes className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Filtros rápidos */}
                <div className="space-y-4">
                    {/* Filtro de fecha */}
                    <div>
                        <label className="flex items-center justify-center gap-2 mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <FaCalendarAlt className="w-4 h-4" />
                            Período
                        </label>
                        <div className="flex flex-wrap justify-center gap-2 mb-4">
                            {[
                                { key: "all", label: "Todos" },
                                { key: "today", label: "Hoy" },
                                { key: "week", label: "Semana" },
                                { key: "month", label: "Mes" },
                                { key: "custom", label: "Personalizado" },
                            ].map((option) => (
                                <button
                                    key={option.key}
                                    onClick={() => setDateRange(option.key)}
                                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-colors duration-200 ${
                                        dateRange === option.key
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        {showDatePicker && (
                            <div className="p-3 bg-white border border-gray-200 rounded-lg sm:p-4 dark:bg-gray-800 dark:border-gray-700">
                                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Fecha desde
                                        </label>
                                        <input
                                            type="date"
                                            value={customDateFrom}
                                            onChange={(e) =>
                                                setCustomDateFrom(
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-3 py-2 text-sm text-gray-900 transition-colors duration-200 bg-white border border-gray-200 rounded-lg sm:text-base dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Fecha hasta
                                        </label>
                                        <input
                                            type="date"
                                            value={customDateTo}
                                            onChange={(e) =>
                                                setCustomDateTo(e.target.value)
                                            }
                                            className="w-full px-3 py-2 text-sm text-gray-900 transition-colors duration-200 bg-white border border-gray-200 rounded-lg sm:text-base dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-start justify-between gap-3 p-3 bg-white border border-gray-200 rounded-lg sm:flex-row sm:items-center sm:p-4 dark:bg-gray-800 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {filteredVisits.length} de {visits?.length || 0}{" "}
                            registros encontrados
                        </span>
                        {(globalSearch ||
                            vehicleFilter !== "all" ||
                            dateRange !== "all") && (
                            <button
                                onClick={() => {
                                    setGlobalSearch("");
                                    setVehicleFilter("all");
                                    setDateRange("all");
                                    setCustomDateFrom("");
                                    setCustomDateTo("");
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                            >
                                <FaTimes className="w-3 h-3" />
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className="p-3 sm:p-6">
                {filteredVisits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center sm:py-12">
                        <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full sm:w-16 sm:h-16 sm:mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                            <FaHistory className="w-6 h-6 text-gray-400 sm:w-8 sm:h-8" />
                        </div>
                        <Typography
                            as="p"
                            variant="p"
                            className="mb-2 text-base font-medium text-gray-600 sm:text-lg dark:text-gray-400"
                        >
                            Sin registros de visitas
                        </Typography>
                        <Typography
                            as="p"
                            variant="p"
                            className="px-4 text-sm text-gray-500 dark:text-gray-500"
                        >
                            Los registros de visitantes aparecerán aquí cuando
                            se registren
                        </Typography>
                    </div>
                ) : (
                    <div>
                        {/* Vista de tabla para pantallas grandes */}
                        <div className="hidden overflow-hidden border border-gray-200 rounded-lg lg:block dark:border-gray-700">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-6 py-4 text-left">
                                                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                                                    <FaUser className="w-3 h-3" />
                                                    <span>Nombre</span>
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 text-left">
                                                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                                                    <FaIdCard className="w-3 h-3" />
                                                    <span>Documento</span>
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 text-left">
                                                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                                                    <FaCalendarAlt className="w-3 h-3" />
                                                    <span>Fecha</span>
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 text-left">
                                                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                                                    <FaCar className="w-3 h-3" />
                                                    <span>Placa</span>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                                        {filteredVisits.map((visit, idx) => (
                                            <tr
                                                key={
                                                    visit.id ||
                                                    visit.qr_id ||
                                                    idx
                                                }
                                                className="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800">
                                                            <span className="text-xs font-bold text-white">
                                                                {(
                                                                    visit.visitor_name ||
                                                                    visit.name ||
                                                                    "?"
                                                                )
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                            {visit.visitor_name ||
                                                                visit.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                                        {visit.document_id ||
                                                            visit.id_document}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-gray-700 dark:text-gray-300">
                                                        {visit.created_at
                                                            ? new Date(
                                                                  visit.created_at
                                                              ).toLocaleString(
                                                                  "es-ES",
                                                                  {
                                                                      day: "2-digit",
                                                                      month: "2-digit",
                                                                      year: "2-digit",
                                                                      hour: "2-digit",
                                                                      minute: "2-digit",
                                                                  }
                                                              )
                                                            : "-"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${
                                                            visit.vehicle_plate
                                                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                                        }`}
                                                    >
                                                        {visit.vehicle_plate ||
                                                            "Sin vehículo"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Vista de tarjetas para pantallas pequeñas */}
                        <div className="block lg:hidden">
                            <div className="max-w-2xl mx-auto space-y-4">
                                {filteredVisits.map((visit, idx) => (
                                    <div
                                        key={visit.id || visit.qr_id || idx}
                                        className="p-4 mx-auto bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700"
                                    >
                                        <div className="flex flex-col items-center mb-4 text-center">
                                            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mb-3 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800">
                                                <span className="text-sm font-bold text-white">
                                                    {(
                                                        visit.visitor_name ||
                                                        visit.name ||
                                                        "?"
                                                    )
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                            </div>
                                            <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {visit.visitor_name ||
                                                    visit.name}
                                            </h3>
                                            <p className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                                <FaIdCard className="w-3 h-3" />
                                                {visit.document_id ||
                                                    visit.id_document}
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                                <span className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    <FaCalendarAlt className="w-4 h-4" />
                                                    Fecha
                                                </span>
                                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    {visit.created_at
                                                        ? new Date(
                                                              visit.created_at
                                                          ).toLocaleString(
                                                              "es-ES",
                                                              {
                                                                  day: "2-digit",
                                                                  month: "2-digit",
                                                                  year: "2-digit",
                                                                  hour: "2-digit",
                                                                  minute: "2-digit",
                                                              }
                                                          )
                                                        : "-"}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                                <span className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    <FaCar className="w-4 h-4" />
                                                    Vehículo
                                                </span>
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                        visit.vehicle_plate
                                                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                                                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                                    }`}
                                                >
                                                    {visit.vehicle_plate ||
                                                        "Sin vehículo"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
