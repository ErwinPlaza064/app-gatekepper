import { useEffect } from "react";
import Checkbox from "@/Components/UI/Checkbox";
import GuestLayout from "@/Layouts/GuestLayout";
import InputError from "@/Components/UI/InputError";
import InputLabel from "@/Components/UI/InputLabel";
import PrimaryButton from "@/Components/UI/PrimaryButton";
import TextInput from "@/Components/UI/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

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
        <>
            <GuestLayout>
                <Head title="Inicia Sesión" />

                {status && (
                    <div className="mb-4 text-sm font-medium text-green-600">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <InputLabel
                            htmlFor="email"
                            value="Correo"
                            className="font-semibold text-gray-700"
                        />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="block w-full mt-2 border-gray-300 rounded-md shadow-sm focus:border-gray-700 focus:ring focus:ring-gray-400"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData("email", e.target.value)}
                        />
                        <InputError
                            message={errors.email}
                            className="mt-2 text-red-500"
                        />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="password"
                            value="Contraseña"
                            className="font-semibold text-gray-700"
                        />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="block w-full mt-2 border-gray-300 rounded-md shadow-sm focus:border-gray-700 focus:ring focus:ring-gray-400"
                            autoComplete="current-password"
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                        />
                        <InputError
                            message={errors.password}
                            className="mt-2 text-red-500"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData("remember", e.target.checked)
                                }
                            />
                            <span className="ml-2 text-sm text-gray-600">
                                Recuérdame
                            </span>
                        </label>
                    </div>

                    <div className="flex flex-col items-center justify-end mt-4 md:flex-row">
                        <PrimaryButton
                            className="bg-black ms-4"
                            disabled={processing}
                        >
                            Iniciar sesión
                        </PrimaryButton>
                    </div>
                </form>
            </GuestLayout>
        </>
    );
}
