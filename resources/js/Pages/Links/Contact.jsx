import Footer from "@/Components/Common/Footer";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import InputError from "@/Components/UI/InputError";
import Stepper from "@/Components/UI/Stepper";
import LocationPicker from "@/Components/UI/LocationPicker";
import { ToastProvider, useToast } from "@/Components/UI/Toast";
import useStepper from "@/Hooks/useStepper";
import { useState } from "react";

function ContactForm({ auth }) {
    const user = auth.user || null;
    const { addToast, removeAllLoadingToasts } = useToast();

    const { data, setData, post, errors, processing, reset } = useForm({
        fullname: "",
        email: "",
        subject: "",
        message: "",
        location: null,
    });

    const [validationErrors, setValidationErrors] = useState({});

    const steps = [
        { label: "Nombre" },
        { label: "Email" },
        { label: "Asunto" },
        { label: "Mensaje" },
        { label: "Ubicación" },
        { label: "Resumen" },
    ];

    const {
        currentStep,
        nextStep,
        previousStep,
        reset: resetStepper,
    } = useStepper(steps.length);

    function handleChange(e) {
        const key = e.target.id;
        const value = e.target.value;
        setData((data) => ({
            ...data,
            [key]: value,
        }));
        // Clear validation error when user types
        setValidationErrors((prev) => ({
            ...prev,
            [key]: null,
        }));
    }

    const handleLocationChange = (locationData) => {
        setData("location", locationData);
        setValidationErrors((prev) => ({
            ...prev,
            location: null,
        }));
    };

    const validateStep = () => {
        const newErrors = {};

        switch (currentStep) {
            case 0: // Nombre
                if (!data.fullname.trim()) {
                    newErrors.fullname = "El nombre es obligatorio";
                } else if (data.fullname.trim().length < 3) {
                    newErrors.fullname =
                        "El nombre debe tener al menos 3 caracteres";
                }
                break;
            case 1: // Email
                if (!data.email.trim()) {
                    newErrors.email = "El email es obligatorio";
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
                    newErrors.email = "El email no es válido";
                }
                break;
            case 2: // Asunto
                if (!data.subject.trim()) {
                    newErrors.subject = "El asunto es obligatorio";
                } else if (data.subject.trim().length < 5) {
                    newErrors.subject =
                        "El asunto debe tener al menos 5 caracteres";
                }
                break;
            case 3: // Mensaje
                if (!data.message.trim()) {
                    newErrors.message = "El mensaje es obligatorio";
                } else if (data.message.trim().length < 10) {
                    newErrors.message =
                        "El mensaje debe tener al menos 10 caracteres";
                }
                break;
            case 4: // Ubicación
                if (!data.location) {
                    newErrors.location =
                        "Debes seleccionar una ubicación en el mapa";
                }
                break;
        }

        setValidationErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep()) {
            nextStep();
        } else {
            addToast(
                "Por favor, completa todos los campos correctamente",
                "error"
            );
        }
    };

    const handleKeyDown = (e) => {
        // Prevenir que Enter envíe el formulario, solo avanzar al siguiente paso
        if (e.key === "Enter" && currentStep < steps.length - 1) {
            e.preventDefault();
            handleNext();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Debug: verificar en qué paso estamos
        console.log(
            "handleSubmit called - currentStep:",
            currentStep,
            "steps.length:",
            steps.length
        );

        // Solo permitir envío desde el paso final (Resumen)
        if (currentStep !== steps.length - 1) {
            addToast("Por favor, revisa el resumen antes de enviar", "warning");
            console.log("Prevenir envío - no estamos en el paso final");
            return;
        }

        // Validación final de todos los campos
        const finalErrors = {};

        if (!data.fullname.trim() || data.fullname.trim().length < 3) {
            finalErrors.fullname =
                "El nombre es obligatorio y debe tener al menos 3 caracteres";
        }
        if (
            !data.email.trim() ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
        ) {
            finalErrors.email = "El email es obligatorio y debe ser válido";
        }
        if (!data.subject.trim() || data.subject.trim().length < 5) {
            finalErrors.subject =
                "El asunto es obligatorio y debe tener al menos 5 caracteres";
        }
        if (!data.message.trim() || data.message.trim().length < 10) {
            finalErrors.message =
                "El mensaje es obligatorio y debe tener al menos 10 caracteres";
        }
        if (!data.location) {
            finalErrors.location = "Debes seleccionar una ubicación en el mapa";
        }

        if (Object.keys(finalErrors).length > 0) {
            setValidationErrors(finalErrors);
            addToast(
                "Por favor, completa todos los campos correctamente",
                "error"
            );
            return;
        }

        const toastId = addToast("Enviando tu mensaje...", "loading", 0);

        post("/send-email", {
            preserveScroll: true,
            onSuccess: () => {
                addToast(
                    "¡Mensaje enviado exitosamente! Te contactaremos pronto.",
                    "success",
                    5000
                );
                reset();
                resetStepper();
            },
            onError: (errors) => {
                addToast(
                    "Error al enviar el mensaje. Por favor, intenta nuevamente.",
                    "error",
                    5000
                );
                console.error(errors);
            },
            onFinish: () => {
                // Este callback se ejecuta siempre al finalizar (éxito o error)
                // Aquí podríamos cerrar el toast de loading si fuera necesario
            },
        });
    };

    // Render Step Content
    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Paso 1: Nombre
                return (
                    <div className="space-y-4">
                        <div className="mb-4 text-center sm:mb-6">
                            <h3 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">
                                Información Personal
                            </h3>
                            <p className="text-sm text-gray-600 sm:text-base">
                                Cuéntanos sobre ti
                            </p>
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor="fullname"
                                className="block text-xs font-semibold tracking-wide text-gray-700 uppercase sm:text-sm"
                            >
                                ¿Cuál es tu nombre? *
                            </label>
                            <div className="relative">
                                <input
                                    id="fullname"
                                    name="fullname"
                                    type="text"
                                    className="w-full px-3 py-3 text-sm placeholder-gray-400 transition-colors duration-200 border-2 border-gray-200 sm:px-4 rounded-xl focus:border-black focus:ring-0 sm:text-base"
                                    placeholder="Escribe tu nombre completo"
                                    value={data.fullname}
                                    onChange={handleChange}
                                    onKeyDown={handleKeyDown}
                                    autoFocus
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg
                                        className="w-4 h-4 text-gray-400 sm:w-5 sm:h-5"
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
                            {validationErrors.fullname && (
                                <InputError
                                    message={validationErrors.fullname}
                                />
                            )}
                        </div>
                    </div>
                );

            case 1: // Paso 2: Email
                return (
                    <div className="space-y-4">
                        <div className="mb-4 text-center sm:mb-6">
                            <h3 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">
                                Tu Correo Electrónico
                            </h3>
                            <p className="text-sm text-gray-600 sm:text-base">
                                Te enviaremos una confirmación
                            </p>
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="block text-xs font-semibold tracking-wide text-gray-700 uppercase sm:text-sm"
                            >
                                Correo Electrónico *
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    className="w-full px-3 py-3 text-sm placeholder-gray-400 transition-colors duration-200 border-2 border-gray-200 sm:px-4 rounded-xl focus:border-black focus:ring-0 sm:text-base"
                                    placeholder="tu@correo.com"
                                    value={data.email}
                                    onChange={handleChange}
                                    onKeyDown={handleKeyDown}
                                    autoFocus
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg
                                        className="w-4 h-4 text-gray-400 sm:w-5 sm:h-5"
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
                            {validationErrors.email && (
                                <InputError message={validationErrors.email} />
                            )}
                        </div>
                    </div>
                );

            case 2: // Paso 3: Asunto
                return (
                    <div className="space-y-4">
                        <div className="mb-4 text-center sm:mb-6">
                            <h3 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">
                                Asunto del Mensaje
                            </h3>
                            <p className="text-sm text-gray-600 sm:text-base">
                                ¿De qué trata tu consulta?
                            </p>
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor="subject"
                                className="block text-xs font-semibold tracking-wide text-gray-700 uppercase sm:text-sm"
                            >
                                Asunto *
                            </label>
                            <div className="relative">
                                <input
                                    id="subject"
                                    name="subject"
                                    type="text"
                                    className="w-full px-3 py-3 text-sm placeholder-gray-400 transition-colors duration-200 border-2 border-gray-200 sm:px-4 rounded-xl focus:border-black focus:ring-0 sm:text-base"
                                    placeholder="Ej: Solicitud de información, Pregunta sobre servicios..."
                                    value={data.subject}
                                    onChange={handleChange}
                                    onKeyDown={handleKeyDown}
                                    autoFocus
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg
                                        className="w-4 h-4 text-gray-400 sm:w-5 sm:h-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            {validationErrors.subject && (
                                <InputError
                                    message={validationErrors.subject}
                                />
                            )}
                        </div>
                    </div>
                );

            case 3: // Paso 4: Mensaje
                return (
                    <div className="space-y-4">
                        <div className="mb-4 text-center sm:mb-6">
                            <h3 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">
                                Tu Mensaje
                            </h3>
                            <p className="text-sm text-gray-600 sm:text-base">
                                Cuéntanos cómo podemos ayudarte
                            </p>
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor="message"
                                className="block text-xs font-semibold tracking-wide text-gray-700 uppercase sm:text-sm"
                            >
                                Mensaje *
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                rows={6}
                                className="w-full px-4 py-3 text-sm placeholder-gray-400 transition-colors duration-200 border-2 border-gray-200 resize-none rounded-xl focus:border-black focus:ring-0 sm:text-base"
                                placeholder="Escribe tu mensaje aquí... Cuéntanos los detalles de tu consulta o comentario."
                                value={data.message}
                                onChange={handleChange}
                                autoFocus
                            />
                            {validationErrors.message && (
                                <InputError
                                    message={validationErrors.message}
                                />
                            )}
                            <p className="text-sm text-gray-500">
                                {data.message.length} caracteres
                            </p>
                        </div>
                    </div>
                );

            case 4: // Paso 5: Ubicación
                return (
                    <div className="space-y-4">
                        <div className="mb-4 text-center sm:mb-6">
                            <h3 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">
                                Tu Ubicación
                            </h3>
                            <p className="text-sm text-gray-600 sm:text-base">
                                Ayúdanos a ubicarte seleccionando tu posición en
                                el mapa
                            </p>
                        </div>
                        <LocationPicker
                            onLocationChange={handleLocationChange}
                            initialLocation={data.location}
                        />
                        {validationErrors.location && (
                            <InputError message={validationErrors.location} />
                        )}
                    </div>
                );

            case 5: // Paso 6: Resumen
                return (
                    <div className="space-y-4 sm:space-y-6">
                        <div className="mb-4 text-center sm:mb-6">
                            <h3 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">
                                Resumen de tu Mensaje
                            </h3>
                            <p className="text-sm text-gray-600 sm:text-base">
                                Revisa la información antes de enviar
                            </p>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                            {/* Nombre */}
                            <div className="p-3 border border-gray-200 rounded-lg sm:p-4 bg-gray-50">
                                <div className="flex items-start">
                                    <svg
                                        className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-black flex-shrink-0 mt-0.5"
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
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-gray-600 uppercase sm:text-sm">
                                            Nombre
                                        </p>
                                        <p className="text-base font-medium text-gray-900 break-words sm:text-lg">
                                            {data.fullname}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="p-3 border border-gray-200 rounded-lg sm:p-4 bg-gray-50">
                                <div className="flex items-start">
                                    <svg
                                        className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-black flex-shrink-0 mt-0.5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-gray-600 uppercase sm:text-sm">
                                            Email
                                        </p>
                                        <p className="text-base font-medium text-gray-900 break-words sm:text-lg">
                                            {data.email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Asunto */}
                            <div className="p-3 border border-gray-200 rounded-lg sm:p-4 bg-gray-50">
                                <div className="flex items-start">
                                    <svg
                                        className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-black flex-shrink-0 mt-0.5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                        />
                                    </svg>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-gray-600 uppercase sm:text-sm">
                                            Asunto
                                        </p>
                                        <p className="text-base font-medium text-gray-900 break-words sm:text-lg">
                                            {data.subject}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Mensaje */}
                            <div className="p-3 border border-gray-200 rounded-lg sm:p-4 bg-gray-50">
                                <div className="flex items-start">
                                    <svg
                                        className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-black flex-shrink-0 mt-0.5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-gray-600 uppercase sm:text-sm">
                                            Mensaje
                                        </p>
                                        <p className="text-sm text-gray-900 break-words whitespace-pre-wrap sm:text-base">
                                            {data.message}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Ubicación */}
                            {data.location && (
                                <div className="p-3 border border-gray-200 rounded-lg sm:p-4 bg-gray-50">
                                    <div className="flex items-start">
                                        <svg
                                            className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-black flex-shrink-0 mt-0.5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold text-gray-600 uppercase sm:text-sm">
                                                Ubicación
                                            </p>
                                            <p className="text-sm text-gray-900 break-words sm:text-base">
                                                {data.location.address}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                                                Coordenadas:{" "}
                                                {data.location.lat.toFixed(6)},{" "}
                                                {data.location.lng.toFixed(6)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-3 border-2 border-blue-200 rounded-lg sm:p-4 bg-blue-50">
                            <div className="flex items-start">
                                <svg
                                    className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 mr-2 sm:mr-3 text-blue-600 flex-shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <p className="text-xs text-blue-800 sm:text-sm">
                                    Al hacer clic en "Enviar Mensaje", tu
                                    información será enviada y nos pondremos en
                                    contacto contigo lo antes posible.
                                </p>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Authenticated user={user}>
            <Head title="Contacto" />
            <div className="py-16 sm:py-28 bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="max-w-4xl px-4 mx-auto text-center sm:px-6">
                    <h1 className="mb-3 text-3xl font-bold text-gray-900 sm:mb-4 sm:text-4xl lg:text-5xl">
                        Contáctanos
                    </h1>
                    <p className="max-w-2xl mx-auto text-base text-gray-600 sm:text-xl">
                        Completa el formulario en 5 sencillos pasos
                    </p>
                </div>
            </div>
            <div className="bg-white">
                <div className="h-8 sm:h-16" />
                <div className="px-4 mx-auto sm:px-6 max-w-7xl lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="p-4 bg-white border border-gray-100 shadow-xl sm:p-8 lg:p-10 rounded-2xl">
                            {/* Stepper */}
                            <Stepper steps={steps} currentStep={currentStep} />

                            {/* Form */}
                            <form
                                onSubmit={handleSubmit}
                                className="mt-6 sm:mt-8"
                            >
                                {/* Step Content */}
                                <div className="min-h-[200px]">
                                    {renderStepContent()}
                                </div>

                                {/* Navigation Buttons */}
                                <div className="flex flex-col gap-3 pt-6 mt-6 border-t border-gray-200 sm:flex-row sm:gap-0 sm:justify-between sm:mt-8">
                                    <button
                                        type="button"
                                        onClick={previousStep}
                                        disabled={currentStep === 0}
                                        className={`
                                            w-full sm:w-auto px-6 py-3 rounded-xl font-semibold transition-all duration-200 order-2 sm:order-1
                                            ${
                                                currentStep === 0
                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            }
                                        `}
                                    >
                                        ← Anterior
                                    </button>

                                    {currentStep < steps.length - 1 ? (
                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            className="order-1 w-full px-6 py-3 font-semibold text-white transition-all duration-200 bg-black shadow-lg sm:w-auto rounded-xl hover:bg-gray-800 hover:shadow-xl sm:order-2"
                                        >
                                            Siguiente →
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className={`
                                                w-full sm:w-auto px-8 py-3 font-semibold text-white transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl order-1 sm:order-2
                                                ${
                                                    processing
                                                        ? "bg-gray-400 cursor-not-allowed"
                                                        : "bg-green-500 hover:bg-green-600"
                                                }
                                            `}
                                        >
                                            {processing ? (
                                                <span className="flex items-center justify-center">
                                                    <div className="w-5 h-5 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                                                    Enviando...
                                                </span>
                                            ) : (
                                                "✓ Enviar Mensaje"
                                            )}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Info Card */}
                        <div className="mt-6 space-y-6 sm:mt-8">
                            <div className="p-4 border border-green-200 sm:p-6 bg-green-50 rounded-xl">
                                <div className="flex items-center mb-3">
                                    <svg
                                        className="w-5 h-5 mr-3 text-green-600 sm:w-6 sm:h-6"
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
                                    <h4 className="text-base font-semibold text-green-800 sm:text-lg">
                                        Tiempo de Respuesta
                                    </h4>
                                </div>
                                <p className="text-sm text-green-700 sm:text-base">
                                    Normalmente respondemos en menos de 24 horas
                                    durante días laborales.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-12 bg-white sm:h-20" />
            <Footer />
        </Authenticated>
    );
}

export default function Contact({ auth }) {
    return (
        <ToastProvider>
            <ContactForm auth={auth} />
        </ToastProvider>
    );
}
