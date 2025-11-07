<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Config;

class MailConfigServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Configurar mailer automáticamente basado en el ambiente
        $this->configureMailerForEnvironment();
    }

    /**
     * Configurar el mailer apropiado según el ambiente
     */
    private function configureMailerForEnvironment(): void
    {
        $isRailway = !empty(env('RAILWAY_ENVIRONMENT')) ||
                     !empty(env('RAILWAY_PROJECT_ID')) ||
                     !empty(env('RAILWAY_SERVICE_NAME'));

        if ($isRailway) {
            // En Railway, usar SendGrid API personalizado (ya funciona para notificaciones)
            Config::set('mail.default', 'sendgrid-api');

            // Configurar failover para SendGrid API como primaria
            Config::set('mail.mailers.failover.mailers', ['sendgrid-api', 'log']);

            logger()->info('Mail configuration set for Railway environment', [
                'default_mailer' => 'sendgrid-api',
                'environment' => 'railway'
            ]);
        } else {
            // En local, permitir failover normal
            Config::set('mail.default', 'failover');

            logger()->info('Mail configuration set for local environment', [
                'default_mailer' => 'failover',
                'environment' => 'local'
            ]);
        }
    }
}
