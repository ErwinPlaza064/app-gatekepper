import React from 'react';
import { Head } from '@inertiajs/react';

export default function Rejected({ message, visitor }) {
    return (
        <>
            <Head title="Visitante Rechazado" />
            
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        {/* Icono de rechazo */}
                        <div className="mb-6">
                            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                            </div>
                        </div>

                        {/* Título */}
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            ❌ Visitante Rechazado
                        </h1>

                        {/* Mensaje */}
                        <p className="text-gray-600 mb-6">
                            {message}
                        </p>

                        {/* Información del visitante */}
                        {visitor && (
                            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                                <h3 className="font-semibold text-gray-800 mb-2">Visitante rechazado:</h3>
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

                        {/* Mensaje de confirmación */}
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <p className="text-orange-800 text-sm">
                                El personal de seguridad ha sido notificado. El acceso ha sido denegado.
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
