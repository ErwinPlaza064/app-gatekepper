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

export default function StatsCard({ stats = [] }) {
    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat, idx) => (
                <div
                    key={stat.label}
                    className={`border rounded-xl shadow p-4 flex flex-col items-center ${
                        colors[idx % colors.length]
                    }`}
                >
                    <div className="mb-2">{icons[idx % icons.length]}</div>
                    <span className="text-2xl font-bold">{stat.value}</span>
                    <span className="mt-2 text-sm font-semibold">
                        {stat.label}
                    </span>
                </div>
            ))}
        </div>
    );
}
