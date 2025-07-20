import React from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from "chart.js";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function VisitsChart({ data = { labels: [], values: [] } }) {
    const chartData = {
        labels: data.labels,
        datasets: [
            {
                label: "Visitas por día",
                data: data.values,
                backgroundColor: "#6366f1",
                borderColor: "#312e81",
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
        },
        scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true },
        },
    };

    return (
        <div className="p-4 bg-white border-2 border-black shadow rounded-xl">
            <h3 className="mb-2 text-lg font-semibold text-black">
                Visitas por día
            </h3>
            <Bar data={chartData} options={options} />
        </div>
    );
}
