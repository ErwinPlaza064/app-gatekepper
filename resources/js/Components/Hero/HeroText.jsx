import Typography from "../UI/Typography";
import { Link } from "@inertiajs/react";

export default function HeroText() {
    return (
        <div className="flex flex-col-reverse items-center justify-center gap-6 px-4 py-32 lg:flex-row lg:px-64">
            <div className="flex-1">
                <Typography
                    className="text-center"
                    as={"h2"}
                    variant={"h2"}
                    color={"black"}
                >
                    REGISTRO DE VISITANTES
                </Typography>
                <Typography
                    className="text-center mt-7"
                    as={"p"}
                    variant={"p"}
                    color={"dark"}
                >
                    Con nuestro registrador de visitantes, disfruta de un
                    proceso de registro de visitantes rápido y eficiente,
                    eliminando largas esperas y asegurando que solo las personas
                    autorizadas puedan ingresar a la residencia. Garantiza un
                    control de acceso confiable, brindando mayor seguridad y
                    tranquilidad para todos los residentes.
                </Typography>

                <div className="flex flex-col items-center justify-center gap-5 mt-8 sm:flex-row">
                    <Link
                        href={"contacto"}
                        className="items-center px-6 py-2 text-center transition-all duration-300 border border-black rounded-xl hover:bg-black hover:text-white"
                    >
                        Contáctanos
                    </Link>
                </div>
            </div>

            <div className="flex items-center justify-center flex-1">
                <picture className="w-80 lg:w-96">
                    <img
                        src="/Assets/computer.svg"
                        alt="Ilustración de registro"
                    />
                </picture>
            </div>
        </div>
    );
}
