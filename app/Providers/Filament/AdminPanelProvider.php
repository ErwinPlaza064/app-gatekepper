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
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                // Esperar a que Echo esté disponible
                const initializeNotifications = () => {
                    if (typeof window.Echo === 'undefined') {
                        console.log('⏳ Echo no disponible aún, reintentando...');
                        setTimeout(initializeNotifications, 1000);
                        return;
                    }

                    console.log('🔔 Iniciando notificaciones en tiempo real...');

                    // Verificar conexión de Pusher
                    if (window.Echo.connector && window.Echo.connector.pusher) {
                        window.Echo.connector.pusher.connection.bind('connected', () => {
                            console.log('✅ Pusher conectado exitosamente');
                        });
                        
                        window.Echo.connector.pusher.connection.bind('error', (error) => {
                            console.error('❌ Error de conexión Pusher:', error);
                        });
                    }

                    // Escuchar eventos de actualización de visitantes
                    window.Echo.private('admin.notifications')
                        .listen('VisitorStatusUpdated', (event) => {
                            console.log('📧 Evento recibido:', event);
                            
                            // Mostrar notificación usando el sistema de Filament
                            window.dispatchEvent(new CustomEvent('notify', {
                                detail: {
                                    message: event.message || `Visitante ${event.visitor.nombre} ${event.status}`,
                                    type: event.status === 'aprobado' ? 'success' : 'warning'
                                }
                            }));
                        })
                        .error((error) => {
                            console.error('❌ Error en canal de notificaciones:', error);
                        });

                    console.log('✅ Notificaciones configuradas');
                };

                // Inicializar después de un pequeño delay para asegurar que Echo esté cargado
                setTimeout(initializeNotifications, 500);
            });
        </script>
        HTML;
    }
}
