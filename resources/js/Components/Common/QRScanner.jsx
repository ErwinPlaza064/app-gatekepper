import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function QRScanner({ onScanSuccess }) {
    const scannerRef = useRef(null);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const scanner = new Html5QrcodeScanner("reader", {
            fps: 10,
            qrbox: { width: 250, height: 250 },
        });

        scanner.render(
            (decodedText) => {
                try {
                    const data = JSON.parse(decodedText); // Convertir a JSON
                    scanner.clear();
                    onScanSuccess(data); // Enviar objeto JSON
                } catch (error) {
                    setErrorMessage(
                        "Código QR inválido: no es un JSON válido."
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
