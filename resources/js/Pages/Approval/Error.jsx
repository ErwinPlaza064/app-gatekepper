import React from 'react';
import { Head } from '@inertiajs/react';

export default function Error({ message }) {
    return (
        <>
            <Head title="Error de Aprobación" />
            
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-100 flex items-center justify-center px-4">
                <div className="max-w-lg w-full">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 text-center border border-red-100">
                        {/* Icono de error animado */}
                        <div className="mb-8">
                            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                        </div>

                        {/* Título */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            🚫 Enlace No Válido
                        </h1>

                        {/* Mensaje */}
                        <p className="text-gray-700 mb-8 text-lg leading-relaxed">
                            {message}
                        </p>

                        {/* Posibles causas */}
                        <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-6 mb-8 text-left">
                            <h3 className="font-bold text-red-800 mb-3 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                Posibles causas:
                            </h3>
                            <ul className="text-sm text-red-700 space-y-2">
                                <li className="flex items-start">
                                    <span className="text-red-500 mr-2">•</span>
                                    <span>El enlace ha expirado (más de 7 minutos desde el envío)</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-red-500 mr-2">•</span>
                                    <span>El visitante ya fue aprobado o rechazado previamente</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-red-500 mr-2">•</span>
                                    <span>El enlace es inválido o fue modificado</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-red-500 mr-2">•</span>
                                    <span>Problemas temporales del sistema</span>
                                </li>
                            </ul>
                        </div>

                        {/* Instrucciones */}
                        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-6 mb-8">
                            <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                ¿Qué puedes hacer?
                            </h3>
                            <p className="text-blue-700 text-sm leading-relaxed">
                                Si necesitas aprobar o rechazar un visitante, contacta directamente con el personal de seguridad 
                                o solicita un nuevo enlace de aprobación. También puedes usar la aplicación web del sistema para 
                                gestionar tus visitantes.
                            </p>
                        </div>

                        {/* Botones de acción */}
                        <div className="space-y-3">
                            <button 
                                onClick={() => window.history.back()}
                                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Volver Atrás
                            </button>
                            
                            <p className="text-gray-500 text-sm">
                                O contacta al personal de seguridad para asistencia
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="flex items-center justify-center text-gray-500">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-medium">Sistema Gatekeeper</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Control de Acceso Inteligente</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
