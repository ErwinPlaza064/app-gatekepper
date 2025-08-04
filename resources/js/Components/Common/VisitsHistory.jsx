import React, { useState } from "react";
import Typography from "@/Components/UI/Typography";
import {
    FaSearch,
    FaCalendarAlt,
    FaHistory,
    FaUser,
    FaIdCard,
    FaCar,
} from "react-icons/fa";

export default function VisitsHistory({ visits }) {
    const [search, setSearch] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [filters, setFilters] = useState({
        search: "",
        dateFrom: "",
        dateTo: "",
    });

    const filteredVisits = (visits || []).filter((visit) => {
        const name = (visit.visitor_name || visit.name || "").toLowerCase();
        const created = visit.created_at ? new Date(visit.created_at) : null;
        const matchesName = name.includes(filters.search.toLowerCase());
        const matchesFrom = filters.dateFrom
            ? created >= new Date(filters.dateFrom)
            : true;
        const matchesTo = filters.dateTo
            ? created <= new Date(filters.dateTo)
            : true;
        return matchesName && matchesFrom && matchesTo;
    });

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters({ search, dateFrom, dateTo });
    };

    return (
        <div className="relative overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30">
            {/* Header con gradiente negro */}
            <div className="relative px-8 py-6 bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl">
                        <FaHistory className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <Typography
                            as="h4"
                            variant="h4"
                            className="text-2xl font-bold text-white drop-shadow-lg"
                        >
                            Historial de Visitas
                        </Typography>
                        <p className="text-sm text-white/80 mt-1">
                            Registro completo de visitantes
                        </p>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            </div>

            {/* Formulario de búsqueda mejorado */}
            <div className="p-8 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm">
                <form
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                    onSubmit={handleSearch}
                >
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FaSearch className="h-4 w-4 text-gray-400 group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-transparent transition-all duration-300 hover:bg-white dark:hover:bg-gray-800"
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FaCalendarAlt className="h-4 w-4 text-gray-400 group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition-colors" />
                        </div>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-transparent transition-all duration-300 hover:bg-white dark:hover:bg-gray-800"
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FaCalendarAlt className="h-4 w-4 text-gray-400 group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition-colors" />
                        </div>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-transparent transition-all duration-300 hover:bg-white dark:hover:bg-gray-800"
                        />
                    </div>

                    <button
                        type="submit"
                        className="group flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-black via-gray-900 to-black text-white font-semibold rounded-2xl shadow-xl border border-white/10 hover:from-gray-900 hover:via-black hover:to-gray-900 hover:shadow-2xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300 backdrop-blur-sm"
                    >
                        <FaSearch className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                        <span className="drop-shadow-sm">Buscar</span>
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </button>
                </form>
            </div>
            {/* Contenido de la tabla */}
            <div className="p-8">
                {filteredVisits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-3xl">
                            <FaHistory className="w-8 h-8 text-gray-400" />
                        </div>
                        <Typography
                            as="p"
                            variant="p"
                            className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2"
                        >
                            Sin registros de visitas
                        </Typography>
                        <Typography
                            as="p"
                            variant="p"
                            className="text-sm text-gray-500 dark:text-gray-500"
                        >
                            Los registros de visitantes aparecerán aquí cuando
                            se registren
                        </Typography>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-3xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gradient-to-r from-gray-900/90 via-black to-gray-900/90 backdrop-blur-sm">
                                    <tr>
                                        <th className="px-6 py-4 text-left">
                                            <div className="flex items-center gap-2 text-xs font-bold text-white/90 uppercase tracking-wider">
                                                <FaUser className="w-3 h-3" />
                                                <span className="drop-shadow-sm">
                                                    Nombre
                                                </span>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <div className="flex items-center gap-2 text-xs font-bold text-white/90 uppercase tracking-wider">
                                                <FaIdCard className="w-3 h-3" />
                                                <span className="drop-shadow-sm">
                                                    Documento
                                                </span>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <div className="flex items-center gap-2 text-xs font-bold text-white/90 uppercase tracking-wider">
                                                <FaCalendarAlt className="w-3 h-3" />
                                                <span className="drop-shadow-sm">
                                                    Fecha
                                                </span>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <div className="flex items-center gap-2 text-xs font-bold text-white/90 uppercase tracking-wider">
                                                <FaCar className="w-3 h-3" />
                                                <span className="drop-shadow-sm">
                                                    Placa
                                                </span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm divide-y divide-gray-200/50 dark:divide-gray-700/50">
                                    {filteredVisits.map((visit, idx) => (
                                        <tr
                                            key={visit.id || visit.qr_id || idx}
                                            className="group hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 hover:shadow-lg"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex-shrink-0">
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
                                                    <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-black dark:group-hover:text-white transition-colors">
                                                        {visit.visitor_name ||
                                                            visit.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-gray-700 dark:text-gray-300 font-medium">
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
                                                    className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium ${
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
                )}
            </div>
        </div>
    );
}
