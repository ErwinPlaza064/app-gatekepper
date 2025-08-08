import React from 'react';
import { Head } from '@inertiajs/react';

export default function AlreadyProcessed({ visitor, status }) {
    const getStatusInfo = (status) => {
        switch (status) {
            case 'approved':
                return {
                    title: '✅ Ya Aprobado',
                    message: 'Este visitante ya fue aprobado anteriormente',
                    bgColor: 'from-green-50 to-emerald-100',
                    iconColor: 'bg-green-100 text-green-500',
                    borderColor: 'border-green-200',
                    textColor: 'text-green-800'
                };
            case 'rejected':
                return {
                    title: '❌ Ya Rechazado',
                    message: 'Este visitante ya fue rechazado anteriormente',
                    bgColor: 'from-red-50 to-rose-100',
                    iconColor: 'bg-red-100 text-red-500',
                    borderColor: 'border-red-200',
                    textColor: 'text-red-800'
                };
            case 'auto_approved':
                return {
                    title: '⏰ Auto-aprobado',
                    message: 'Este visitante fue aprobado automáticamente por tiempo de espera',
                    bgColor: 'from-blue-50 to-indigo-100',
                    iconColor: 'bg-blue-100 text-blue-500',
                    borderColor: 'border-blue-200',
                    textColor: 'text-blue-800'
                };
            default:
                return {
                    title: '📋 Ya Procesado',
                    message: 'Este visitante ya fue procesado',
                    bgColor: 'from-gray-50 to-slate-100',
                    iconColor: 'bg-gray-100 text-gray-500',
                    borderColor: 'border-gray-200',
                    textColor: 'text-gray-800'
                };
        }
    };

    const statusInfo = getStatusInfo(status);

    return (
        <>
            <Head title="Visitante Ya Procesado" />
            
            <div className={`min-h-screen bg-gradient-to-br ${statusInfo.bgColor} flex items-center justify-center px-4`}>
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        {/* Icono dinámico */}
                        <div className="mb-6">
                            <div className={`mx-auto w-16 h-16 ${statusInfo.iconColor} rounded-full flex items-center justify-center`}>
                                {status === 'approved' || status === 'auto_approved' ? (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : status === 'rejected' ? (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                )}
                            </div>
                        </div>

                        {/* Título dinámico */}
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            {statusInfo.title}
                        </h1>

                        {/* Mensaje */}
                        <p className="text-gray-600 mb-6">
                            {statusInfo.message}
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
                                    <p><span className="font-medium">Estado:</span> 
                                        <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${statusInfo.iconColor}`}>
                                            {status === 'approved' ? 'Aprobado' : 
                                             status === 'rejected' ? 'Rechazado' :
                                             status === 'auto_approved' ? 'Auto-aprobado' : 'Procesado'}
                                        </span>
                                    </p>
                                    {visitor.approved_at && (
                                        <p><span className="font-medium">Procesado:</span> {new Date(visitor.approved_at).toLocaleString('es-ES')}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Mensaje informativo */}
                        <div className={`${statusInfo.borderColor} border rounded-lg p-4`}>
                            <p className={`${statusInfo.textColor} text-sm`}>
                                No es posible realizar más acciones sobre este visitante. 
                                Si hay algún error, contacta con el personal de seguridad.
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
