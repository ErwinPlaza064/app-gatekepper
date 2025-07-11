import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";
import toast from "react-hot-toast";

export default function QRScanner({ onScanSuccess }) {
    const scannerRef = useRef(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => {});
                scannerRef.current.clear().catch(() => {});
            }
        };
    }, []);

    const startScanner = async () => {
        setErrorMessage("");
        setLoading(false);
        setScanning(true);

        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        html5QrCode
            .start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                async (decodedText) => {
                    setLoading(true);
                    try {
                        const data = JSON.parse(decodedText);
                        const formattedData = {
                            visitor_name: data.name,
                            document_id: data.id_document,
                            resident_id: data.user_id,
                            vehicle_plate: data.vehicle_plate,
                        };

                        await axios.post(
                            "http://127.0.0.1:8000/api/scan-qr",
                            formattedData
                        );
                        onScanSuccess(data);
                        toast.success("Visitante registrado correctamente");
                        await html5QrCode.stop();
                        setScanning(false);
                    } catch (error) {
                        setErrorMessage(
                            "Código QR inválido o error en el registro."
                        );
                        toast.error(
                            "Código QR inválido o error en el registro."
                        );
                        await html5QrCode.stop();
                        setScanning(false);
                    } finally {
                        setLoading(false);
                    }
                }
            )
            .catch((err) => {
                setErrorMessage("No se pudo iniciar la cámara.");
                setScanning(false);
            });
    };

    const scanFromFile = async (event) => {
        setErrorMessage("");
        setLoading(true);
        const file = event.target.files[0];
        if (!file) {
            setLoading(false);
            return;
        }
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;
        html5QrCode
            .scanFile(file, true)
            .then(async (decodedText) => {
                try {
                    const data = JSON.parse(decodedText);
                    const formattedData = {
                        visitor_name: data.name,
                        document_id: data.id_document,
                        resident_id: data.user_id,
                        vehicle_plate: data.vehicle_plate,
                    };

                    await axios.post(
                        "http://127.0.0.1:8000/api/scan-qr",
                        formattedData
                    );
                    onScanSuccess(data);
                    toast.success("Visitante registrado correctamente");
                } catch (error) {
                    setErrorMessage(
                        "Código QR inválido o error en el registro."
                    );
                    toast.error("Código QR inválido o error en el registro.");
                } finally {
                    setLoading(false);
                    html5QrCode.clear();
                }
            })
            .catch(() => {
                setErrorMessage("No se pudo leer el archivo.");
                setLoading(false);
                html5QrCode.clear();
            });
    };

    return (
        <div className="p-2 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center ">Escanear QR</h2>
            <div
                id="reader"
                className="flex justify-center mb-4"
                style={{ minHeight: 250 }}
            ></div>
            {!scanning && (
                <div className="flex flex-col items-center gap-2">
                    <button
                        onClick={startScanner}
                        className="px-4 py-2 text-white transition bg-blue-600 rounded hover:bg-blue-700"
                    >
                        Iniciar escaneo con cámara
                    </button>
                    <label className="text-blue-700 underline cursor-pointer">
                        Escanear desde archivo
                        <input
                            type="file"
                            accept="image/*"
                            onChange={scanFromFile}
                            className="hidden"
                        />
                    </label>
                </div>
            )}
            {loading && (
                <div className="flex items-center justify-center mt-4">
                    <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                    <span className="ml-2 text-blue-600">
                        Registrando visitante...
                    </span>
                </div>
            )}
            {errorMessage && (
                <p className="mt-2 text-center text-red-500">{errorMessage}</p>
            )}
        </div>
    );
}
