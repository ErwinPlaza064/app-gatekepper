import React, { useState } from 'react';
import axios from 'axios';
import { FaUser, FaCar, FaIdCard, FaClock, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

export default function VisitorApprovalNotification({ notification, onUpdate, showToast }) {
    const [loading, setLoading] = useState(false);
    const [processed, setProcessed] = useState(false);
    
    const visitor = notification.data?.visitor;
    const expiresAt = notification.data?.expires_at;
    const isExpired = expiresAt && new Date(expiresAt) < new Date();

    const handleApprove = async () => {
        if (loading || processed) return;
        
        setLoading(true);
        try {
            let API_URL = window.location.origin;

            if (
                !API_URL ||
                API_URL.includes("localhost") ||
                API_URL.includes("192.168")
            ) {
                API_URL = import.meta.env.VITE_API_URL || "https://gatekepper.com";
            }

            if (
                API_URL.startsWith("http://") &&
                !API_URL.includes("localhost")
            ) {
                API_URL = API_URL.replace("http://", "https://");
            }

            const response = await axios.post(
                `${API_URL}/approval/approve`,
                {
                    visitor_id: visitor.id,
                    notes: 'Aprobado desde la aplicación web'
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    },
                    withCredentials: true,
                }
            );

            if (response.data.success) {
                setProcessed(true);
                showToast(`✅ Visitante ${visitor.name} aprobado correctamente`, 'success');
                
                // Marcar notificación como leída
                if (onUpdate) {
                    onUpdate(notification.id, { processed: true, action: 'approved' });
                }
            } else {
                showToast(response.data.message || 'Error al aprobar visitante', 'error');
            }
        } catch (error) {
            console.error('Error approving visitor:', error);
            const message = error.response?.data?.message || 'Error al aprobar el visitante';
            showToast(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (loading || processed) return;
        
        setLoading(true);
        try {
            let API_URL = window.location.origin;

            if (
                !API_URL ||
                API_URL.includes("localhost") ||
                API_URL.includes("192.168")
            ) {
                API_URL = import.meta.env.VITE_API_URL || "https://gatekepper.com";
            }

            if (
                API_URL.startsWith("http://") &&
                !API_URL.includes("localhost")
            ) {
                API_URL = API_URL.replace("http://", "https://");
            }

            const response = await axios.post(
                `${API_URL}/approval/reject`,
                {
                    visitor_id: visitor.id,
                    reason: 'Rechazado desde la aplicación web'
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    },
                    withCredentials: true,
                }
            );

            if (response.data.success) {
                setProcessed(true);
                showToast(`❌ Visitante ${visitor.name} rechazado`, 'error');
                
                // Marcar notificación como leída
                if (onUpdate) {
                    onUpdate(notification.id, { processed: true, action: 'rejected' });
                }
            } else {
                showToast(response.data.message || 'Error al rechazar visitante', 'error');
            }
        } catch (error) {
            console.error('Error rejecting visitor:', error);
            const message = error.response?.data?.message || 'Error al rechazar el visitante';
            showToast(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTimeRemaining = () => {
        if (!expiresAt) return null;
        const now = new Date();
        const expires = new Date(expiresAt);
        const diff = expires - now;
        
        if (diff <= 0) return 'Expirado';
        
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        
        return `${minutes}m ${seconds}s`;
    };

    return (
        <div className={`group relative px-4 py-4 text-sm transition-all duration-200 rounded-lg border ${
            isExpired || processed
                ? "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
        }`}>
            {/* Header con título y tiempo */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        isExpired || processed 
                            ? "bg-gray-200 dark:bg-gray-700" 
                            : "bg-blue-100 dark:bg-blue-800"
                    }`}>
                        <FaUser className={`w-3 h-3 ${
                            isExpired || processed 
                                ? "text-gray-400" 
                                : "text-blue-600 dark:text-blue-400"
                        }`} />
                    </div>
                    <div>
                        <h4 className={`font-semibold ${
                            isExpired || processed 
                                ? "text-gray-600 dark:text-gray-400" 
                                : "text-gray-900 dark:text-gray-100"
                        }`}>
                            🔔 Solicitud de Visita
                        </h4>
                        {!isExpired && !processed && (
                            <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                                <FaClock className="w-3 h-3" />
                                <span>{getTimeRemaining()}</span>
                            </div>
                        )}
                    </div>
                </div>
                
                {isExpired && (
                    <span className="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full dark:bg-red-900/20 dark:text-red-400">
                        Expirado
                    </span>
                )}
                
                {processed && (
                    <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full dark:bg-gray-800 dark:text-gray-400">
                        Procesado
                    </span>
                )}
            </div>

            {/* Información del visitante */}
            <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2">
                    <FaUser className="w-3 h-3 text-gray-400" />
                    <span className={`font-medium ${
                        isExpired || processed 
                            ? "text-gray-600 dark:text-gray-400" 
                            : "text-gray-900 dark:text-gray-100"
                    }`}>
                        {visitor?.name}
                    </span>
                </div>
                
                <div className="flex items-center gap-2">
                    <FaIdCard className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                        {visitor?.id_document}
                    </span>
                </div>

                {visitor?.vehicle_plate && (
                    <div className="flex items-center gap-2">
                        <FaCar className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                            {visitor.vehicle_plate}
                        </span>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <FaClock className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                        Solicita acceso: {formatTime(visitor?.entry_time)}
                    </span>
                </div>

                {visitor?.additional_info && (
                    <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
                        <strong>Información adicional:</strong> {visitor.additional_info}
                    </div>
                )}
            </div>

            {/* Botones de acción */}
            {!isExpired && !processed && (
                <div className="flex gap-2">
                    <button
                        onClick={handleApprove}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                    >
                        {loading ? (
                            <FaSpinner className="w-3 h-3 animate-spin" />
                        ) : (
                            <FaCheck className="w-3 h-3" />
                        )}
                        Aprobar
                    </button>
                    
                    <button
                        onClick={handleReject}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                    >
                        {loading ? (
                            <FaSpinner className="w-3 h-3 animate-spin" />
                        ) : (
                            <FaTimes className="w-3 h-3" />
                        )}
                        Rechazar
                    </button>
                </div>
            )}

            {/* Mensaje para visitantes expirados */}
            {isExpired && (
                <div className="px-3 py-2 text-xs text-orange-700 bg-orange-100 rounded-lg dark:bg-orange-900/20 dark:text-orange-400">
                    ⏰ Esta solicitud expiró. El visitante fue aprobado automáticamente.
                </div>
            )}

            {/* Tiempo */}
            <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-500">
                    {formatTime(notification.created_at)}
                </p>
            </div>
        </div>
    );
}
