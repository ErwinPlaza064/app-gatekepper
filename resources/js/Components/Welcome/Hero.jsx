import Badge from "./Badge";
import { Clock, Shield, Users, ChevronRight } from "lucide-react";
import { Link } from "@inertiajs/react";

export default function Hero() {
    return (
        <div className="flex-1 text-center lg:pr-12 lg:text-left">
            <div className="space-y-8">
                <Badge />
                {/* Título principal */}
                <div>
                    <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-6xl">
                        REGISTRO DE
                        <span className="block text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                            VISITANTES
                        </span>
                    </h1>
                </div>
                {/* Descripción */}
                <p className="max-w-2xl mx-auto text-xl leading-relaxed text-gray-700 lg:mx-0">
                    Revoluciona la seguridad de tu residencia con nuestro
                    sistema inteligente de registro.
                    <span className="font-semibold text-blue-600">
                        {" "}
                        Rápido, seguro y confiable.
                    </span>
                </p>
                {/* Características destacadas */}
                <div className="flex flex-wrap justify-center gap-6 lg:justify-start">
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                            <Clock className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="font-medium text-gray-700">
                            Registro instantáneo
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                            <Shield className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-700">
                            Máxima seguridad
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
                            <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="font-medium text-gray-700">
                            Control total
                        </span>
                    </div>
                </div>
                {/* Botones de acción */}
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                    <Link
                        href="/contacto"
                        className="inline-flex items-center px-8 py-4 font-semibold text-white transition-all duration-300 transform shadow-lg group bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:scale-105"
                    >
                        Contáctanos ahora
                        <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <button className="inline-flex items-center px-8 py-4 font-semibold text-gray-700 transition-all duration-300 border-2 border-gray-300 rounded-xl hover:border-blue-600 hover:text-blue-600">
                        Ver demo
                    </button>
                </div>
            </div>
        </div>
    );
}
