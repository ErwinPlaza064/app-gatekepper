import { QRCodeCanvas } from "qrcode.react";
import { useState, useRef } from "react";
import { FaDownload, FaWhatsapp, FaPlus } from "react-icons/fa";
import Typography from "@/Components/UI/Typography";
import axios from "axios";
import { toast } from "react-hot-toast";

const CLOUD_NAME = "dibbibwqd";
const UPLOAD_PRESET = "qr-gatekepper";

const uploadQRToCloudinary = async (qrRef) => {
    if (!qrRef.current) return null;
    const canvas = qrRef.current.querySelector("canvas");
    const qrImage = canvas.toDataURL("image/png");

    const formData = new FormData();
    formData.append("file", qrImage);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData
    );
    return response.data.secure_url;
};

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

            const response = await axios.post("/api/qr-codes", qrData, {
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
            });

            setSavedQrData(response.data.qr_code);
            setIsQrSaved(true);
            toast.success("QR guardado correctamente");
        } catch (error) {
            console.error("Error saving QR:", error);
            if (error.response?.data?.errors) {
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
        const canvas = qrRef.current.querySelector("canvas");
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = url;
        link.download = `qr_${savedQrData.visitor_name.replace(
            /\s+/g,
            "_"
        )}.png`;
        link.click();
    };

    const sendWhatsApp = async () => {
        try {
            const qrURL = await uploadQRToCloudinary(qrRef);
            if (!qrURL) {
                toast.error("Error al subir el QR a la nube");
                return;
            }

            const message = `🔹 *Pre-registro de Visitante* 🔹\n\n👤 *Nombre:* ${
                savedQrData.visitor_name
            }\n🆔 *Documento:* ${savedQrData.document_id}\n🚗 *Placa:* ${
                savedQrData.vehicle_plate || "No registrado"
            }\n📎 *QR:* ${qrURL}`;

            const whatsappURL = `https://api.whatsapp.com/send?text=${encodeURIComponent(
                message
            )}`;
            window.open(whatsappURL, "_blank");
        } catch (error) {
            console.error("Error al enviar por WhatsApp:", error);
            toast.error("Error al enviar por WhatsApp");
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
        <div className="p-5 bg-white rounded-lg shadow-md">
            <Typography
                as={"h4"}
                variant={"h4"}
                color={"black"}
                className="mb-3 text-lg font-semibold text-center"
            >
                Generar Código QR para Visitante
            </Typography>

            {!isQrSaved ? (
                <div>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
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
                            className="w-full p-2 mb-3 border rounded"
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
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium text-gray-700">
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
                                className="w-full p-2 mb-3 border rounded"
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
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium text-gray-700">
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
                                className="w-full p-2 mb-3 border rounded"
                            />
                        </div>
                    )}

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
                        className="w-full p-2 mb-3 border rounded"
                    />

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
                        className="w-full p-2 mb-3 border rounded"
                    />

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
                        className="w-full p-2 mb-4 border rounded"
                    />

                    <button
                        onClick={saveQrToDatabase}
                        disabled={
                            !visitorInfo.name ||
                            !visitorInfo.id_document ||
                            isSaving
                        }
                        className={`w-full px-4 py-3 text-white font-medium rounded transition duration-200 ${
                            !visitorInfo.name ||
                            !visitorInfo.id_document ||
                            isSaving
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {isSaving ? "Guardando QR..." : "Guardar Código QR"}
                    </button>
                </div>
            ) : (
                <div>
                    <div className="p-4 mb-4 border border-green-200 rounded-lg bg-green-50">
                        <div className="flex items-center">
                            <svg
                                className="w-5 h-5 mr-2 text-green-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <Typography
                                as="p"
                                variant="p"
                                color="black"
                                className="font-medium text-green-800"
                            >
                                QR guardado exitosamente
                            </Typography>
                        </div>
                        <Typography
                            as="p"
                            variant="p"
                            color="black"
                            className="mt-1 text-sm text-green-700"
                        >
                            ID: {savedQrData.qr_id}
                        </Typography>
                    </div>

                    <div className="flex flex-col items-center">
                        <div ref={qrRef} className="mb-4">
                            <QRCodeCanvas
                                value={generateQRDataForDisplay()}
                                size={200}
                            />
                        </div>

                        <div className="mb-4 text-center">
                            <Typography
                                as="h5"
                                variant="h5"
                                color="black"
                                className="font-medium"
                            >
                                {savedQrData.visitor_name}
                            </Typography>
                            <Typography
                                as="p"
                                variant="p"
                                color="black"
                                className="text-sm text-gray-600"
                            >
                                {qrOptions.type === "single_use" &&
                                    "Código de uso único"}
                                {qrOptions.type === "time_limited" &&
                                    `Válido por ${qrOptions.duration} horas`}
                                {qrOptions.type === "recurring" &&
                                    `Válido por ${qrOptions.duration} horas - Máximo ${qrOptions.maxUses} usos`}
                            </Typography>
                        </div>

                        <div className="flex flex-col w-full gap-3 sm:flex-row">
                            <button
                                onClick={downloadQR}
                                className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-white transition duration-200 bg-blue-600 rounded hover:bg-blue-700"
                            >
                                <FaDownload className="text-lg" /> Descargar QR
                            </button>
                            <button
                                onClick={sendWhatsApp}
                                className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-white transition duration-200 bg-green-600 rounded hover:bg-green-700"
                            >
                                <FaWhatsapp className="text-lg" /> Enviar por
                                WhatsApp
                            </button>
                        </div>

                        <button
                            onClick={resetForm}
                            className="flex items-center justify-center w-full gap-2 px-4 py-2 mt-3 text-gray-700 transition duration-200 bg-gray-200 rounded hover:bg-gray-300"
                        >
                            <FaPlus className="text-lg" /> Crear Nuevo QR
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
