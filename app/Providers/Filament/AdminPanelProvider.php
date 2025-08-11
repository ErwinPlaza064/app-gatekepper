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
            ->databaseNotifications()
            ->databaseNotificationsPolling('2s')
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
        try {
            // Obtener CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            console.log('🔐 CSRF Token:', csrfToken ? 'Disponible' : 'No encontrado');

            if (!csrfToken) {
                console.error('❌ No se encontró CSRF token, activando SSE...');
                initializeSSEFallback();
                return;
            }

            // Configurar Pusher
            Pusher.logToConsole = true;
            const pusher = new Pusher('7fa6f3ebe8d4679dd6ac', {
                cluster: 'eu',
                forceTLS: true,
                authEndpoint: '/broadcasting/auth',
                auth: {
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                }
            });

            // Eventos de conexión
            pusher.connection.bind('connected', () => {
                console.log('✅ Pusher conectado');
                
                const adminChannel = pusher.subscribe('private-admin.notifications');
                
                adminChannel.bind('pusher:subscription_succeeded', () => {
                    console.log('✅ Suscrito exitosamente al canal admin.notifications');
                });

                adminChannel.bind('visitor.status.updated', (data) => {
                    console.log('🔔 Evento Pusher recibido:', data);
                    new FilamentNotification()
                        .title('Estado de Visitante Actualizado')
                        .body(`El visitante ${data.visitor?.name || 'Desconocido'} ha sido ${data.action || 'actualizado'}`)
                        .success()
                        .send();
                });

                adminChannel.bind('pusher:subscription_error', (error) => {
                    console.error('❌ Error suscripción Pusher:', error);
                    console.warn('🔄 Activando SSE por error...');
                    initializeSSEFallback();
                });
            });

            pusher.connection.bind('error', (error) => {
                console.error('❌ Error conexión Pusher:', error);
                console.warn('🔄 Activando SSE por error de conexión...');
                initializeSSEFallback();
            });

            // Timeout para SSE si Pusher no conecta
            setTimeout(() => {
                if (pusher.connection.state !== 'connected') {
                    console.warn('⚠️ Pusher timeout, activando SSE...');
                    initializeSSEFallback();
                }
            }, 10000);

        } catch (error) {
            console.error('❌ Error fatal Pusher:', error);
            initializeSSEFallback();
        }

        // Función SSE fallback
        function initializeSSEFallback() {
            console.log('🔄 Inicializando SSE...');
            
            if (window.sseConnection) {
                window.sseConnection.close();
            }
            
            const eventSource = new EventSource('/notifications/sse');
            
            eventSource.onmessage = function(event) {
                try {
                    const data = JSON.parse(event.data);
                    console.log('📨 SSE recibido:', data);
                    
                    if (data.type === 'connected') {
                        console.log('✅ Conectado a SSE');
                        new FilamentNotification()
                            .title('Sistema de Notificaciones')
                            .body('Conectado via SSE (fallback)')
                            .info()
                            .send();
                    }
                    
                    if (data.type === 'visitor_status_updated') {
                        console.log('🔔 Notificación SSE:', data);
                        new FilamentNotification()
                            .title('Estado de Visitante Actualizado')
                            .body(data.message)
                            .success()
                            .send();
                    }
                    
                } catch (e) {
                    console.error('❌ Error procesando SSE:', e);
                }
            };
            
            eventSource.onerror = function(event) {
                console.error('❌ Error SSE:', event);
            };
            
            window.sseConnection = eventSource;
        }

        console.log('🔔 Sistema de notificaciones inicializado');
        </script>
        HTML;
    }
}
