import React, { useState } from "react";
import Typography from "@/Components/UI/Typography";

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
        <div className="p-6 bg-white rounded-lg shadow">
            <Typography
                as="h4"
                variant="h4"
                color="black"
                className="mb-4 text-lg font-semibold text-center"
            >
                Historial de Visitas
            </Typography>
            <form
                className="flex flex-col items-center justify-center gap-4 mb-6 md:flex-row"
                onSubmit={handleSearch}
            >
                <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-3 py-2 border rounded md:w-1/3"
                />
                <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border rounded md:w-1/4"
                />
                <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border rounded md:w-1/4"
                />
                <button
                    type="submit"
                    className="px-4 py-2 font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                    Buscar
                </button>
            </form>
            {filteredVisits.length === 0 ? (
                <Typography
                    as="p"
                    variant="p"
                    color="gray"
                    className="text-center"
                >
                    No hay visitas registradas.
                </Typography>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase">
                                    Nombre
                                </th>
                                <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase">
                                    Documento
                                </th>
                                <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase">
                                    Fecha
                                </th>
                                <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase">
                                    Placa
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredVisits.map((visit, idx) => (
                                <tr key={visit.id || visit.qr_id || idx}>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        {visit.visitor_name || visit.name}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        {visit.document_id || visit.id_document}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        {visit.created_at
                                            ? new Date(
                                                  visit.created_at
                                              ).toLocaleString()
                                            : "-"}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        {visit.vehicle_plate || "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
