import React from "react";
import { Link } from "@inertiajs/react";
import QRScanner from "@/Components/Common/QRScanner";
import Typography from "@/Components/UI/Typography";

export default function IsAdmin() {
    const handleScanSuccess = (data) => {
        try {
            const parsedData = JSON.parse(data);
            axios
                .post(route("visitors.store"), parsedData)
                .then(() => alert("Visitante registrado correctamente"))
                .catch(() => alert("Error al registrar visitante"));
        } catch (error) {}
    };

    return (
        <div className="min-h-screen p-6 ">
            <div className="max-w-6xl mx-auto">
                {/* Header con badge de admin */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center px-4 py-2 mb-4 text-sm font-medium rounded-full bg-emerald-100 text-emerald-800">
                        <svg
                            className="w-4 h-4 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Acceso de Administrador Verificado
                    </div>
                    <Typography
                        as="h1"
                        variant="h1"
                        color="black"
                        className="mb-2 text-4xl font-bold text-gray-900"
                    >
                        Panel de Control Administrativo
                    </Typography>
                    <Typography
                        as="p"
                        variant="p"
                        color="gray"
                        className="max-w-2xl mx-auto text-lg text-gray-600"
                    >
                        Bienvenido al centro de control. Gestiona usuarios,
                        supervisa actividades y administra el sistema desde esta
                        consola centralizada.
                    </Typography>
                </div>
                <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
                    <Link
                        href="/admin"
                        className="p-6 transition-all duration-300 bg-white border border-gray-200 shadow-lg group rounded-xl hover:shadow-xl"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <svg
                                    className="w-6 h-6 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0v-4a2 2 0 012-2h2a2 2 0 012 2v4"
                                    />
                                </svg>
                            </div>
                            <svg
                                className="w-5 h-5 text-gray-400 transition-colors group-hover:text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">
                            Panel Principal
                        </h3>
                        <p className="text-sm text-gray-600">
                            Accede al dashboard completo de administración
                        </p>
                    </Link>

                    <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <svg
                                    className="w-6 h-6 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">
                            Gestión de Usuarios
                        </h3>
                        <p className="text-sm text-gray-600">
                            Administra permisos y roles de usuarios
                        </p>
                    </div>

                    <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <svg
                                    className="w-6 h-6 text-purple-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                </svg>
                            </div>
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">
                            Reportes
                        </h3>
                        <p className="text-sm text-gray-600">
                            Visualiza estadísticas y métricas del sistema
                        </p>
                    </div>
                </div>

                <div className="p-3 border border-gray-200 shadow-lg rounded-xl">
                    <div className="flex items-center mb-6">
                        <div className="p-3 mr-4 bg-orange-100 rounded-lg">
                            <svg
                                className="w-6 h-6 text-orange-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                                />
                            </svg>
                        </div>
                        <div>
                            <Typography
                                as="h3"
                                variant="h3"
                                color="black"
                                className="text-xl font-semibold text-gray-900"
                            >
                                Escáner de Visitantes
                            </Typography>
                            <Typography
                                as="p"
                                variant="p"
                                color="gray"
                                className="text-gray-600"
                            >
                                Registra visitantes escaneando códigos QR
                            </Typography>
                        </div>
                    </div>

                    <div className="max-w-md mx-auto">
                        <div className="max-w-sm p-4 rounded-lg bg-gray-50">
                            <QRScanner onScanSuccess={handleScanSuccess} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
