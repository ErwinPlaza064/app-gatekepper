export default function Stats() {
    return (
        <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="grid gap-8 text-center md:grid-cols-4">
                    <div>
                        <div className="mb-2 text-4xl font-bold text-white md:text-5xl">
                            1000+
                        </div>
                        <div className="text-lg text-blue-100">
                            Residencias protegidas
                        </div>
                    </div>
                    <div>
                        <div className="mb-2 text-4xl font-bold text-white md:text-5xl">
                            99.9%
                        </div>
                        <div className="text-lg text-blue-100">
                            Tiempo de actividad
                        </div>
                    </div>
                    <div>
                        <div className="mb-2 text-4xl font-bold text-white md:text-5xl">
                            50k+
                        </div>
                        <div className="text-lg text-blue-100">
                            Registros diarios
                        </div>
                    </div>
                    <div>
                        <div className="mb-2 text-4xl font-bold text-white md:text-5xl">
                            24/7
                        </div>
                        <div className="text-lg text-blue-100">
                            Soporte técnico
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
