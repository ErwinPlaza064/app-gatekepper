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
        // Solo cargar broadcasting si no estamos en modo build/cache
        if (!app()->runningInConsole() || app()->environment('local')) {
            Broadcast::routes(['middleware' => ['web', 'auth']]);
            require base_path('routes/channels.php');
        }
    }
}
