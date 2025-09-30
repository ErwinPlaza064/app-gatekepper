<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;
use Illuminate\Session\TokenMismatchException;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        'api/scan-qr',
        'api/recent-visitor-scans',
        'api/qr-codes/*/deactivate',  
        'api/qr-codes/*/reactivate',
        'broadcasting/auth',
        'test-broadcasting-auth',
        'livewire/update',
        'livewire/message/*',
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     *
     * @throws \Illuminate\Session\TokenMismatchException
     */
    public function handle($request, Closure $next)
    {
        try {
            return parent::handle($request, $next);
        } catch (TokenMismatchException $exception) {
            // Log simple del error
            Log::warning("CSRF Token Mismatch: {$request->method()} {$request->path()}");

            // Si es una petición AJAX/API, devolver JSON
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'message' => 'CSRF token mismatch. Please refresh the page.',
                    'error' => 'TokenMismatchException'
                ], 419);
            }

            // Para peticiones web, redirigir con mensaje de error
            if ($request->is('login') || $request->is('logout')) {
                return redirect()->route('login')
                    ->withErrors(['csrf' => 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.']);
            }

            // Redirigir a la página anterior con mensaje de error
            return redirect()->back()
                ->withErrors(['csrf' => 'Su sesión ha expirado. Por favor, recargue la página e intente de nuevo.'])
                ->withInput($request->except('_token'));
        }
    }
}
