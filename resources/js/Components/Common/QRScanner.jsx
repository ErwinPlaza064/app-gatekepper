import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";

export default function QRScanner({ onScanSuccess }) {
    const scannedQRCodes = useRef(new Set());
    const [errorMessage, setErrorMessage] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner("reader", {
            fps: 10,
            qrbox: { width: 250, height: 250 },
        });

        scanner.render(
            async (decodedText) => {
                console.log("Código QR detectado:", decodedText);

                if (isProcessing) {
                    console.log(
                        "Escaneo ignorado porque ya se está procesando otro QR."
                    );
                    return;
                }

                try {
                    const data = JSON.parse(decodedText);
                    console.log("JSON decodificado:", data);

                    if (scannedQRCodes.current.has(decodedText)) {
                        alert(
                            "Este código QR ya fue escaneado en esta sesión."
                        );
                        return;
                    }

                    setIsProcessing(true);

                    const formattedData = {
                        visitor_name: data.name,
                        document_id: data.id_document,
                        resident_id: data.user_id,
                        vehicle_plate: data.vehicle_plate,
                    };

                    await axios
                        .post(
                            "http://127.0.0.1:8000/api/scan-qr",
                            formattedData
                        )
                        .then((response) => {
                            console.log(
                                "Respuesta del backend:",
                                response.data
                            );
                            alert("Visitante registrado correctamente");
                            onScanSuccess(data);
                            scannedQRCodes.current.add(decodedText);
                        })
                        .catch((error) => {
                            if (
                                error.response &&
                                error.response.status === 400
                            ) {
                                alert("Este código QR ya ha sido escaneado.");
                            } else {
                                alert("Error en el registro.");
                            }
                            console.error(
                                "Error en la respuesta del backend:",
                                error.response.data
                            );
                            setErrorMessage(
                                "Error en el registro: " +
                                    JSON.stringify(error.response.data)
                            );
                        })
                        .finally(() => {
                            setIsProcessing(false);
                        });
                } catch (error) {
                    setErrorMessage(
                        "Código QR inválido o error en el registro."
                    );
                    setIsProcessing(false);
                }
            },
            (error) => {
                setErrorMessage(error);
            }
        );

        return () => {
            scanner.clear();
        };
    }, [onScanSuccess, isProcessing]);

    return (
        <div>
            <div id="reader"></div>
            {errorMessage && (
                <p className="mt-2 text-red-500">{errorMessage}</p>
            )}
        </div>
    );
}
