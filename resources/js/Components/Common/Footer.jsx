import React from "react";
import Typography from "../UI/Typography";
import Social_Icons from "./Social_Icons";

export default function Footer() {
    return (
        <footer className="px-5">
            <div className="px-5 py-4 mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <Typography as={"h4"} variant={"h4"} color={"black"}>
                            Nuestras Redes Sociales:
                        </Typography>
                    </div>
                    <Social_Icons />
                </div>
            </div>

            <div className="border border-black"></div>

            <div className="flex flex-col md:flex-row md:px-64 justify-center">
                <div className="p-4 md:p-10 text-center">
                    <Typography as={"h4"} variant={"h4"} color={"black"}>
                        Gatekepper
                    </Typography>
                    <Typography as={"p"} variant={"p"} color={"black"}>
                        “Seguridad en la entrada tranquilidad en tu hogar.”
                    </Typography>
                </div>

                <div className="p-4 md:p-10 text-center">
                    <Typography as={"h4"} variant={"h4"} color={"black"}>
                        Contacto
                    </Typography>
                    <Typography as={"p"} variant={"p"} color={"black"}>
                        gatekepper064@gmail.com <br /> 464-112-3632
                    </Typography>
                </div>
            </div>

            <div className="flex justify-center items-center p-5 h-auto bg-black">
                <span className="text-white">
                    ©Todos los derechos reservados para: Registrador de
                    visitantes
                </span>
            </div>
        </footer>
    );
}
