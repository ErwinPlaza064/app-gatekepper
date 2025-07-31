import { Clock, Shield, Users, ChevronRight } from "lucide-react";
import { Link } from "@inertiajs/react";

export default function Hero() {
    return (
        <div className="flex-1 text-center lg:pr-12 lg:text-left">
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-6xl">
                        REGISTRO DE
                        <span className="block text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                            VISITANTES
                        </span>
                    </h1>
                </div>
                <p className="max-w-2xl mx-auto text-xl leading-relaxed text-gray-700 lg:mx-0">
                    Revoluciona la seguridad de tu residencia con nuestro
                    sistema inteligente de registro.
                    <span className="font-semibold text-blue-600">
                        {" "}
                        Rápido, seguro y confiable.
                    </span>
                </p>
                <div className="flex flex-wrap justify-center gap-6 lg:justify-start">
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                            <Clock className="w-5 h-5 text-black" />
                        </div>
                        <span className="font-medium text-gray-700">
                            Registro instantáneo
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                            <Shield className="w-5 h-5 text-black" />
                        </div>
                        <span className="font-medium text-gray-700">
                            Máxima seguridad
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                            <Users className="w-5 h-5 text-black" />
                        </div>
                        <span className="font-medium text-black">
                            Control total
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                    <Link
                        href="/contacto"
                        className="inline-flex items-center px-8 py-4 font-semibold text-white transition-all duration-300 transform bg-black shadow-lg group rounded-xl hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:scale-105"
                    >
                        Contáctanos ahora
                        <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
