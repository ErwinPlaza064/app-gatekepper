import { QRCodeCanvas } from "qrcode.react";
import { useState, useRef } from "react";
import Typography from "@/Components/UI/Typography";
import axios from "axios";

// Cloudinary config
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

    const qrRef = useRef(null);

    const generateQRId = () => {
        return (
            "qr_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
        );
    };

    const calculateExpirationDate = (hours) => {
        const now = new Date();
        return new Date(now.getTime() + hours * 60 * 60 * 1000);
    };

    const generateQRData = () => {
        const qrId = generateQRId();
        let qrData = {
            ...visitorInfo,
            qr_id: qrId,
            qr_type: qrOptions.type,
            created_at: new Date().toISOString(),
            max_uses: qrOptions.maxUses,
        };

        if (
            qrOptions.type === "time_limited" ||
            qrOptions.type === "recurring"
        ) {
            qrData.valid_until = calculateExpirationDate(
                qrOptions.duration
            ).toISOString();
        }

        return qrData;
    };

    const downloadQR = () => {
        const canvas = qrRef.current.querySelector("canvas");
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = url;
        link.download = "codigo_qr.png";
        link.click();
    };

    const sendWhatsApp = async () => {
        try {
            const qrURL = await uploadQRToCloudinary(qrRef);
            if (!qrURL) {
                console.error("Error: No se obtuvo la URL del QR.");
                return;
            }

            const message = `🔹 *Pre-registro de Visitante* 🔹\n\n👤 *Nombre:* ${
                visitorInfo.name
            }\n🆔 *Documento:* ${visitorInfo.id_document}\n🚗 *Placa:* ${
                visitorInfo.vehicle_plate || "No registrado"
            }\n📎 *QR:* ${qrURL}`;

            const whatsappURL = `https://api.whatsapp.com/send?text=${encodeURIComponent(
                message
            )}`;
            window.open(whatsappURL, "_blank");
        } catch (error) {
            console.error("Error al subir el QR:", error);
        }
    };

    return (
        <div className="p-5 bg-white rounded-lg shadow-md md:flex-col">
            <Typography
                as={"h4"}
                variant={"h4"}
                color={"black"}
                className="mb-3 text-lg font-semibold text-center"
            >
                Generar Código QR para Visitante
            </Typography>

            <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                    Tipo de acceso:
                </label>
                <select
                    value={qrOptions.type}
                    onChange={(e) =>
                        setQrOptions({ ...qrOptions, type: e.target.value })
                    }
                    className="w-full p-2 mb-3 border rounded"
                >
                    <option value="single_use">Uso único</option>
                    <option value="time_limited">Por tiempo limitado</option>
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
                    setVisitorInfo({ ...visitorInfo, name: e.target.value })
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
                placeholder="Placa del vehículo"
                value={visitorInfo.vehicle_plate}
                onChange={(e) =>
                    setVisitorInfo({
                        ...visitorInfo,
                        vehicle_plate: e.target.value,
                    })
                }
                className="w-full p-2 mb-3 border rounded"
            />

            {visitorInfo.name && visitorInfo.id_document && (
                <div className="flex flex-col items-center mt-3">
                    <div ref={qrRef}>
                        <QRCodeCanvas
                            value={JSON.stringify(generateQRData())}
                            size={150}
                        />
                    </div>

                    <Typography
                        as={"p"}
                        variant={"p"}
                        color={"black"}
                        className="mt-2 text-sm text-center text-gray-600"
                    >
                        {qrOptions.type === "single_use" &&
                            "Código de uso único"}
                        {qrOptions.type === "time_limited" &&
                            `Válido por ${qrOptions.duration} horas`}
                        {qrOptions.type === "recurring" &&
                            `Válido por ${qrOptions.duration} horas - Máximo ${qrOptions.maxUses} usos`}
                    </Typography>

                    <div className="flex items-center justify-center mt-3 space-x-2">
                        <button
                            onClick={downloadQR}
                            className="px-4 py-2 text-white transition duration-200 bg-blue-600 rounded hover:bg-blue-700"
                        >
                            Descargar QR
                        </button>
                        <button
                            onClick={sendWhatsApp}
                            className="px-4 py-2 text-white transition bg-green-600 rounded durarion-200 hover:bg-green-800"
                        >
                            Enviar por WhatsApp
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
