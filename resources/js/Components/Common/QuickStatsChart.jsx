import React from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function QuickStatsChart({ stats }) {
    const safeStats = stats || {};
    const data = {
        labels: ["Mis visitas", "Mis quejas", "Mis QRs generados"],
        datasets: [
            {
                label: "Cantidad",
                data: [
                    safeStats.visitas || 0,
                    safeStats.quejas || 0,
                    safeStats.qrs || 0,
                ],
                backgroundColor: ["#3b82f6", "#ef4444", "#10b981"],
                borderRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: "Resumen rápido" },
        },
        scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } },
        },
    };

    return (
        <div className="p-4 bg-white rounded shadow">
            <Bar data={data} options={options} />
        </div>
    );
}
