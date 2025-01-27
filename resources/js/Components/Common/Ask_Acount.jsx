import Typography from "../UI/Typography";
import { Link } from "@inertiajs/react";

export default function Ask_Count() {
    return (
        <div className="flex flex-col-reverse lg:flex-row justify-center px-4 lg:px-64 gap-12">
            <img className="w-96" src="/Assets/Img_Question.png" alt="" />
            <div className="text-center mt-5">
                <Typography
                    as={"h3"}
                    variant={"h3"}
                    color={"black"}
                    className="mt-16"
                >
                    ¿Ya eres parte de GateKeeper?
                </Typography>
                <div className="mt-3">
                    <Link
                        href={"/login"}
                        className="rounded-xl px-2 py-1 bg-primary hover:bg-cyan-800 text-white"
                    >
                        Iniciar Sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}
