import React from 'react';
import { Head } from '@inertiajs/react';

export default function Success({ message, visitor, auto_approved = false }) {
    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <>
            <Head title="Visitante Aprobado" />
            
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex items-center justify-center px-4">
                <div className="max-w-lg w-full">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 text-center border border-green-100">
                        {/* Icono de éxito animado */}
                        <div className="mb-8">
                            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>

                        {/* Título */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            {auto_approved ? '⏰ Aprobación Automática' : '✅ Visitante Aprobado'}
                        </h1>

                        {/* Mensaje principal */}
                        <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-6 mb-8">
                            <p className="text-green-800 font-medium text-lg">
                                {message}
                            </p>
                        </div>

                        {/* Información del visitante */}
                        {visitor && (
                            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left border border-gray-200">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    Detalles del Visitante
                                </h3>
                                <div className="grid grid-cols-1 gap-3 text-sm">
                                    <div className="flex justify-between border-b border-gray-200 pb-2">
                                        <span className="font-medium text-gray-600">Nombre:</span>
                                        <span className="text-gray-900 font-semibold">{visitor.name}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-200 pb-2">
                                        <span className="font-medium text-gray-600">Documento:</span>
                                        <span className="text-gray-900">{visitor.id_document}</span>
                                    </div>
                                    {visitor.vehicle_plate && (
                                        <div className="flex justify-between border-b border-gray-200 pb-2">
                                            <span className="font-medium text-gray-600">Vehículo:</span>
                                            <span className="text-gray-900 font-mono">{visitor.vehicle_plate}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between border-b border-gray-200 pb-2">
                                        <span className="font-medium text-gray-600">Hora de Entrada:</span>
                                        <span className="text-gray-900">{formatDateTime(visitor.entry_time)}</span>
                                    </div>
                                    {visitor.user && (
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-600">Residente:</span>
                                            <span className="text-gray-900">{visitor.user.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Mensaje de estado */}
                        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-6 mb-8">
                            <div className="flex items-start">
                                <svg className="w-6 h-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <h4 className="font-bold text-blue-800 mb-1">¡Acceso Autorizado!</h4>
                                    <p className="text-blue-700 text-sm leading-relaxed">
                                        El personal de seguridad ha sido notificado automáticamente. 
                                        El visitante puede proceder al ingreso ahora mismo.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Información adicional para auto-aprobación */}
                        {auto_approved && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-6">
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-yellow-800 text-sm">
                                        <strong>Nota:</strong> Este visitante fue aprobado automáticamente debido al vencimiento 
                                        del tiempo límite para respuesta (7 minutos).
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Botón de acción */}
                        <div className="mb-8">
                            <button 
                                onClick={() => window.close()}
                                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Cerrar Ventana
                            </button>
                        </div>

                        {/* Footer mejorado */}
                        <div className="pt-6 border-t border-gray-200">
                            <div className="flex items-center justify-center text-gray-500 mb-2">
                                <svg className="w-6 h-6 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-bold">Sistema Gatekeeper</span>
                            </div>
                            <p className="text-xs text-gray-400">Control de Acceso Inteligente • Seguridad Confiable</p>
                            <p className="text-xs text-gray-300 mt-1">Fecha: {formatDateTime(new Date())}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
