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
        <script>
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🔔 Sistema de notificaciones de Filament inicializado');
            
            // Función para mostrar notificación de prueba
            window.testNotification = function() {
                new FilamentNotification()
                    .title('Notificación de Prueba')
                    .body('El sistema de notificaciones está funcionando correctamente')
                    .success()
                    .send();
            };
            
            // Función para escuchar eventos de visitantes via polling mejorado
            setInterval(function() {
                // Verificar nuevas notificaciones cada 3 segundos
                fetch('/admin/notifications/check', {
                    method: 'GET',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json',
                    },
                    credentials: 'same-origin'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.notifications && data.notifications.length > 0) {
                        data.notifications.forEach(notification => {
                            // Crear notificación con ícono y color específico
                            let filamentNotification = new FilamentNotification()
                                .title(notification.title || 'Nueva Notificación')
                                .body(notification.body || 'Tienes una nueva notificación');
                            
                            // Aplicar color según el estado
                            if (notification.color === 'success') {
                                filamentNotification.success();
                            } else if (notification.color === 'danger') {
                                filamentNotification.danger();
                            } else if (notification.color === 'warning') {
                                filamentNotification.warning();
                            } else {
                                filamentNotification.info();
                            }
                            
                            // Enviar la notificación
                            filamentNotification.send();
                        });
                    }
                })
                .catch(error => {
                    console.log('Polling silencioso - sin notificaciones nuevas');
                });
            }, 3000);
            
            console.log('✅ Sistema de polling de notificaciones activo');
        });
        </script>
        HTML;
    }
}
