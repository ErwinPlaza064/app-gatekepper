import Typography from "@/Components/UI/Typography";

export default function VisitsCard({ visits }) {
    return (
        <div className="p-5 bg-white rounded-lg shadow-md">
            <Typography
                as={"h2"}
                variant={"h2"}
                color={"black"}
                className="mb-3 text-xl font-semibold"
            >
                Visitas Recientes
            </Typography>
            {visits.length > 0 ? (
                <ul className="space-y-3">
                    {visits.slice(0, 2).map((visit, index) => (
                        <li
                            key={index}
                            className="flex items-center justify-between"
                        >
                            <span>{visit.name}</span>
                            <span className="text-sm text-gray-600">
                                {new Date(visit.entry_time).toLocaleString()}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <Typography
                    as={"p"}
                    variant={"p"}
                    color={"p"}
                    className="text-gray-500"
                >
                    No hay visitas recientes.
                </Typography>
            )}
        </div>
    );
}
