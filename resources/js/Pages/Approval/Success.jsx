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
            
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                        {/* Header */}
                        <div className="bg-green-50 border-b border-green-200 px-6 py-4">
                            <div className="flex items-center">
                                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h1 className="text-lg font-semibold text-green-900">
                                        {auto_approved ? 'Aprobación Automática' : 'Visitante Aprobado'}
                                    </h1>
                                    <p className="text-sm text-green-700">Acceso autorizado exitosamente</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-6 space-y-6">
                            {/* Main message */}
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <p className="text-green-800 font-medium text-center">
                                    {message}
                                </p>
                            </div>

                            {/* Visitor information */}
                            {visitor && (
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                        <svg className="w-4 h-4 mr-2 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                        Información del Visitante
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Nombre:</span>
                                            <span className="text-gray-900 font-medium">{visitor.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Documento:</span>
                                            <span className="text-gray-900">{visitor.id_document}</span>
                                        </div>
                                        {visitor.vehicle_plate && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Vehículo:</span>
                                                <span className="text-gray-900 font-mono">{visitor.vehicle_plate}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Hora de Entrada:</span>
                                            <span className="text-gray-900">{formatDateTime(visitor.entry_time)}</span>
                                        </div>
                                        {visitor.user && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Residente:</span>
                                                <span className="text-gray-900">{visitor.user.name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Status message */}
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <h4 className="text-sm font-semibold text-blue-900 mb-1">¡Acceso Autorizado!</h4>
                                        <p className="text-sm text-blue-700 leading-relaxed">
                                            El personal de seguridad ha sido notificado automáticamente. 
                                            El visitante puede proceder al ingreso ahora mismo.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Auto-approval notice */}
                            {auto_approved && (
                                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                    <div className="flex items-start">
                                        <svg className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <h4 className="text-sm font-semibold text-yellow-900 mb-1">Aprobación Automática</h4>
                                            <p className="text-sm text-yellow-800">
                                                Este visitante fue aprobado automáticamente debido al vencimiento 
                                                del tiempo límite para respuesta (7 minutos).
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action button */}
                            <div>
                                <button 
                                    onClick={() => window.close()}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Cerrar Ventana
                                </button>
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
                            <p className="text-center text-xs text-gray-400 mt-1">
                                Control de Acceso Inteligente • {formatDateTime(new Date())}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
