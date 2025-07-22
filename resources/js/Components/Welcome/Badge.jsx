import { CheckCircle } from "lucide-react";

export default function Badge() {
    return (
        <div className="inline-flex items-center px-4 py-2 mb-4 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
            <CheckCircle className="w-4 h-4 mr-2" />
            Sistema de última generación
        </div>
    );
}
