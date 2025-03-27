import Footer from "@/Components/Common/Footer";
import Social_Icons from "@/Components/Common/Social_Icons";
import Typography from "@/Components/UI/Typography";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import InputError from "@/Components/UI/InputError";

export default function Contact({ auth }) {
    const user = auth.user || null;
    const { data, setData, post, errors } = useForm({
        email: "",
        fullname: "",
        message: "",
    });

    function handleChange(e) {
        const key = e.target.id;
        const value = e.target.value;
        setData((data) => ({
            ...data,
            [key]: value,
        }));
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/send-email", {
            data,
            preserveScroll: true,
        });
    };
    return (
        <Authenticated user={user}>
            <Head title="Contacto" />
            <div className="flex flex-col items-start justify-start px-4 py-28 lg:px-64">
                <div className="flex flex-col items-center justify-start gap-10 lg:flex-row">
                    <form onSubmit={handleSubmit} className="w-full lg:w-1/2">
                        <label htmlFor="email">CORREO ELECTRONICO</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="w-full h-10 p-4 mt-2 border border-black rounded-xl"
                            placeholder="correo@ejemplo.com"
                            onChange={handleChange}
                        />
                        <InputError message={errors.email} />
                        <div className="py-8">
                            <label htmlFor="fullname">NOMBRE COMPLETO</label>
                            <input
                                id="fullname"
                                name="fullname"
                                type="text"
                                className="w-full h-10 p-4 mt-2 border border-black rounded-xl"
                                placeholder="Pedro Perez"
                                onChange={handleChange}
                            />
                            <InputError message={errors.fullname} />
                        </div>
                        <textarea
                            className="w-full h-32 p-4 mt-4 border border-black rounded-xl"
                            placeholder="Escribe tu mensaje aquí..."
                            id="message"
                            name="message"
                            onChange={handleChange}
                        />
                        <InputError message={errors.message} />
                        <button className="w-full px-5 m-0 mt-5 text-white bg-black lg:w-auto hover:bg-teal-900 rounded-xl">
                            Enviar
                        </button>
                    </form>
                    <div className="flex flex-col items-center justify-center w-full lg:w-1/2">
                        <picture>
                            <img
                                src="/Assets/contact.svg"
                                alt="Imagen de contacto"
                                className="w-full max-w-md"
                            />
                        </picture>

                        <Typography
                            as={"h3"}
                            variant={"h3"}
                            color={"black"}
                            className="mt-4"
                        >
                            OTRAS FORMAS DE CONTACTO
                        </Typography>
                        <Typography
                            className="mt-2 text-center"
                            as={"p"}
                            variant={"p"}
                            color={"black"}
                        >
                            Si prefieres, puedes contactarnos a través de
                            nuestras redes sociales o directamente a nuestro
                            correo electrónico.
                        </Typography>
                        <Social_Icons className="mt-4" />
                    </div>
                </div>
            </div>

            <Footer />
        </Authenticated>
    );
}
