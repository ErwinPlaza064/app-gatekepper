import React from 'react';
import { Head } from '@inertiajs/react';

export default function Success({ message, visitor, auto_approved = false }) {
    return (
        <>
            <Head title="Aprobación Exitosa" />
            
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        {/* Icono de éxito */}
                        <div className="mb-6">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>

                        {/* Título */}
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            {auto_approved ? '✅ Aprobación Automática' : '✅ Visitante Aprobado'}
                        </h1>

                        {/* Mensaje */}
                        <p className="text-gray-600 mb-6">
                            {message}
                        </p>

                        {/* Información del visitante */}
                        {visitor && (
                            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                                <h3 className="font-semibold text-gray-800 mb-2">Detalles del visitante:</h3>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <p><span className="font-medium">Nombre:</span> {visitor.name}</p>
                                    <p><span className="font-medium">Documento:</span> {visitor.id_document}</p>
                                    {visitor.vehicle_plate && (
                                        <p><span className="font-medium">Vehículo:</span> {visitor.vehicle_plate}</p>
                                    )}
                                    <p><span className="font-medium">Hora:</span> {new Date(visitor.entry_time).toLocaleString('es-ES')}</p>
                                </div>
                            </div>
                        )}

                        {/* Mensaje adicional */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-green-800 text-sm">
                                El personal de seguridad ha sido notificado. El visitante puede ingresar ahora.
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
