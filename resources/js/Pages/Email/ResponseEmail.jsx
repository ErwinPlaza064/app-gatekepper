import Typography from "@/Components/UI/Typography";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";

export default function ResponseEmail({ auth }) {
    const user = auth.user || null;
    return (
        <>
            <Authenticated user={user}>
                <Head title="Mensaje Enviado" />
                <div className="flex flex-col items-center justify-center min-h-screen py-28">
                    <div className="px-10 text-center">
                        <Typography
                            as={"h2"}
                            variant={"h2"}
                            color={"black"}
                            className="font-bold uppercase"
                        >
                            Mensaje Enviado Con exito
                        </Typography>
                        <Typography as={"p"} variant={"p"} color={"black"}>
                            Gracias por contactarnos <br /> a la brevedad
                            atenderemos tu solicitud
                        </Typography>
                    </div>

                    <div className="px-5 py-5 mt-10 bg-white rounded-xl">
                        <picture>
                            <img
                                className="w-72"
                                src="/Assets/Correo.gif"
                                alt=""
                            />
                        </picture>
                    </div>
                    <Link
                        href={"/"}
                        className="p-4 mt-10 text-center text-white transition-all duration-300 ease-in-out bg-black rounded-lg hover:bg-blue-700 hover:text-white lg:w-1/2"
                    >
                        Inicio
                    </Link>
                </div>
            </Authenticated>
        </>
    );
}
