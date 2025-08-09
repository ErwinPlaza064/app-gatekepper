import React from 'react';
import { Head } from '@inertiajs/react';

export default function Rejected({ message, visitor }) {
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
            <Head title="Visitante Rechazado" />
            
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100 flex items-center justify-center px-4">
                <div className="max-w-lg w-full">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 text-center border border-orange-100">
                        {/* Icono de rechazo animado */}
                        <div className="mb-8">
                            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        </div>

                        {/* Título */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            🚫 Acceso Denegado
                        </h1>

                        {/* Mensaje principal */}
                        <div className="bg-orange-50 border-l-4 border-orange-400 rounded-lg p-6 mb-8">
                            <p className="text-orange-800 font-medium text-lg">
                                {message}
                            </p>
                        </div>

                        {/* Información del visitante */}
                        {visitor && (
                            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left border border-gray-200">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                                    <svg className="w-5 h-5 mr-2 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    Visitante Rechazado
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
                                        <span className="font-medium text-gray-600">Fecha de Solicitud:</span>
                                        <span className="text-gray-900">{formatDateTime(visitor.approval_requested_at)}</span>
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
                        <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-6 mb-8">
                            <div className="flex items-start">
                                <svg className="w-6 h-6 text-red-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <h4 className="font-bold text-red-800 mb-1">Solicitud Rechazada</h4>
                                    <p className="text-red-700 text-sm leading-relaxed">
                                        El residente ha decidido no autorizar el ingreso de este visitante. 
                                        El personal de seguridad ha sido notificado automáticamente.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Información adicional */}
                        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-6 mb-8">
                            <div className="flex items-start">
                                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <h4 className="font-bold text-blue-800 mb-1">¿Qué sigue?</h4>
                                    <p className="text-blue-700 text-sm leading-relaxed">
                                        Si hay algún malentendido o necesita contactar al residente, 
                                        puede comunicarse directamente con el personal de seguridad para 
                                        obtener asistencia adicional.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Botón de acción */}
                        <div className="mb-8">
                            <button 
                                onClick={() => window.close()}
                                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cerrar Ventana
                            </button>
                        </div>

                        {/* Footer mejorado */}
                        <div className="pt-6 border-t border-gray-200">
                            <div className="flex items-center justify-center text-gray-500 mb-2">
                                <svg className="w-6 h-6 mr-2 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
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
