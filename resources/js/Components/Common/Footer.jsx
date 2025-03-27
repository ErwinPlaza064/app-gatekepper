import React from "react";
import Typography from "../UI/Typography";
import Social_Icons from "./Social_Icons";

export default function Footer() {
    return (
        <footer className="px-5">
            <div className="px-5 py-4 mx-auto">
                <div className="flex flex-col items-center justify-between md:flex-row">
                    <div className="mb-4 md:mb-0">
                        <Typography as={"h4"} variant={"h4"} color={"black"}>
                            Nuestras Redes Sociales:
                        </Typography>
                    </div>
                    <Social_Icons />
                </div>
            </div>

            <div className="border border-black"></div>

            <div className="flex flex-col justify-center md:flex-row md:px-64">
                <div className="p-4 text-center md:p-10">
                    <Typography as={"h4"} variant={"h4"} color={"black"}>
                        Registrador de visitantes
                    </Typography>
                    <Typography as={"p"} variant={"p"} color={"black"}>
                        “Seguridad en la entrada tranquilidad en tu hogar.”
                    </Typography>
                </div>

                <div className="p-4 text-center md:p-10">
                    <Typography as={"h4"} variant={"h4"} color={"black"}>
                        Contacto
                    </Typography>
                    <Typography as={"p"} variant={"p"} color={"black"}>
                        gatekepper064@gmail.com <br /> 464-112-3632
                    </Typography>
                </div>
            </div>

            <div className="flex items-center justify-center h-auto p-5 bg-black">
                <span className="text-white">
                    ©Todos los derechos reservados para: Registrador de
                    visitantes
                </span>
            </div>
        </footer>
    );
}
