<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PDOException;

class DatabaseRetryServiceProvider extends ServiceProvider
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
        // Configurar retry automático para conexiones de base de datos
        $this->setupDatabaseRetry();
    }

    /**
     * Configurar retry automático para Railway MySQL
     */
    private function setupDatabaseRetry(): void
    {
        // Solo en producción (Railway)
        if (app()->environment('production')) {
            // Reconectar automáticamente en caso de falla de conexión
            DB::listen(function (QueryExecuted $query) {
                // Log de queries lentas en producción
                if ($query->time > 1000) {
                    Log::warning('[DB] Query lenta detectada', [
                        'sql' => $query->sql,
                        'time' => $query->time . 'ms',
                        'connection' => $query->connectionName
                    ]);
                }
            });

            // Interceptar errores de conexión y reintentar
            $this->app->singleton('db.reconnect', function () {
                return new class {
                    public function retry($callback, $maxAttempts = 3, $delay = 1000)
                    {
                        $attempts = 0;

                        while ($attempts < $maxAttempts) {
                            try {
                                return $callback();
                            } catch (PDOException $e) {
                                $attempts++;

                                // Log del intento de reconexión
                                Log::warning('[DB] Intento de reconexión', [
                                    'attempt' => $attempts,
                                    'max_attempts' => $maxAttempts,
                                    'error' => $e->getMessage(),
                                    'code' => $e->getCode()
                                ]);

                                // Códigos de error que indican problemas de conexión
                                $connectionErrors = [2002, 2006, 2013];

                                if (in_array($e->getCode(), $connectionErrors) && $attempts < $maxAttempts) {
                                    // Esperar antes de reintentar (en microsegundos)
                                    usleep($delay * 1000);

                                    // Reconectar
                                    DB::purge('mysql');
                                    DB::reconnect('mysql');

                                    continue;
                                }

                                // Si no es un error de conexión o se agotaron los intentos, relanzar
                                throw $e;
                            }
                        }
                    }
                };
            });
        }
    }
}
