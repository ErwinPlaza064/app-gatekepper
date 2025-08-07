import { useEffect, useState } from "react";
import Checkbox from "@/Components/UI/Checkbox";
import GuestLayout from "@/Layouts/GuestLayout";
import InputError from "@/Components/UI/InputError";
import InputLabel from "@/Components/UI/InputLabel";
import PrimaryButton from "@/Components/UI/PrimaryButton";
import TextInput from "@/Components/UI/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import {
    HiMail,
    HiLockClosed,
    HiEye,
    HiEyeOff,
    HiCheckCircle,
} from "react-icons/hi";

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        return () => {
            reset("password");
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <GuestLayout>
            <Head title="Inicia Sesión" />

            {/* Container principal con gradiente de fondo */}
            <div className="flex items-center justify-center min-h-screen px-4 py-1 lg:py-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 sm:px-6 lg:px-8">
                <div className="w-full max-w-sm space-y-6 sm:max-w-md sm:space-y-8">
                    {/* Header con logo y título */}
                    <div className="text-center">
                        <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-black rounded-full shadow-lg">
                            <img
                                src="/Assets/login.svg"
                                className="w-15 h-15"
                                alt="Logo"
                            />
                        </div>
                        <h2 className="mb-2 text-3xl font-bold text-gray-900">
                            Bienvenido de vuelta
                        </h2>
                        <p className="text-gray-600">
                            Inicia sesión en tu cuenta
                        </p>
                    </div>

                    {/* Card principal */}
                    <div className="p-8 border shadow-xl bg-white/80 backdrop-blur-lg rounded-2xl border-white/20">
                        {status && (
                            <div className="p-4 mb-6 border border-green-200 rounded-lg bg-green-50">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg
                                            className="w-5 h-5 text-green-400"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-green-800">
                                            {status}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form
                            onSubmit={submit}
                            className="space-y-4 sm:space-y-6"
                        >
                            {/* Campo Email */}
                            <div className="space-y-2">
                                <InputLabel
                                    htmlFor="email"
                                    value="Correo electrónico"
                                    className="text-sm font-semibold text-gray-700"
                                />
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
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
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="block w-full py-3 pl-10 pr-3 placeholder-gray-400 transition-all duration-200 border border-gray-300 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white"
                                        placeholder="tu@email.com"
                                        autoComplete="username"
                                        isFocused={true}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                    />
                                </div>
                                <InputError
                                    message={errors.email}
                                    className="text-sm text-red-500"
                                />
                            </div>

                            {/* Campo Contraseña */}
                            <div className="space-y-2">
                                <InputLabel
                                    htmlFor="password"
                                    value="Contraseña"
                                    className="text-sm font-semibold text-gray-700"
                                />
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
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
                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                            />
                                        </svg>
                                    </div>
                                    <TextInput
                                        id="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        name="password"
                                        value={data.password}
                                        className="block w-full py-3 pl-10 pr-12 placeholder-gray-400 transition-all duration-200 border border-gray-300 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-0 flex items-center justify-end pr-3 bg-transparent inset-y-1"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword ? (
                                            <svg
                                                className="w-5 h-5 text-gray-400 hover:text-gray-600"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                className="w-5 h-5 text-gray-400 hover:text-gray-600"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <InputError
                                    message={errors.password}
                                    className="text-sm text-red-500"
                                />
                            </div>

                            {/* Recordar y enlace */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) =>
                                            setData(
                                                "remember",
                                                e.target.checked
                                            )
                                        }
                                        className="text-blue-600 border-gray-300 rounded shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">
                                        Recuérdame
                                    </span>
                                </label>
                                <Link
                                    href="/welcome"
                                    className="text-sm text-blue-600 transition-colors duration-200 hover:text-blue-500"
                                >
                                    Volver a inicio
                                </Link>
                            </div>

                            {/* Botón de envío */}
                            <div className="pt-4">
                                <PrimaryButton
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <svg
                                                className="w-5 h-5 mr-3 -ml-1 text-white animate-spin"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Iniciando sesión...
                                        </>
                                    ) : (
                                        "Iniciar sesión"
                                    )}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            © 2025 Gatekepper. Todos los derechos reservados.
                        </p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
