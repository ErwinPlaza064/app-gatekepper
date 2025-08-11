<?php

namespace App\Providers\Filament;

use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Pages;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Support\Facades\FilamentView;
use Filament\Widgets;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\AuthenticateSession;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;
use Illuminate\Support\Facades\Blade;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->authGuard('web')
            ->colors([
                'primary' => Color::Blue,
            ])
            ->databaseNotifications() // Habilitar notificaciones de base de datos
            ->databaseNotificationsPolling('2s') // Mantener polling rápido como respaldo
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\\Filament\\Pages')
            ->pages([
                Pages\Dashboard::class,
            ])
            ->widgets([
                Widgets\AccountWidget::class,
                \App\Filament\Widgets\DashboardStatsWidget::class,
                \App\Filament\Widgets\QrGeneratedWeeklyChart::class,
                \App\Filament\Widgets\QrTypeDistributionChart::class,
                \App\Filament\Widgets\AccessMethodChart::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ])
            ->renderHook(
                'panels::body.end',
                fn (): string => Blade::render($this->getRealTimeNotificationsScript())
            );
    }

    private function getRealTimeNotificationsScript(): string
    {
        return <<<'HTML'
        <script src="https://js.pusher.com/8.2.0/pusher.min.js"></script>
        <script>
            // Habilitar debugging detallado
            Pusher.logToConsole = true;
            
            // Configurar Pusher directamente
            window.Pusher = Pusher;
            
            // Verificar que el meta tag CSRF esté disponible
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            console.log('🔐 CSRF Token:', csrfToken ? 'Disponible' : 'No encontrado');
            
            // Configurar conexión de Pusher con headers mejorados y formato correcto
            const pusher = new Pusher('7fa6f3ebe8d4679dd6ac', {
                cluster: 'us2',
                forceTLS: true,
                encrypted: true,
                authEndpoint: '/broadcasting/auth',
                auth: {
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                },
                enabledTransports: ['ws', 'wss']
            });

            // Debug detallado de conexión
            pusher.connection.bind('connecting', () => {
                console.log('🔄 Conectando a Pusher...');
            });
            
            pusher.connection.bind('connected', () => {
                console.log('✅ Pusher conectado exitosamente');
                console.log('📡 Socket ID:', pusher.connection.socket_id);
            });
            
            pusher.connection.bind('disconnected', () => {
                console.log('❌ Pusher desconectado');
            });
            
            pusher.connection.bind('error', (error) => {
                console.error('❌ Error de conexión Pusher:', error);
                console.error('📋 Detalles del error:', {
                    type: error.type,
                    error: error.error,
                    data: error.data
                });
            });
            
            pusher.connection.bind('state_change', (states) => {
                console.log('🔄 Cambio de estado Pusher:', states.previous, '=>', states.current);
            });

            // Intentar suscribirse al canal después de la conexión
            pusher.connection.bind('connected', () => {
                console.log('🔔 Intentando suscribirse al canal admin.notifications...');
                
                // Debug del usuario actual
                fetch('/debug-user', {
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    },
                    credentials: 'same-origin'
                })
                .then(response => response.json())
                .then(data => {
                    console.log('👤 Debug del usuario:', data);
                })
                .catch(error => {
                    console.error('❌ Error obteniendo info del usuario:', error);
                });
                
                // Suscribirse al canal de administradores (corregido el nombre del canal)
                const adminChannel = pusher.subscribe('private-admin.notifications');
                
                adminChannel.bind('pusher:subscription_succeeded', () => {
                    console.log('✅ Suscrito exitosamente al canal admin.notifications');
                });

                adminChannel.bind('pusher:subscription_error', (error) => {
                    console.error('❌ Error de suscripción al canal:', error);
                    console.error('📋 Detalles del error de suscripción:', error);
                    
                    // Información adicional de debugging
                    console.error('🔍 Headers enviados:', {
                        'X-CSRF-TOKEN': csrfToken,
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    });
                    
                    console.error('🔍 URL de autenticación:', '/broadcasting/auth');
                    console.error('🔍 Socket ID:', pusher.connection.socket_id);
                    
                    // Sugerencia si es error 403
                    if (error.status === 403) {
                        console.error('🚫 Error 403: El usuario no está autorizado para este canal');
                        console.error('💡 Verifique que el usuario tenga rol de "administrador"');
                        console.error('💡 Verifique que /broadcasting/auth esté excluido del CSRF');
                        
                        // Comparar con request real de Pusher
                        fetch('/broadcasting/auth', {
                            method: 'POST',
                            headers: {
                                'X-CSRF-TOKEN': csrfToken,
                                'X-Requested-With': 'XMLHttpRequest'
                            },
                            body: new URLSearchParams({
                                socket_id: pusher.connection.socket_id,
                                channel_name: 'private-admin.notifications'
                            })
                        })
                        .then(response => {
                            console.log('🔍 Test con URLSearchParams status:', response.status);
                            return response.text();
                        })
                        .then(text => {
                            console.log('🔍 Test con URLSearchParams body:', text);
                        })
                        .catch(testError => {
                            console.error('🔍 Test con URLSearchParams failed:', testError);
                        });
                    }
                });

                // Escuchar eventos de actualización de visitantes
                adminChannel.bind('App\\Events\\VisitorStatusUpdated', (data) => {
                    console.log('📧 Evento de visitante recibido:', data);
                    
                    // Crear notificación visual
                    const notification = document.createElement('div');
                    notification.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: ${data.status === 'aprobado' ? '#10b981' : '#f59e0b'};
                        color: white;
                        padding: 16px;
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        z-index: 9999;
                        max-width: 300px;
                        font-family: system-ui, -apple-system, sans-serif;
                    `;
                    
                    notification.innerHTML = `
                        <div style="font-weight: 600; margin-bottom: 4px;">Estado de Visitante Actualizado</div>
                        <div style="font-size: 14px;">${data.message || `Visitante ${data.visitor.nombre} ${data.status}`}</div>
                    `;
                    
                    document.body.appendChild(notification);
                    
                    // Remover notificación después de 5 segundos
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.parentNode.removeChild(notification);
                        }
                    }, 5000);

                    // Intentar recargar tabla de visitantes si existe
                    if (typeof Livewire !== 'undefined') {
                        Livewire.emit('refreshComponent');
                    }
                });
            });

            console.log('🔔 Sistema de notificaciones Pusher inicializado');
            console.log('🔧 Configuración Pusher:', {
                key: '7fa6f3ebe8d4679dd6ac',
                cluster: 'us2',
                authEndpoint: '/broadcasting/auth'
            });
        </script>
        HTML;
    }
}
