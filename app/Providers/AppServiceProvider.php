<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Forzar HTTPS en producción (Railway)
        if (app()->environment('production')) {
            URL::forceScheme('https');
        }

        // Crear directorio de sesiones si no existe
        $sessionPath = storage_path('framework/sessions');
        if (!file_exists($sessionPath)) {
            mkdir($sessionPath, 0755, true);
        }
    }
}
