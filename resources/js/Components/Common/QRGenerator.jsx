import { QRCodeCanvas } from "qrcode.react";
import { useState, useRef } from "react";
import Typography from "@/Components/UI/Typography";
import {
    getStorage,
    ref,
    uploadString,
    getDownloadURL,
} from "firebase/storage";
import { initializeApp } from "firebase/app";

export default function QRGenerator({ userId }) {
    const firebaseConfig = {
        apiKey: "AIzaSyDNrtfvpzs7kMoh7KLk7wUnaJuxp94ovzY",
        authDomain: "app-gatekepper.firebaseapp.com",
        projectId: "app-gatekepper",
        storageBucket: "app-gatekepper.firebasestorage.app",
        messagingSenderId: "879293731964",
        appId: "1:879293731964:web:91a704ccdcbc23734ee5f9",
    };

    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);

    const uploadQRToFirebase = async (qrRef) => {
        if (!qrRef.current) return;

        const canvas = qrRef.current.querySelector("canvas");
        const qrImage = canvas.toDataURL("image/png");

        const storageRef = ref(storage, `qr-codes/${Date.now()}.png`);
        await uploadString(storageRef, qrImage.split(",")[1], "base64");

        return await getDownloadURL(storageRef);
    };

    const [visitorInfo, setVisitorInfo] = useState({
        name: "",
        id_document: "",
        vehicle_plate: "",
        user_id: userId,
    });

    const qrRef = useRef(null);

    const downloadQR = () => {
        const canvas = qrRef.current.querySelector("canvas");
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = url;
        link.download = "codigo_qr.png";
        link.click();
    };

    const sendWhatsApp = async () => {
        console.log("Subiendo QR...");

        try {
            const qrURL = await uploadQRToFirebase(qrRef);
            console.log("QR subido:", qrURL);

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

            console.log("Abriendo WhatsApp con URL:", whatsappURL);
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
                placeholder="Placa del vehículo (opcional)"
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
                            value={JSON.stringify(visitorInfo)}
                            size={150}
                        />
                    </div>

                    <Typography
                        as={"p"}
                        variant={"p"}
                        color={"black"}
                        className="mt-2 text-sm text-gray-600"
                    >
                        Escanea este código QR al ingresar.
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
