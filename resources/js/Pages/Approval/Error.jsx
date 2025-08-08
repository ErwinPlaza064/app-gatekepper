import React from 'react';
import { Head } from '@inertiajs/react';

export default function Error({ message }) {
    return (
        <>
            <Head title="Error de Aprobación" />
            
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        {/* Icono de error */}
                        <div className="mb-6">
                            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        </div>

                        {/* Título */}
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            ❌ Error de Aprobación
                        </h1>

                        {/* Mensaje */}
                        <p className="text-gray-600 mb-6">
                            {message}
                        </p>

                        {/* Posibles causas */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                            <h3 className="font-semibold text-red-800 mb-2">Posibles causas:</h3>
                            <ul className="text-sm text-red-700 space-y-1">
                                <li>• El enlace ha expirado (más de 7 minutos)</li>
                                <li>• El visitante ya fue procesado</li>
                                <li>• El enlace es inválido o fue modificado</li>
                            </ul>
                        </div>

                        {/* Instrucciones */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-gray-700 text-sm">
                                Si necesitas aprobar o rechazar un visitante, contacta directamente con el personal de seguridad o solicita un nuevo enlace.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                                🏘️ Sistema Gatekeeper
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
