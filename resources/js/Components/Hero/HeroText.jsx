import Typography from "../UI/Typography";
import { Link } from "@inertiajs/react";

export default function HeroText() {
    return (
        <div className="flex flex-col-reverse lg:flex-row justify-center px-4 lg:px-64 py-32 gap-6">
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

                <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mt-8">
                    <Link
                        href={"contacto"}
                        className="border px-6 py-2 items-center rounded-xl border-black hover:bg-black hover:text-white text-center"
                    >
                        Contáctanos
                    </Link>
                </div>
            </div>

            <div className="flex-1 flex justify-center">
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
