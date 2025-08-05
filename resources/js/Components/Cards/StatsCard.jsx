import React, { memo, lazy, Suspense } from "react";

// Lazy load icons solo cuando sean necesarios
const FaEye = lazy(() =>
    import("react-icons/fa").then((module) => ({ default: module.FaEye }))
);
const FaExclamationCircle = lazy(() =>
    import("react-icons/fa").then((module) => ({
        default: module.FaExclamationCircle,
    }))
);
const FaQrcode = lazy(() =>
    import("react-icons/fa").then((module) => ({ default: module.FaQrcode }))
);

// Componente de icono simple como fallback
const IconSkeleton = () => (
    <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
);

const colors = [
    "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700",
    "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700",
    "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700",
];

const StatsCard = memo(({ stats = {} }) => {
    const items = [
        {
            label: "Mis visitas",
            value: stats.visitas || 0,
            icon: FaEye,
            color: colors[0],
        },
        {
            label: "Mis quejas",
            value: stats.quejas || 0,
            icon: FaExclamationCircle,
            color: colors[1],
        },
        {
            label: "Mis QRs generados",
            value: stats.qrs || 0,
            icon: FaQrcode,
            color: colors[2],
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto w-full">
            {items.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                    <div
                        key={item.label}
                        className={`dashboard-card p-6 flex flex-col items-center transition-transform hover:scale-105 ${item.color}`}
                    >
                        <div className="mb-2">
                            <Suspense fallback={<IconSkeleton />}>
                                <IconComponent className="w-6 h-6" />
                            </Suspense>
                        </div>
                        <span className="text-3xl font-bold tabular-nums">
                            {item.value}
                        </span>
                        <span className="mt-2 text-base font-semibold text-center">
                            {item.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
});

StatsCard.displayName = "StatsCard";

export default StatsCard;
