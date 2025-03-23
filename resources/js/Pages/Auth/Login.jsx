import { useEffect } from "react";
import Checkbox from "@/Components/UI/Checkbox";
import GuestLayout from "@/Layouts/GuestLayout";
import InputError from "@/Components/UI/InputError";
import InputLabel from "@/Components/UI/InputLabel";
import PrimaryButton from "@/Components/UI/PrimaryButton";
import TextInput from "@/Components/UI/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Login({ status, canResetPassword }) {
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
                    <div className="mb-4 font-medium text-sm text-green-600">
                        {status}
                    </div>
                )}

                <div className="w-full max-w-md bg-white shadow-md rounded-lg px-6 md:px-10 py-8 mx-auto">
                    <form onSubmit={submit}>
                        <div>
                            <InputLabel htmlFor="email" value="Correo" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                            />
                            <InputError
                                message={errors.email}
                                className="mt-2"
                            />
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="password" value="Contraseña" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full"
                                autoComplete="current-password"
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                            />
                            <InputError
                                message={errors.password}
                                className="mt-2"
                            />
                        </div>

                        <div className="block mt-4">
                            <label className="flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData("remember", e.target.checked)
                                    }
                                />
                                <span className="ms-2 text-sm text-gray-600">
                                    Recuérdame
                                </span>
                            </label>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-end mt-6">
                            <PrimaryButton
                                className="w-full md:w-auto bg-black text-white py-2 px-4 rounded-md"
                                disabled={processing}
                            >
                                Iniciar sesión
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </GuestLayout>
        </>
    );
}
