import Banner from "@/Components/Common/Banner";
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
            <Banner title="CONOCE NUESTRAS FORMAS DE CONTACTO" />
            <div className="flex flex-col justify-start items-start py-10 px-4 lg:px-64">
                <Typography
                    className="m-auto"
                    as={"h2"}
                    variant={"h2"}
                    color={"primary"}
                >
                    CONTACTANOS
                </Typography>
                <div className="flex flex-col lg:flex-row justify-start items-center py-8 gap-10">
                    <form onSubmit={handleSubmit} className="w-full lg:w-1/2">
                        <label htmlFor="email">CORREO ELECTRONICO</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="border p-4 border-black w-full h-10 rounded-xl mt-2"
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
                                className="border p-4 border-black w-full h-10 rounded-xl mt-2"
                                placeholder="Pedro Perez"
                                onChange={handleChange}
                            />
                            <InputError message={errors.fullname} />
                        </div>
                        <textarea
                            className="border p-4 border-black w-full h-32 rounded-xl mt-4"
                            placeholder="Escribe tu mensaje aquí..."
                            id="message"
                            name="message"
                            onChange={handleChange}
                        />
                        <InputError message={errors.message} />
                        <button className="bg-primary text-white px-5 w-full lg:w-auto hover:bg-teal-900 m-0 rounded-xl mt-5">
                            Enviar
                        </button>
                    </form>
                    <div className="flex flex-col justify-center items-center w-full lg:w-1/2">
                        <picture>
                            <img
                                src="/Assets/Contact_img.png"
                                alt="Imagen de contacto"
                                className="w-full max-w-md"
                            />
                        </picture>

                        <Typography
                            as={"h3"}
                            variant={"h3"}
                            color={"primary"}
                            className="mt-4"
                        >
                            OTRAS FORMAS DE CONTACTO
                        </Typography>
                        <Typography
                            className="text-center mt-2"
                            as={"p"}
                            variant={"p"}
                            color={"primary"}
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
