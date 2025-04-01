import { QRCodeCanvas } from "qrcode.react";
import { useState, useRef } from "react";

export default function QRGenerator() {
    const [visitorInfo, setVisitorInfo] = useState({ name: "" });
    const qrRef = useRef(null);

    const downloadQR = () => {
        const canvas = qrRef.current.querySelector("canvas");
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = url;
        link.download = "codigo_qr.png";
        link.click();
    };

    return (
        <div>
            <h2 className="mb-3 text-lg font-semibold text-center">
                Generar Código QR para Visitante
            </h2>

            <input
                type="text"
                placeholder="Nombre del visitante"
                value={visitorInfo.name}
                onChange={(e) =>
                    setVisitorInfo({ ...visitorInfo, name: e.target.value })
                }
                className="w-full p-2 mb-3 border rounded"
            />

            {visitorInfo.name && (
                <div className="flex flex-col items-center mt-3">
                    <div ref={qrRef}>
                        <QRCodeCanvas
                            value={JSON.stringify(visitorInfo)}
                            size={150}
                        />
                    </div>

                    <p className="mt-2 text-sm text-gray-600">
                        Escanea este código QR al ingresar.
                    </p>

                    <button
                        onClick={downloadQR}
                        className="px-4 py-2 mt-3 text-white bg-blue-600 rounded"
                    >
                        Descargar QR
                    </button>
                </div>
            )}
        </div>
    );
}
