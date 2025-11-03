<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use App\Mail\SendGridApiTransport;
use App\Services\ExpoPushService;
use App\Notifications\ExpoPushChannel;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Registrar SendGrid API Transport personalizado
        Mail::extend('sendgrid-api', function () {
            return new SendGridApiTransport();
        });

        // Registrar canal de Expo Push Notifications
        Notification::extend('expo', function ($app) {
            return new ExpoPushChannel($app->make(ExpoPushService::class));
        });

        // Forzar HTTPS en producción (Railway)
        if (app()->environment('production')) {
            URL::forceScheme('https');
        }

        // Crear directorios necesarios si no existen
        $paths = [
            storage_path('framework/sessions'),
            storage_path('framework/cache/data'),
            storage_path('framework/views'),
            storage_path('logs'),
        ];

        foreach ($paths as $path) {
            if (!file_exists($path)) {
                mkdir($path, 0755, true);
            }
        }

        // Crear subdirectorios de cache (00-ff)
        $cacheDataPath = storage_path('framework/cache/data');
        for ($i = 0; $i <= 255; $i++) {
            $subdir = sprintf('%02x', $i);
            $subdirPath = $cacheDataPath . '/' . $subdir;
            if (!file_exists($subdirPath)) {
                mkdir($subdirPath, 0755, true);
            }
        }
    }
}
