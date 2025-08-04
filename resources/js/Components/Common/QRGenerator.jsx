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
            let API_URL =
                import.meta.env.VITE_API_URL ||
                "https://app-gatekepper-production.up.railway.app";

            if (API_URL.startsWith("http://")) {
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
        <div className="relative overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30">
            {/* Header con gradiente negro */}
            <div className="relative px-8 py-6 bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl">
                        <FaQrcode className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <Typography
                            as="h4"
                            variant="h4"
                            className="text-2xl font-bold text-white drop-shadow-lg"
                        >
                            Generar Código QR
                        </Typography>
                        <p className="text-sm text-white/80 mt-1">
                            Crea códigos QR para visitantes
                        </p>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            </div>

            {!isQrSaved ? (
                <div className="p-8 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm">
                    {/* Tipo de acceso */}
                    <div className="mb-6">
                        <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {qrOptions.type === "single_use" && (
                                <FaBullseye className="w-4 h-4 text-blue-600" />
                            )}
                            {qrOptions.type === "time_limited" && (
                                <FaClock className="w-4 h-4 text-orange-600" />
                            )}
                            {qrOptions.type === "recurring" && (
                                <FaRedoAlt className="w-4 h-4 text-green-600" />
                            )}
                            Tipo de acceso:
                        </label>
                        <select
                            value={qrOptions.type}
                            onChange={(e) =>
                                setQrOptions({
                                    ...qrOptions,
                                    type: e.target.value,
                                })
                            }
                            className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-transparent transition-all duration-300 hover:bg-white dark:hover:bg-gray-800"
                        >
                            <option value="single_use">Uso único</option>
                            <option value="time_limited">
                                Por tiempo limitado
                            </option>
                            <option value="recurring">Acceso recurrente</option>
                        </select>
                    </div>

                    {/* Duración */}
                    {(qrOptions.type === "time_limited" ||
                        qrOptions.type === "recurring") && (
                        <div className="mb-6">
                            <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                <FaClock className="w-4 h-4" />
                                Duración:
                            </label>
                            <select
                                value={qrOptions.duration}
                                onChange={(e) =>
                                    setQrOptions({
                                        ...qrOptions,
                                        duration: parseInt(e.target.value),
                                    })
                                }
                                className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-transparent transition-all duration-300 hover:bg-white dark:hover:bg-gray-800"
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

                    {/* Máximo usos */}
                    {qrOptions.type === "recurring" && (
                        <div className="mb-6">
                            <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                <FaQrcode className="w-4 h-4" />
                                Máximo de usos:
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
                                className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-transparent transition-all duration-300 hover:bg-white dark:hover:bg-gray-800"
                            />
                        </div>
                    )}

                    {/* Información del visitante */}
                    <div className="space-y-4 mb-6">
                        {/* Nombre */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FaUser className="h-5 w-5 text-gray-400 group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition-colors" />
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
                                className="w-full pl-14 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-transparent transition-all duration-300 hover:bg-white dark:hover:bg-gray-800"
                            />
                        </div>

                        {/* Documento */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FaIdCard className="h-5 w-5 text-gray-400 group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition-colors" />
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
                                className="w-full pl-14 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-transparent transition-all duration-300 hover:bg-white dark:hover:bg-gray-800"
                            />
                        </div>

                        {/* Placa */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FaCar className="h-5 w-5 text-gray-400 group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition-colors" />
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
                                className="w-full pl-14 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-transparent transition-all duration-300 hover:bg-white dark:hover:bg-gray-800"
                            />
                        </div>
                    </div>

                    {/* Botón guardar */}
                    <button
                        onClick={saveQrToDatabase}
                        disabled={
                            !visitorInfo.name ||
                            !visitorInfo.id_document ||
                            isSaving
                        }
                        className={`group relative w-full flex items-center justify-center gap-3 px-6 py-4 font-semibold rounded-2xl shadow-xl border transition-all duration-300 backdrop-blur-sm ${
                            !visitorInfo.name ||
                            !visitorInfo.id_document ||
                            isSaving
                                ? "bg-gray-400 dark:bg-gray-600 text-gray-200 border-gray-300 dark:border-gray-700 cursor-not-allowed"
                                : "bg-gradient-to-r from-black via-gray-900 to-black text-white border-white/10 hover:from-gray-900 hover:via-black hover:to-gray-900 hover:shadow-2xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/20"
                        }`}
                    >
                        {isSaving ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                                <span className="drop-shadow-sm">
                                    Guardando QR...
                                </span>
                            </>
                        ) : (
                            <>
                                <FaSave className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                                <span className="drop-shadow-sm">
                                    Guardar Código QR
                                </span>
                            </>
                        )}
                        {!isSaving &&
                            !(
                                !visitorInfo.name || !visitorInfo.id_document
                            ) && (
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            )}
                    </button>
                </div>
            ) : (
                <div className="p-8">
                    {/* Mensaje de éxito */}
                    <div className="flex items-center gap-3 p-4 mb-6 bg-green-50/80 dark:bg-green-900/20 border border-green-200/50 dark:border-green-800/50 rounded-2xl backdrop-blur-sm">
                        <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-800/50 rounded-xl flex-shrink-0">
                            <FaCheck className="w-5 h-5 text-green-600 dark:text-green-300" />
                        </div>
                        <div>
                            <Typography
                                as="p"
                                variant="p"
                                className="font-semibold text-green-800 dark:text-green-200"
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
                        {/* QR Code Display */}
                        <div className="relative p-6 mb-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-100 dark:to-white rounded-3xl shadow-inner border-4 border-gray-200/50">
                            <div ref={qrRef} className="relative">
                                <QRCodeCanvas
                                    value={generateQRDataForDisplay()}
                                    size={320}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                        </div>

                        {/* Información del visitante */}
                        <div className="w-full p-6 mb-6 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                            <div className="text-center mb-4">
                                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl">
                                    <span className="text-lg font-bold text-white">
                                        {savedQrData.visitor_name
                                            .charAt(0)
                                            .toUpperCase()}
                                    </span>
                                </div>
                                <Typography
                                    as="h5"
                                    variant="h5"
                                    className="text-xl font-bold text-gray-900 dark:text-gray-100"
                                >
                                    {savedQrData.visitor_name}
                                </Typography>
                                <Typography
                                    as="p"
                                    variant="p"
                                    className="text-sm text-gray-600 dark:text-gray-400 mt-1"
                                >
                                    {qrOptions.type === "single_use" && (
                                        <span className="flex items-center gap-2 justify-center">
                                            <FaBullseye className="w-3 h-3" />
                                            Código de uso único
                                        </span>
                                    )}
                                    {qrOptions.type === "time_limited" && (
                                        <span className="flex items-center gap-2 justify-center">
                                            <FaClock className="w-3 h-3" />
                                            Válido por {qrOptions.duration}{" "}
                                            horas
                                        </span>
                                    )}
                                    {qrOptions.type === "recurring" && (
                                        <span className="flex items-center gap-2 justify-center">
                                            <FaRedoAlt className="w-3 h-3" />
                                            Válido por {qrOptions.duration}{" "}
                                            horas - Máximo {qrOptions.maxUses}{" "}
                                            usos
                                        </span>
                                    )}
                                </Typography>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="w-full space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                    onClick={downloadQR}
                                    className="group flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white font-semibold rounded-2xl shadow-xl border border-blue-500/20 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 hover:shadow-2xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 backdrop-blur-sm"
                                >
                                    <FaDownload className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                    <span className="drop-shadow-sm">
                                        Descargar
                                    </span>
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                </button>

                                <button
                                    onClick={sendWhatsApp}
                                    className="group flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white font-semibold rounded-2xl shadow-xl border border-green-500/20 hover:from-green-700 hover:via-green-800 hover:to-green-900 hover:shadow-2xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-400/50 transition-all duration-300 backdrop-blur-sm"
                                >
                                    <FaWhatsapp className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                    <span className="drop-shadow-sm">
                                        WhatsApp
                                    </span>
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                </button>
                            </div>

                            <button
                                onClick={resetForm}
                                className="group relative w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-black via-gray-900 to-black text-white font-semibold rounded-2xl shadow-xl border border-white/10 hover:from-gray-900 hover:via-black hover:to-gray-900 hover:shadow-2xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300 backdrop-blur-sm"
                            >
                                <FaPlus className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                <span className="drop-shadow-sm">
                                    Crear Nuevo QR
                                </span>
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
