import { QRCodeCanvas } from "qrcode.react";
import { useState, useRef } from "react";
import {
    FaDownload,
    FaWhatsapp,
    FaPlus,
    FaQrcode,
    FaUser,
    FaIdCard,
    FaCar,
    FaClock,
    FaCheck,
    FaSave,
    FaBullseye,
    FaRedoAlt,
} from "react-icons/fa";
import Typography from "@/Components/UI/Typography";
import axios from "axios";
import { toast } from "react-hot-toast";

const CLOUD_NAME = "dibbibwqd";
const UPLOAD_PRESET = "qr-gatekepper";

export default function QRGenerator({ userId }) {
    const [visitorInfo, setVisitorInfo] = useState({
        name: "",
        id_document: "",
        vehicle_plate: "",
        user_id: userId,
    });

    const [qrOptions, setQrOptions] = useState({
        type: "single_use",
        duration: 24,
        maxUses: 1,
    });

    const [savedQrData, setSavedQrData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isQrSaved, setIsQrSaved] = useState(false);

    const qrRef = useRef(null);

    const calculateExpirationDate = (hours) => {
        const now = new Date();
        return new Date(now.getTime() + hours * 60 * 60 * 1000);
    };

    const saveQrToDatabase = async () => {
        setIsSaving(true);

        try {
            // Usar la URL actual del sitio en lugar de hardcodear
            let API_URL = window.location.origin;

            // Fallback para desarrollo o si es necesario
            if (
                !API_URL ||
                API_URL.includes("localhost") ||
                API_URL.includes("192.168")
            ) {
                API_URL =
                    import.meta.env.VITE_API_URL || "https://gatekepper.com";
            }

            // Asegurar que siempre use HTTPS en producción
            if (
                API_URL.startsWith("http://") &&
                !API_URL.includes("localhost")
            ) {
                API_URL = API_URL.replace("http://", "https://");
            }

            const csrfResponse = await axios.get(`${API_URL}/csrf-token`);
            const csrfToken = csrfResponse.data.token;

            const qrData = {
                visitor_name: visitorInfo.name,
                document_id: visitorInfo.id_document,
                vehicle_plate: visitorInfo.vehicle_plate,
                qr_type: qrOptions.type,
                max_uses: qrOptions.maxUses,
                valid_until: null,
            };

            if (
                qrOptions.type === "time_limited" ||
                qrOptions.type === "recurring"
            ) {
                qrData.valid_until = calculateExpirationDate(
                    qrOptions.duration
                ).toISOString();
            }

            const response = await axios.post(
                `${API_URL}/api/qr-codes`,
                qrData,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                    withCredentials: true,
                }
            );

            setSavedQrData(response.data.qr_code);
            setIsQrSaved(true);
            toast.success("QR guardado correctamente");
        } catch (error) {
            console.error("Error saving QR:", error);
            if (error.response?.status === 401) {
                toast.error("No estás autenticado. Por favor, inicia sesión.");
            } else if (error.response?.status === 419) {
                toast.error("Token de seguridad expirado. Recarga la página.");
            } else if (error.response?.data?.errors) {
                const errorMessages = Object.values(
                    error.response.data.errors
                ).flat();
                toast.error(errorMessages.join(", "));
            } else {
                toast.error(
                    "Error al guardar el código QR. Por favor, intenta de nuevo."
                );
            }
        } finally {
            setIsSaving(false);
        }
    };

    const generateQRDataForDisplay = () => {
        if (!savedQrData) return "";

        return JSON.stringify({
            qr_id: savedQrData.qr_id,
            name: savedQrData.visitor_name,
            id_document: savedQrData.document_id,
            user_id: savedQrData.user_id || userId,
            vehicle_plate: savedQrData.vehicle_plate,
            qr_type: savedQrData.qr_type,
            created_at: savedQrData.created_at,
            valid_until: savedQrData.valid_until,
            max_uses: savedQrData.max_uses,
        });
    };

    const downloadQR = () => {
        try {
            const canvas = qrRef.current.querySelector("canvas");
            const url = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = url;
            link.download = `qr_${savedQrData.visitor_name.replace(
                /\s+/g,
                "_"
            )}.png`;
            link.click();
            toast.success("QR descargado correctamente");
        } catch (error) {
            console.error("Error downloading QR:", error);
            toast.error("Error al descargar el QR");
        }
    };

    const sendWhatsApp = async () => {
        try {
            toast.loading("Preparando QR para WhatsApp...");

            const qrURL = await uploadQRToCloudinary(qrRef);

            toast.dismiss();

            if (!qrURL) {
                toast.error("Error al subir el QR a la nube");
                return;
            }

            const message = `🔹 *Pre-registro de Visitante* 🔹\n\n👤 *Nombre:* ${
                savedQrData.visitor_name
            }\n🆔 *Documento:* ${savedQrData.document_id}\n🚗 *Placa:* ${
                savedQrData.vehicle_plate || "No registrado"
            }\n\n📎 *Código QR:* ${qrURL}\n\n✅ *Tipo:* ${
                qrOptions.type === "single_use"
                    ? "Uso único"
                    : qrOptions.type === "time_limited"
                    ? `Válido por ${qrOptions.duration} horas`
                    : `Recurrente - ${qrOptions.duration} horas, máximo ${qrOptions.maxUses} usos`
            }\n\n🏢 *Sistema GateKeeper*`;

            const whatsappURL = `https://api.whatsapp.com/send?text=${encodeURIComponent(
                message
            )}`;

            window.open(whatsappURL, "_blank");

            toast.success("¡QR enviado a WhatsApp!");
        } catch (error) {
            toast.dismiss();
            console.error("Error al enviar por WhatsApp:", error);

            if (error.message.includes("Failed to fetch")) {
                toast.error("Error de conexión. Verifica tu internet.");
            } else if (error.message.includes("Cloudinary")) {
                toast.error("Error al subir imagen. Intenta de nuevo.");
            } else {
                toast.error("Error al enviar por WhatsApp. Intenta de nuevo.");
            }
        }
    };

    const uploadQRToCloudinary = async (qrRef) => {
        try {
            if (!qrRef.current) {
                throw new Error("No se encontró el QR para subir");
            }

            const canvas = qrRef.current.querySelector("canvas");
            if (!canvas) {
                throw new Error("No se pudo obtener el canvas del QR");
            }

            const qrBlob = await new Promise((resolve) => {
                canvas.toBlob(resolve, "image/png", 1.0);
            });

            if (!qrBlob) {
                throw new Error("No se pudo generar la imagen del QR");
            }

            const formData = new FormData();
            formData.append("file", qrBlob);
            formData.append("upload_preset", UPLOAD_PRESET);
            formData.append("folder", "qr-codes"); // Organizar en carpeta

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                {
                    method: "POST",
                    body: formData,
                    signal: controller.signal,
                }
            );

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Error de Cloudinary: ${response.status}`);
            }

            const data = await response.json();

            if (!data.secure_url) {
                throw new Error("No se recibió URL de Cloudinary");
            }

            return data.secure_url;
        } catch (error) {
            console.error("Error en uploadQRToCloudinary:", error);

            if (error.name === "AbortError") {
                throw new Error("Timeout: La subida tardó demasiado");
            }

            throw error;
        }
    };

    const resetForm = () => {
        setVisitorInfo({
            name: "",
            id_document: "",
            vehicle_plate: "",
            user_id: userId,
        });
        setQrOptions({
            type: "single_use",
            duration: 24,
            maxUses: 1,
        });
        setSavedQrData(null);
        setIsQrSaved(false);
    };

    return (
        <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-xl dark:bg-gray-900 dark:border-gray-700">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-black rounded-full ">
                        <FaQrcode className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <Typography
                            as="h4"
                            variant="h4"
                            className="text-xl font-semibold text-gray-900 dark:text-white"
                        >
                            Generar Código QR
                        </Typography>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Crea códigos QR para visitantes
                        </p>
                    </div>
                </div>
            </div>

            {!isQrSaved ? (
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
                    <div className="mb-6">
                        <label className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-900 dark:text-white">
                            {qrOptions.type === "single_use" && (
                                <FaBullseye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            )}
                            {qrOptions.type === "time_limited" && (
                                <FaClock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            )}
                            {qrOptions.type === "recurring" && (
                                <FaRedoAlt className="w-4 h-4 text-green-600 dark:text-green-400" />
                            )}
                            Tipo de acceso
                        </label>
                        <select
                            value={qrOptions.type}
                            onChange={(e) =>
                                setQrOptions({
                                    ...qrOptions,
                                    type: e.target.value,
                                })
                            }
                            className="w-full px-4 py-3 text-gray-900 transition-colors duration-200 bg-white border border-gray-200 rounded-lg dark:text-gray-100 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                        >
                            <option value="single_use">Uso único</option>
                            <option value="time_limited">
                                Por tiempo limitado
                            </option>
                            <option value="recurring">Acceso recurrente</option>
                        </select>
                    </div>

                    {(qrOptions.type === "time_limited" ||
                        qrOptions.type === "recurring") && (
                        <div className="mb-6">
                            <label className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-900 dark:text-white">
                                <FaClock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                Duración
                            </label>
                            <select
                                value={qrOptions.duration}
                                onChange={(e) =>
                                    setQrOptions({
                                        ...qrOptions,
                                        duration: parseInt(e.target.value),
                                    })
                                }
                                className="w-full px-4 py-3 text-gray-900 transition-colors duration-200 bg-white border border-gray-200 rounded-lg dark:text-gray-100 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                            >
                                <option value={1}>1 hora</option>
                                <option value={2}>2 horas</option>
                                <option value={6}>6 horas</option>
                                <option value={12}>12 horas</option>
                                <option value={24}>1 día</option>
                                <option value={72}>3 días</option>
                                <option value={168}>1 semana</option>
                            </select>
                        </div>
                    )}

                    {qrOptions.type === "recurring" && (
                        <div className="mb-6">
                            <label className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-900 dark:text-white">
                                <FaQrcode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                Máximo de usos
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={qrOptions.maxUses}
                                onChange={(e) =>
                                    setQrOptions({
                                        ...qrOptions,
                                        maxUses: parseInt(e.target.value),
                                    })
                                }
                                className="w-full px-4 py-3 text-gray-900 transition-colors duration-200 bg-white border border-gray-200 rounded-lg dark:text-gray-100 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                            />
                        </div>
                    )}

                    <div className="mb-6 space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <FaUser className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Nombre del visitante"
                                value={visitorInfo.name}
                                onChange={(e) =>
                                    setVisitorInfo({
                                        ...visitorInfo,
                                        name: e.target.value,
                                    })
                                }
                                className="w-full py-3 pl-10 pr-4 text-gray-900 placeholder-gray-500 transition-colors duration-200 bg-white border border-gray-200 rounded-lg dark:text-gray-100 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:placeholder-gray-400"
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <FaIdCard className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Documento de identidad"
                                value={visitorInfo.id_document}
                                onChange={(e) =>
                                    setVisitorInfo({
                                        ...visitorInfo,
                                        id_document: e.target.value,
                                    })
                                }
                                className="w-full py-3 pl-10 pr-4 text-gray-900 placeholder-gray-500 transition-colors duration-200 bg-white border border-gray-200 rounded-lg dark:text-gray-100 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:placeholder-gray-400"
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <FaCar className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Placa del vehículo (opcional)"
                                value={visitorInfo.vehicle_plate}
                                onChange={(e) =>
                                    setVisitorInfo({
                                        ...visitorInfo,
                                        vehicle_plate: e.target.value,
                                    })
                                }
                                className="w-full py-3 pl-10 pr-4 text-gray-900 placeholder-gray-500 transition-colors duration-200 bg-white border border-gray-200 rounded-lg dark:text-gray-100 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:placeholder-gray-400"
                            />
                        </div>
                    </div>

                    <button
                        onClick={saveQrToDatabase}
                        disabled={
                            !visitorInfo.name ||
                            !visitorInfo.id_document ||
                            isSaving
                        }
                        className={`w-full flex items-center justify-center gap-3 px-6 py-3 font-medium rounded-lg transition-all duration-200 ${
                            !visitorInfo.name ||
                            !visitorInfo.id_document ||
                            isSaving
                                ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
                        }`}
                    >
                        {isSaving ? (
                            <>
                                <div className="w-4 h-4 border-2 rounded-full animate-spin border-white/30 border-t-white"></div>
                                <span>Guardando QR...</span>
                            </>
                        ) : (
                            <>
                                <FaSave className="w-4 h-4" />
                                <span>Guardar Código QR</span>
                            </>
                        )}
                    </button>
                </div>
            ) : (
                <div className="p-6">
                    <div className="flex items-center gap-3 p-4 mb-6 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-green-100 rounded-full dark:bg-green-800">
                            <FaCheck className="w-4 h-4 text-green-600 dark:text-green-300" />
                        </div>
                        <div>
                            <Typography
                                as="p"
                                variant="p"
                                className="font-medium text-green-900 dark:text-green-100"
                            >
                                QR guardado exitosamente
                            </Typography>
                            <Typography
                                as="p"
                                variant="p"
                                className="text-sm text-green-700 dark:text-green-300"
                            >
                                ID: {savedQrData.qr_id}
                            </Typography>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="relative p-4 mb-6 bg-white border-2 border-gray-200 rounded-lg shadow-sm dark:bg-gray-100 dark:border-gray-300">
                            <div ref={qrRef} className="relative">
                                <QRCodeCanvas
                                    value={generateQRDataForDisplay()}
                                    size={280}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>
                        </div>

                        <div className="w-full p-4 mb-6 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
                            <div className="text-center">
                                <div className="flex items-center justify-center w-10 h-10 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-600 to-blue-700">
                                    <span className="text-sm font-semibold text-white">
                                        {savedQrData.visitor_name
                                            .charAt(0)
                                            .toUpperCase()}
                                    </span>
                                </div>
                                <Typography
                                    as="h5"
                                    variant="h5"
                                    className="text-lg font-semibold text-gray-900 dark:text-gray-100"
                                >
                                    {savedQrData.visitor_name}
                                </Typography>
                                <Typography
                                    as="p"
                                    variant="p"
                                    className="mt-1 text-sm text-gray-600 dark:text-gray-400"
                                >
                                    {qrOptions.type === "single_use" && (
                                        <span className="flex items-center justify-center gap-2">
                                            <FaBullseye className="w-3 h-3" />
                                            Código de uso único
                                        </span>
                                    )}
                                    {qrOptions.type === "time_limited" && (
                                        <span className="flex items-center justify-center gap-2">
                                            <FaClock className="w-3 h-3" />
                                            Válido por {qrOptions.duration}{" "}
                                            horas
                                        </span>
                                    )}
                                    {qrOptions.type === "recurring" && (
                                        <span className="flex items-center justify-center gap-2">
                                            <FaRedoAlt className="w-3 h-3" />
                                            Válido por {qrOptions.duration}{" "}
                                            horas - Máximo {qrOptions.maxUses}{" "}
                                            usos
                                        </span>
                                    )}
                                </Typography>
                            </div>
                        </div>

                        <div className="w-full space-y-3">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <button
                                    onClick={downloadQR}
                                    className="flex items-center justify-center gap-2 px-4 py-3 text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    <FaDownload className="w-4 h-4" />
                                    <span>Descargar</span>
                                </button>

                                <button
                                    onClick={sendWhatsApp}
                                    className="flex items-center justify-center gap-2 px-4 py-3 text-white transition-colors duration-200 bg-green-600 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                >
                                    <FaWhatsapp className="w-4 h-4" />
                                    <span>WhatsApp</span>
                                </button>
                            </div>

                            <button
                                onClick={resetForm}
                                className="flex items-center justify-center w-full gap-2 px-4 py-3 text-gray-700 transition-colors duration-200 bg-gray-100 rounded-lg dark:text-gray-300 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                                <FaPlus className="w-4 h-4" />
                                <span>Crear Nuevo QR</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
