// Configuración de notificaciones en tiempo real para Filament
document.addEventListener('DOMContentLoaded', function() {
    // Verificar que Echo esté disponible
    if (typeof window.Echo === 'undefined') {
        console.error('Echo no está disponible. Asegúrate de que bootstrap.js se cargue primero.');
        return;
    }

    console.log('🔔 Iniciando sistema de notificaciones en tiempo real...');

    // Escuchar en el canal de administradores
    window.Echo.private('admin.notifications')
        .listen('VisitorStatusUpdated', (event) => {
            console.log('📧 Evento de actualización de visitante recibido:', event);
            
            // Mostrar notificación en Filament
            if (typeof window.FilamentNotifications !== 'undefined') {
                window.FilamentNotifications.show({
                    title: 'Estado de Visitante Actualizado',
                    body: event.message || `El visitante ${event.visitor.nombre} ha sido ${event.status}`,
                    status: event.status === 'aprobado' ? 'success' : 'warning',
                    duration: 5000
                });
            } else {
                // Fallback: notificación del navegador
                if (Notification.permission === 'granted') {
                    new Notification('Estado de Visitante Actualizado', {
                        body: event.message || `El visitante ${event.visitor.nombre} ha sido ${event.status}`,
                        icon: '/favicon.ico'
                    });
                }
            }

            // Opcional: recargar la tabla de visitantes si existe
            if (typeof Livewire !== 'undefined') {
                Livewire.emit('refreshVisitors');
            }
        })
        .error((error) => {
            console.error('❌ Error en el canal de notificaciones:', error);
        });

    // Solicitar permisos de notificación si no están concedidos
    if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            console.log('🔔 Permisos de notificación:', permission);
        });
    }

    console.log('✅ Sistema de notificaciones configurado correctamente');
});
