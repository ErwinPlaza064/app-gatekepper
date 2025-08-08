import Typography from "@/Components/UI/Typography";
import ThemeCleaner from "@/Components/Common/ThemeCleaner";

export default function Guest({ children }) {
    return (
        <div className="flex flex-col items-center min-h-screen px-2 pt-6 bg-gray-100 sm:justify-center sm:pt-0 sm:px-0">
            <ThemeCleaner />

            <div className="w-full px-0 py-4 mt-6 overflow-hidden shadow-md sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
