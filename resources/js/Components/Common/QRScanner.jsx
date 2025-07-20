import { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function QRScanner({ onScanSuccess }) {
    // Verificar soporte de cámara
    const [cameraSupported, setCameraSupported] = useState(true);

    useEffect(() => {
        // Verifica si el navegador soporta getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setCameraSupported(false);
        }
    }, []);
    const [scanning, setScanning] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const scannerRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);

    // Cleanup al desmontar el componente
    useEffect(() => {
        return () => {
            stopScanner();
        };
    }, []);

    const validateQRCode = (data) => {
        const now = new Date();

        if (data.valid_until) {
            const expiration = new Date(data.valid_until);
            if (now > expiration) {
                throw new Error("El código QR ha expirado");
            }
        }

        return true;
    };

    const stopScanner = async () => {
        if (scannerRef.current && isScanning) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch (error) {
                console.log("Scanner already stopped");
            } finally {
                setScanning(false);
                setIsScanning(false);
                scannerRef.current = null;
            }
        }
    };

    const startScanner = async () => {
        // Detener scanner anterior si existe
        await stopScanner();

        setErrorMessage("");
        setLoading(false);
        setScanning(true);

        try {
            const html5QrCode = new Html5Qrcode("reader");
            scannerRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                async (decodedText) => {
                    if (loading) return; // Prevenir múltiples escaneos

                    setLoading(true);
                    setIsScanning(true);

                    try {
                        const data = JSON.parse(decodedText);

                        // Validar QR antes de enviar
                        validateQRCode(data);

                        const formattedData = {
                            qr_id: data.qr_id,
                            visitor_name: data.name,
                            document_id: data.id_document,
                            resident_id: data.user_id,
                            vehicle_plate: data.vehicle_plate,
                            qr_type: data.qr_type,
                            qr_data: data,
                        };

                        const response = await axios.post(
                            "http://127.0.0.1:8000/api/scan-qr",
                            formattedData
                        );

                        onScanSuccess(data);
                        toast.success(
                            response.data.message ||
                                "Visitante registrado correctamente"
                        );

                        // Detener scanner después del éxito
                        await stopScanner();
                    } catch (error) {
                        let errorMessage =
                            "Código QR inválido o error en el registro.";

                        if (error.response?.status === 400) {
                            errorMessage =
                                error.response.data.message ||
                                "Código QR inválido o expirado";
                        } else if (error.response?.data?.message) {
                            errorMessage = error.response.data.message;
                        } else if (error.message) {
                            errorMessage = error.message;
                        }

                        setErrorMessage(errorMessage);
                        toast.error(errorMessage);

                        // Detener scanner en caso de error
                        await stopScanner();
                    } finally {
                        setLoading(false);
                    }
                },
                (errorMessage) => {
                    // Error de escaneo silencioso
                }
            );

            setIsScanning(true);
        } catch (err) {
            console.error("Error starting scanner:", err);
            setErrorMessage(
                "No se pudo iniciar la cámara. Verifica los permisos."
            );
            setScanning(false);
            setIsScanning(false);
        }
    };

    const scanFromFile = async (event) => {
        setErrorMessage("");
        setLoading(true);

        const file = event.target.files[0];
        if (!file) {
            setLoading(false);
            return;
        }

        // Detener scanner si está corriendo
        await stopScanner();

        try {
            const html5QrCode = new Html5Qrcode("reader");
            scannerRef.current = html5QrCode;

            const decodedText = await html5QrCode.scanFile(file, true);

            try {
                const data = JSON.parse(decodedText);

                validateQRCode(data);

                const formattedData = {
                    qr_id: data.qr_id,
                    visitor_name: data.name,
                    document_id: data.id_document,
                    resident_id: data.user_id,
                    vehicle_plate: data.vehicle_plate,
                    qr_type: data.qr_type,
                    qr_data: data,
                };

                const response = await axios.post(
                    "http://127.0.0.1:8000/api/scan-qr",
                    formattedData
                );

                onScanSuccess(data);
                toast.success(
                    response.data.message ||
                        "Visitante registrado correctamente"
                );
            } catch (error) {
                let errorMessage = "Código QR inválido o error en el registro.";

                if (error.response?.status === 400) {
                    errorMessage =
                        error.response.data.message ||
                        "Código QR inválido o expirado";
                } else if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error.message) {
                    errorMessage = error.message;
                }

                setErrorMessage(errorMessage);
                toast.error(errorMessage);
            }
        } catch (error) {
            setErrorMessage("No se pudo leer el archivo QR.");
            toast.error("No se pudo leer el archivo QR.");
        } finally {
            setLoading(false);
            if (scannerRef.current) {
                try {
                    scannerRef.current.clear();
                } catch (e) {
                    console.log("Scanner already cleared");
                }
                scannerRef.current = null;
            }
        }
    };

    return (
        <div className="p-5 bg-white rounded-lg shadow-md">
            <h4 className="mb-3 text-lg font-semibold text-center">
                Escanear Código QR
            </h4>

            {!cameraSupported && (
                <div className="p-4 mb-4 text-yellow-800 bg-yellow-100 border border-yellow-300 rounded">
                    <b>Tu navegador no soporta el acceso a la cámara.</b>
                    <br />
                    Usa Chrome, Firefox o Safari y asegúrate de acceder por
                    HTTPS para escanear QR con la cámara.
                    <br />
                    También puedes subir una imagen QR.
                </div>
            )}

            {errorMessage && (
                <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-300 rounded">
                    {errorMessage}
                </div>
            )}

            {loading && (
                <div className="p-4 mb-4 text-blue-700 bg-blue-100 border border-blue-300 rounded">
                    Procesando código QR...
                </div>
            )}

            <div className="flex flex-col items-center space-y-4">
                {!scanning ? (
                    <div className="w-full space-y-4">
                        <button
                            onClick={startScanner}
                            className="w-full px-4 py-2 text-white transition duration-200 bg-blue-600 rounded hover:bg-blue-700"
                            disabled={!cameraSupported}
                        >
                            Iniciar Escáner
                        </button>

                        <div className="text-center">
                            <span className="text-gray-500">o</span>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                Subir imagen QR:
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={scanFromFile}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="w-full space-y-4">
                        <div
                            id="reader"
                            className="w-full border border-gray-300 rounded"
                            style={{ minHeight: "300px" }}
                        ></div>

                        <button
                            onClick={stopScanner}
                            className="w-full px-4 py-2 text-white transition duration-200 bg-red-600 rounded hover:bg-red-700"
                        >
                            Detener Escáner
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
