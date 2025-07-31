import { Building, ChevronRight, Phone } from "lucide-react";
import { Link } from "@inertiajs/react";

export default function CallToAction() {
    return (
        <div className="py-20 bg-gray-50">
            <div className="max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
                <div className="p-12 bg-white shadow-2xl rounded-3xl">
                    <div className="flex justify-center mb-6">
                        <div className="flex items-center justify-center w-20 h-20 bg-black rounded-2xl">
                            <Building className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">
                        ¿Listo para mejorar la seguridad de tu residencia?
                    </h2>
                    <p className="mb-8 text-xl leading-relaxed text-gray-600">
                        Únete a miles de residencias que ya confían en nuestro
                        sistema. Obtén una demostración gratuita y descubre cómo
                        podemos proteger tu hogar.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link
                            href="/contacto"
                            className="inline-flex items-center px-8 py-4 font-semibold text-white transition-all duration-300 transform bg-black shadow-lg group rounded-xl hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:scale-105"
                        >
                            Solicitar demostración
                            <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <div className="flex items-center space-x-2 text-gray-600">
                            <Phone className="w-5 h-5" />
                            <span className="font-medium">464-122-6304</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
