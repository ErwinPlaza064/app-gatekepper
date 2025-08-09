import React from 'react';
import { Head } from '@inertiajs/react';

export default function Error({ message }) {
    return (
        <>
            <Head title="Error de Aprobación" />
            
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                        {/* Header */}
                        <div className="bg-red-50 border-b border-red-200 px-6 py-4">
                            <div className="flex items-center">
                                <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h1 className="text-lg font-semibold text-red-900">Enlace No Válido</h1>
                                    <p className="text-sm text-red-700">Error al procesar la solicitud</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-6 space-y-6">
                            {/* Main message */}
                            <div className="text-center">
                                <p className="text-gray-700 leading-relaxed">
                                    {message}
                                </p>
                            </div>

                            {/* Possible causes */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    Posibles causas:
                                </h3>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li className="flex items-start">
                                        <span className="text-gray-400 mr-2 mt-0.5">•</span>
                                        <span>El enlace ha expirado (más de 7 minutos desde el envío)</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-gray-400 mr-2 mt-0.5">•</span>
                                        <span>El visitante ya fue aprobado o rechazado previamente</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-gray-400 mr-2 mt-0.5">•</span>
                                        <span>El enlace es inválido o fue modificado</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Instructions */}
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    ¿Qué puedes hacer?
                                </h3>
                                <p className="text-sm text-blue-700 leading-relaxed">
                                    Contacta directamente con el personal de seguridad o solicita un nuevo enlace de aprobación. 
                                    También puedes usar la aplicación web del sistema para gestionar tus visitantes.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col space-y-3">
                                <button 
                                    onClick={() => window.history.back()}
                                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Volver Atrás
                                </button>
                                
                                <p className="text-center text-xs text-gray-500">
                                    O contacta al personal de seguridad para asistencia
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                            <div className="flex items-center justify-center text-gray-500">
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-medium">Sistema Gatekeeper</span>
                            </div>
                            <p className="text-center text-xs text-gray-400 mt-1">Control de Acceso Inteligente</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
