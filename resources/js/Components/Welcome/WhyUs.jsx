import { Clock, Shield, UserCheck } from "lucide-react";

export default function WhyUs() {
    return (
        <div className="py-20 bg-white">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                        ¿Por qué elegir nuestro sistema?
                    </h2>
                    <p className="max-w-3xl mx-auto text-xl text-gray-600">
                        Descubre las ventajas que hacen de nuestro registro de
                        visitantes la mejor opción para tu seguridad
                    </p>
                </div>
                <div className="grid gap-8 md:grid-cols-3">
                    <div className="p-8 text-center transition-all duration-300 group rounded-2xl hover:shadow-lg">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 transition-transform bg-black rounded-2xl group-hover:scale-110">
                            <Clock className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="mb-4 text-2xl font-bold text-gray-900">
                            Proceso Rápido
                        </h3>
                        <p className="leading-relaxed text-gray-600">
                            Elimina las largas esperas con nuestro sistema de
                            registro instantáneo. Solo toma segundos registrar a
                            cada visitante.
                        </p>
                    </div>
                    <div className="p-8 text-center transition-all duration-300 group rounded-2xl group-hover:scale-110 hover:shadow-lg">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 transition-transform bg-black rounded-2xl group-hover:scale-110">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="mb-4 text-2xl font-bold text-gray-900">
                            Control Seguro
                        </h3>
                        <p className="leading-relaxed text-gray-600">
                            Garantiza que solo las personas autorizadas ingresen
                            a la residencia con nuestro sistema de verificación
                            avanzado.
                        </p>
                    </div>
                    <div className="p-8 text-center transition-all duration-300 group rounded-2xl hover:shadow-lg">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 transition-transform bg-black rounded-2xl group-hover:scale-110">
                            <UserCheck className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="mb-4 text-2xl font-bold text-gray-900">
                            Tranquilidad Total
                        </h3>
                        <p className="leading-relaxed text-gray-600">
                            Disfruta de la paz mental sabiendo que tu hogar está
                            protegido por un sistema confiable las 24 horas.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
