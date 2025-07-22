import React from "react";
import { FaUser, FaEye, FaExclamationCircle, FaQrcode } from "react-icons/fa";

const icons = [
    <FaEye className="w-6 h-6" />,
    <FaExclamationCircle className="w-6 h-6" />,
    <FaUser className="w-6 h-6" />,
    <FaQrcode className="w-6 h-6" />,
];

const colors = [
    "bg-indigo-100 text-indigo-700 border-indigo-300",
    "bg-red-100 text-red-700 border-red-300",
    "bg-green-100 text-green-700 border-green-300",
    "bg-yellow-100 text-yellow-700 border-yellow-300",
];

export default function StatsCard({ stats = {} }) {
    // stats: { visitas, quejas, qrs }
    const items = [
        {
            label: "Mis visitas",
            value: stats.visitas || 0,
            icon: icons[0],
            color: colors[0],
        },
        {
            label: "Mis quejas",
            value: stats.quejas || 0,
            icon: icons[1],
            color: colors[1],
        },
        {
            label: "Mis QRs generados",
            value: stats.qrs || 0,
            icon: icons[3],
            color: colors[3],
        },
    ];
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto w-full">
            {items.map((item, idx) => (
                <div
                    key={item.label}
                    className={`border rounded-xl shadow p-6 flex flex-col items-center ${item.color} transition-transform hover:scale-105`}
                >
                    <div className="mb-2">{item.icon}</div>
                    <span className="text-3xl font-bold">{item.value}</span>
                    <span className="mt-2 text-base font-semibold">
                        {item.label}
                    </span>
                </div>
            ))}
        </div>
    );
}
