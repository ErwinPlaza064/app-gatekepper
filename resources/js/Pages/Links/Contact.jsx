import Footer from "@/Components/Common/Footer";
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
            <div className="py-28 bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="max-w-4xl px-6 mx-auto text-center">
                    <h1 className="mb-4 text-4xl font-bold text-gray-900 lg:text-5xl">
                        Contáctanos
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-gray-600">
                        ¿Tienes alguna pregunta o comentario? Nos encantaría
                        escucharte. Completa el formulario y te responderemos
                        pronto.
                    </p>
                </div>
            </div>
            <div className="bg-white ">
                <div className="h-16" />
                <div className="px-6 mx-auto max-w-7xl lg:px-8">
                    <div className="grid items-stretch gap-16 lg:grid-cols-2">
                        <div className="order-2 lg:order-1">
                            <div className="p-8 bg-white border border-gray-100 shadow-xl rounded-2xl lg:p-10">
                                <div className="mb-8">
                                    <h2 className="mb-2 text-2xl font-bold text-gray-900">
                                        Envíanos un mensaje
                                    </h2>
                                    <p className="text-gray-600">
                                        Completa todos los campos y te
                                        contactaremos a la brevedad.
                                    </p>
                                </div>

                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-6 "
                                >
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="email"
                                            className="block text-sm font-semibold tracking-wide text-gray-700 uppercase"
                                        >
                                            Correo Electrónico *
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                className="w-full px-4 py-3 placeholder-gray-400 transition-colors duration-200 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
                                                placeholder="tu@correo.com"
                                                value={data.email}
                                                onChange={handleChange}
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <svg
                                                    className="w-5 h-5 text-gray-400"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="fullname"
                                            className="block text-sm font-semibold tracking-wide text-gray-700 uppercase"
                                        >
                                            Nombre Completo *
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="fullname"
                                                name="fullname"
                                                type="text"
                                                className="w-full px-4 py-3 placeholder-gray-400 transition-colors duration-200 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
                                                placeholder="Pedro Pérez González"
                                                value={data.fullname}
                                                onChange={handleChange}
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <svg
                                                    className="w-5 h-5 text-gray-400"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                        <InputError message={errors.fullname} />
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="message"
                                            className="block text-sm font-semibold tracking-wide text-gray-700 uppercase"
                                        >
                                            Mensaje *
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            rows={5}
                                            className="w-full px-4 py-3 placeholder-gray-400 transition-colors duration-200 border-2 border-gray-200 resize-none rounded-xl focus:border-blue-500 focus:ring-0"
                                            placeholder="Escribe tu mensaje aquí... Cuéntanos cómo podemos ayudarte."
                                            value={data.message}
                                            onChange={handleChange}
                                        />
                                        <InputError message={errors.message} />
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            className="w-full mx-auto bg-black hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
                                        >
                                            <span className="flex items-center justify-center">
                                                Enviar Mensaje
                                            </span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center order-1 h-full space-y-8 lg:order-2">
                            <div className="text-center">
                                <div className="p-8 mb-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl">
                                    <img
                                        src="/Assets/contact.svg"
                                        alt="Imagen de contacto"
                                        className="w-full max-w-sm mx-auto"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 border border-green-200 bg-green-50 rounded-xl">
                                    <div className="flex items-center mb-3">
                                        <svg
                                            className="w-6 h-6 mr-3 text-green-600"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        <h4 className="text-lg font-semibold text-green-800">
                                            Tiempo de Respuesta
                                        </h4>
                                    </div>
                                    <p className="text-green-700">
                                        Normalmente respondemos en menos de 24
                                        horas durante días laborales.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-20 bg-white" />
            <Footer />
        </Authenticated>
    );
}
