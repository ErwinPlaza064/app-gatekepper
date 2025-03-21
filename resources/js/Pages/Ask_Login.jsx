import Typography from "@/Components/UI/Typography";
import { Link } from "@inertiajs/react";
import { Head } from "@inertiajs/react";

export default function Ask_Acount() {
    return (
        <>
            <Head title="¿Residente?" />
            <div className="flex flex-col-reverse lg:flex-row justify-center px-4  lg:px-64 py-40 gap-6">
                <div className="flex-1 flex justify-center">
                    <picture className="w-80 lg:w-96">
                        <img
                            src="/Assets/Hero_Img.png"
                            alt="Ilustración de registro"
                        />
                    </picture>
                </div>
                <div className="flex-1 p-12">
                    <Typography
                        className="text-center"
                        as={"h2"}
                        variant={"h2"}
                        color={"primary"}
                    >
                        REGISTRADOR DE VISITANTES
                    </Typography>
                    <Typography
                        className="text-center mt-3"
                        as={"p"}
                        variant={"p"}
                        color={"dark"}
                    >
                        <Typography as={"h3"} variant={"h3"} color={"whites"}>
                            <strong>¿Eres residente?</strong> Ingresa y accede a
                            tu cuenta
                        </Typography>
                    </Typography>

                    <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mt-8">
                        <Link
                            href={"/login"}
                            className="border px-6 py-2 items-center rounded-xl border-black hover:bg-primary hover:text-white text-center"
                        >
                            Ingresa
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
