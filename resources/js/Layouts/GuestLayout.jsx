import Typography from "@/Components/UI/Typography";

export default function Guest({ children }) {
    return (
        <div className="flex flex-col items-center min-h-screen px-4 pt-6 bg-gray-100 sm:justify-center sm:pt-0 sm:px-0">
            <div>
                <Typography as={"h2"} variant={"h2"} color={"black"}>
                    Registrador De Visitantes
                </Typography>
            </div>

            <div className="w-full px-6 py-4 mt-6 overflow-hidden bg-white shadow-md sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
