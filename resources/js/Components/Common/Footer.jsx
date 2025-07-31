import React from "react";
import Typography from "../UI/Typography";
import Social_Icons from "./Social_Icons";
import { Shield, Mail, Phone } from "lucide-react";

export default function Footer() {
    return (
        <footer className="text-white bg-black">
            <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="grid items-start grid-cols-1 gap-12 md:grid-cols-3">
                    <div className="flex flex-col justify-center md:col-span-2">
                        <div className="flex items-center mb-6 space-x-2">
                            <Shield className="w-8 h-8 text-blue-400" />
                            <span className="text-2xl font-bold">
                                GateKeeper
                            </span>
                        </div>
                        <p className="mb-6 text-lg leading-relaxed text-gray-300">
                            "Seguridad en la entrada, tranquilidad en tu hogar."
                        </p>
                        <p className="text-gray-400">
                            Protegemos lo que más te importa con tecnología de
                            vanguardia y un servicio excepcional.
                        </p>
                    </div>
                    <div className="flex flex-col justify-center">
                        <h4 className="mb-6 text-xl font-semibold">Contacto</h4>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <Mail className="w-5 h-5 text-blue-400" />
                                <span className="text-gray-300">
                                    gatekepper064@gmail.com
                                </span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Phone className="w-5 h-5 text-blue-400" />
                                <span className="text-gray-300">
                                    464-122-6304
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pt-8 mt-12 border-t border-gray-700">
                    <div className="text-center text-gray-400">
                        <p>© 2025 Gatekepper. Todos los derechos reservados.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
