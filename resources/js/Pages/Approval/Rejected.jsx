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
            
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                        {/* Header */}
                        <div className="bg-orange-50 border-b border-orange-200 px-6 py-4">
                            <div className="flex items-center">
                                <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
                                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h1 className="text-lg font-semibold text-orange-900">Acceso Denegado</h1>
                                    <p className="text-sm text-orange-700">Visitante rechazado por el residente</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-6 space-y-6">
                            {/* Main message */}
                            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                                <p className="text-orange-800 font-medium text-center">
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
                                        Visitante Rechazado
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
                                            <span className="text-gray-600">Fecha de Solicitud:</span>
                                            <span className="text-gray-900">{formatDateTime(visitor.approval_requested_at)}</span>
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
                            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <h4 className="text-sm font-semibold text-red-900 mb-1">Solicitud Rechazada</h4>
                                        <p className="text-sm text-red-700 leading-relaxed">
                                            El residente ha decidido no autorizar el ingreso de este visitante. 
                                            El personal de seguridad ha sido notificado automáticamente.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Additional information */}
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <h4 className="text-sm font-semibold text-blue-900 mb-1">¿Qué sigue?</h4>
                                        <p className="text-sm text-blue-700 leading-relaxed">
                                            Si hay algún malentendido o necesita contactar al residente, 
                                            puede comunicarse directamente con el personal de seguridad para 
                                            obtener asistencia adicional.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action button */}
                            <div>
                                <button 
                                    onClick={() => window.close()}
                                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
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
