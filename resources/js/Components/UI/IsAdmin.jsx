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
        <div className="p-6 mt-10 bg-gray-100 shadow-md rounded-xl">
            <Typography
                as={"h2"}
                variant={"h2"}
                color={"black"}
                className="mb-4"
            >
                Panel de Administración
            </Typography>
            <Typography as={"p"} variant={"p"} color={"black"} className="mb-6">
                Tienes privilegios de administrador. Puedes gestionar usuarios,
                ver reportes y realizar otras tareas administrativas.
            </Typography>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Link
                    href="/admin"
                    className="p-4 text-center text-white transition-all duration-300 ease-in-out bg-black rounded-lg hover:bg-blue-700"
                >
                    Ir al Panel de Administración
                </Link>
            </div>
            <div className="p-5 mt-10 bg-white rounded-lg shadow-md w-72 md:flex-col">
                <Typography
                    as="h2"
                    variant="h2"
                    color="black"
                    className="mb-3 text-xl font-semibold"
                >
                    Escanear QR
                </Typography>
                <QRScanner onScanSuccess={handleScanSuccess} />
            </div>
        </div>
    );
}
