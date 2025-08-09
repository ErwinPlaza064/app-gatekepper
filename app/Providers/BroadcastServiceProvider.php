<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Configurar rutas de broadcasting con middleware para Filament
        Broadcast::routes([
            'middleware' => ['web', 'auth'],
        ]);

        require base_path('routes/channels.php');
    }
}
