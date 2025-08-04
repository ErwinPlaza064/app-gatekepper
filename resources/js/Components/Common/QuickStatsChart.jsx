import React from "react";
import { Bar } from "react-chartjs-2";
import { useTheme } from "@/Contexts/ThemeContext";
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
    const { isDarkMode } = useTheme();
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
                backgroundColor: isDarkMode
                    ? ["#60a5fa", "#f87171", "#34d399"]
                    : ["#3b82f6", "#ef4444", "#10b981"],
                borderRadius: 6,
                borderWidth: isDarkMode ? 1 : 0,
                borderColor: isDarkMode
                    ? ["#3b82f6", "#dc2626", "#059669"]
                    : "transparent",
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: "Resumen rápido",
                color: isDarkMode ? "#e5e7eb" : "#374151",
                font: {
                    size: 16,
                    weight: "bold",
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    color: isDarkMode ? "#9ca3af" : "#6b7280",
                },
                grid: {
                    color: isDarkMode ? "#374151" : "#e5e7eb",
                },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    color: isDarkMode ? "#9ca3af" : "#6b7280",
                },
                grid: {
                    color: isDarkMode ? "#374151" : "#e5e7eb",
                },
            },
        },
    };

    return (
        <div className="dashboard-card p-6">
            <Bar data={data} options={options} />
        </div>
    );
}
