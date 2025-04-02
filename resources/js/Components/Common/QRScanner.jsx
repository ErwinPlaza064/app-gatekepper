import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import axios from "axios";

export default function QRScanner({ onScanSuccess }) {
    const scannerRef = useRef(null);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const scanner = new Html5QrcodeScanner("reader", {
            fps: 10,
            qrbox: { width: 250, height: 250 },
        });

        scanner.render(
            async (decodedText) => {
                console.log("Código QR detectado:", decodedText);
                try {
                    const data = JSON.parse(decodedText);
                    console.log("JSON decodificado:", data);
                    scanner.clear();

                    // Aquí se formatea el JSON antes de enviarlo
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
                            onScanSuccess(data);
                            alert("Visitante registrado correctamente");
                        })
                        .catch((error) => {
                            console.error(
                                "Error en la respuesta del backend:",
                                error.response.data
                            );
                            setErrorMessage(
                                "Error en el registro: " +
                                    JSON.stringify(error.response.data)
                            );
                        });
                } catch (error) {
                    setErrorMessage(
                        "Código QR inválido o error en el registro."
                    );
                }
            },
            (error) => {
                setErrorMessage(error);
            }
        );

        return () => {
            scanner.clear();
        };
    }, [onScanSuccess]);

    return (
        <div>
            <div id="reader"></div>
            {errorMessage && (
                <p className="mt-2 text-red-500">{errorMessage}</p>
            )}
        </div>
    );
}
