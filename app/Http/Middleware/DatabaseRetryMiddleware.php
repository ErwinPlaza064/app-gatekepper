<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PDOException;
use Symfony\Component\HttpFoundation\Response;

class DatabaseRetryMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $maxAttempts = 3;
        $attempt = 0;

        while ($attempt < $maxAttempts) {
            try {
                // Verificar conexión de base de datos antes de proceder
                if ($attempt > 0) {
                    Log::info('[DB_RETRY] Verificando conexión antes del intento', [
                        'attempt' => $attempt + 1,
                        'max_attempts' => $maxAttempts,
                        'route' => $request->route()?->getName()
                    ]);

                    // Hacer una query simple para verificar la conexión
                    DB::select('SELECT 1');
                }

                return $next($request);

            } catch (PDOException $e) {
                $attempt++;

                Log::warning('[DB_RETRY] Error de base de datos detectado', [
                    'attempt' => $attempt,
                    'max_attempts' => $maxAttempts,
                    'error_code' => $e->getCode(),
                    'error_message' => $e->getMessage(),
                    'route' => $request->route()?->getName()
                ]);

                // Códigos de error de conexión MySQL
                $connectionErrors = [2002, 2006, 2013, 1045, 1044, 1231]; // 1231 = Variable can't be set

                if (in_array($e->getCode(), $connectionErrors) && $attempt < $maxAttempts) {
                    // Esperar progresivamente más tiempo entre intentos
                    $delay = $attempt * 500000; // 0.5s, 1s, 1.5s
                    usleep($delay);

                    // Limpiar y reconectar
                    try {
                        DB::purge('mysql');
                        DB::reconnect('mysql');

                        Log::info('[DB_RETRY] Reconexión exitosa', [
                            'attempt' => $attempt,
                            'delay_ms' => $delay / 1000
                        ]);

                    } catch (\Exception $reconnectError) {
                        Log::error('[DB_RETRY] Error en reconexión', [
                            'attempt' => $attempt,
                            'error' => $reconnectError->getMessage()
                        ]);
                    }

                    continue;
                }

                // Si se agotaron los intentos o no es un error de conexión
                Log::error('[DB_RETRY] Máximo de intentos alcanzado o error no recuperable', [
                    'final_attempt' => $attempt,
                    'error_code' => $e->getCode(),
                    'error_message' => $e->getMessage()
                ]);

                throw $e;
            } catch (\Exception $e) {
                // Para otros tipos de errores, no reintentar
                Log::error('[DB_RETRY] Error no relacionado con base de datos', [
                    'error' => $e->getMessage(),
                    'type' => get_class($e)
                ]);

                throw $e;
            }
        }

        // No debería llegar aquí, pero por seguridad
        return $next($request);
    }
}
