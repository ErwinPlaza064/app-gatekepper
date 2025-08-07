import React, { memo, lazy, Suspense } from "react";
import { useDashboardTheme } from "@/Contexts/DashboardThemeContext";

// Simplificar el lazy loading para evitar problemas en producción
const LazyBarChart = lazy(() =>
    Promise.all([import("react-chartjs-2"), import("chart.js")]).then(
        ([chartModule, chartJsModule]) => {
            const {
                Chart,
                CategoryScale,
                LinearScale,
                BarElement,
                Title,
                Tooltip,
                Legend,
            } = chartJsModule;
            Chart.register(
                CategoryScale,
                LinearScale,
                BarElement,
                Title,
                Tooltip,
                Legend
            );
            return { default: chartModule.Bar };
        }
    )
);

// Componente simple de fallback
const ChartSkeleton = () => (
    <div className="animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
        <div className="space-y-3">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
    </div>
);

const QuickStatsChart = memo(({ stats }) => {
    const { isDarkMode } = useDashboardTheme();
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
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: "Resumen rápido",
                color: isDarkMode ? "#e5e7eb" : "#374151",
                font: { size: 16, weight: "bold" },
            },
        },
        scales: {
            x: {
                ticks: { color: isDarkMode ? "#9ca3af" : "#6b7280" },
                grid: { color: isDarkMode ? "#374151" : "#e5e7eb" },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    color: isDarkMode ? "#9ca3af" : "#6b7280",
                },
                grid: { color: isDarkMode ? "#374151" : "#e5e7eb" },
            },
        },
    };

    return (
        <div className="dashboard-card p-6">
            <Suspense fallback={<ChartSkeleton />}>
                <div style={{ height: "200px" }}>
                    <LazyBarChart data={data} options={options} />
                </div>
            </Suspense>
        </div>
    );
});

QuickStatsChart.displayName = "QuickStatsChart";

export default QuickStatsChart;
