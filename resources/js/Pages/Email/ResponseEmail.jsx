import Typography from "@/Components/UI/Typography";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Link } from "@inertiajs/react";

export default function ResponseEmail({ auth }) {
    const user = auth.user || null;
    return (
        <>
            <Authenticated user={user}>
                <div className="flex min-h-screen flex-col items-center justify-center bg-primary py-28">
                    <div className="px-10 text-center">
                        <Typography
                            as={"p"}
                            variant={"p"}
                            color={"white"}
                            className="font-bold uppercase"
                        >
                            Mensaje Enviado Con exito
                        </Typography>
                        <Typography
                            as={"h1"}
                            variant={"h1"}
                            color={"white"}
                            className="text-4xl font-bold"
                        >
                            Gracias por contactarnos <br /> a la brevedad
                            atenderemos tu solicitud
                        </Typography>
                    </div>
                    <Link
                        href={"welcome"}
                        className="mt-10 rounded-full bg-white px-4 py-2 font-bold text-black shadow-lg"
                    >
                        Inicio
                    </Link>

                    <div className="mt-10 rounded-xl bg-white px-5 py-5">
                        <picture>
                            <img
                                className="w-72"
                                src="/assets/Correo.gif"
                                alt=""
                            />
                        </picture>
                    </div>
                </div>
            </Authenticated>
        </>
    );
}
