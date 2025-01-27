import React from "react";
import Typography from "../UI/Typography";

export default function Adn() {
    return (
        <div className="flex flex-col md:flex-row justify-center px-4 md:px-16 lg:px-64 mt-10 gap-6 md:gap-10 bg-gray-100 py-20">
            {/* Misión */}
            <div className="border rounded-lg border-black w-full md:w-56 p-6 h-auto">
                <Typography
                    className="text-center"
                    as={"h4"}
                    variant={"h4"}
                    color={"primary"}
                >
                    MISIÓN
                </Typography>
                <div className="flex relative px-4 mt-4 text-center">
                    <Typography
                        className="text-pretty"
                        as={"p"}
                        variant={"p"}
                        color={"dark"}
                    >
                        <span className="absolute left-1 top-1">
                            <img src="/Assets/Vector.png" alt="" />
                        </span>
                        Proporcionar un sistema de registro de visitantes que
                        sea rápido, seguro y eficiente.
                    </Typography>
                </div>
                <div className="flex mt-3 relative px-4 text-center">
                    <Typography
                        className="text-pretty"
                        as={"p"}
                        variant={"p"}
                        color={"dark"}
                    >
                        <span className="absolute left-1 top-1">
                            <img src="/Assets/Vector.png" alt="" />
                        </span>
                        Mejorar el control de acceso a las residencias.
                    </Typography>
                </div>
                <div className="flex mt-3 relative px-4 text-center">
                    <Typography
                        className="text-pretty"
                        as={"p"}
                        variant={"p"}
                        color={"dark"}
                    >
                        <span className="absolute left-1 top-1">
                            <img src="/Assets/Vector.png" alt="" />
                        </span>
                        Garantizar la tranquilidad de residentes y visitantes
                        mediante soluciones tecnológicas innovadoras.
                    </Typography>
                </div>
            </div>

            {/* Visión */}
            <div className="border rounded-lg border-black w-full md:w-56 p-6 h-auto">
                <Typography
                    className="text-center"
                    as={"h4"}
                    variant={"h4"}
                    color={"primary"}
                >
                    VISIÓN
                </Typography>
                <div className="flex relative px-4 mt-4 text-center">
                    <Typography
                        className="text-pretty"
                        as={"p"}
                        variant={"p"}
                        color={"dark"}
                    >
                        <span className="absolute left-1 top-1">
                            <img src="/Assets/Vector.png" alt="" />
                        </span>
                        Ser la plataforma líder en seguridad residencial.
                    </Typography>
                </div>
                <div className="flex mt-3 relative px-4 text-center">
                    <Typography
                        className="text-pretty"
                        as={"p"}
                        variant={"p"}
                        color={"dark"}
                    >
                        <span className="absolute left-1 top-1">
                            <img src="/Assets/Vector.png" alt="" />
                        </span>
                        Transformar la gestión de accesos en las comunidades.
                    </Typography>
                </div>
                <div className="flex mt-3 relative px-4 text-center">
                    <Typography
                        className="text-pretty"
                        as={"p"}
                        variant={"p"}
                        color={"dark"}
                    >
                        <span className="absolute left-1 top-1">
                            <img src="/Assets/Vector.png" alt="" />
                        </span>
                        Establecer un estándar de confianza y eficiencia en cada
                        comunidad.
                    </Typography>
                </div>
            </div>

            {/* Valores */}
            <div className="border rounded-lg border-black w-full md:w-56 p-6 h-auto">
                <Typography
                    className="text-center"
                    as={"h4"}
                    variant={"h4"}
                    color={"primary"}
                >
                    VALORES
                </Typography>
                <div className="flex relative px-4 mt-4 text-center">
                    <Typography
                        className="text-pretty "
                        as={"p"}
                        variant={"p"}
                        color={"dark"}
                    >
                        <span className="absolute left-1 top-1">
                            <img src="/Assets/Vector.png" alt="" />
                        </span>
                        Seguridad-Proteger a los residentes y visitantes
                        asegurando un entorno confiable.
                    </Typography>
                </div>
                <div className="flex mt-3 relative px-4 text-center">
                    <Typography
                        className="text-pretty"
                        as={"p"}
                        variant={"p"}
                        color={"dark"}
                    >
                        <span className="absolute left-1 top-1">
                            <img src="/Assets/Vector.png" alt="" />
                        </span>
                        Innovación-Desarrollar soluciones tecnológicas avanzadas
                        adaptadas a las residencias modernas.
                    </Typography>
                </div>
            </div>
        </div>
    );
}
