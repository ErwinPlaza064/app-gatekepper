<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Providers\RouteServiceProvider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request)
    {
        $request->authenticate();

        $request->session()->regenerate();

        // Obtener el usuario autenticado
        $user = Auth::user();

        Log::info('[LOGIN] Usuario autenticado', [
            'id' => $user->id,
            'email' => $user->email,
            'rol' => $user->rol,
        ]);

        // Determinar la URL de redirección según el rol
        if (in_array($user->rol, ['administrador', 'portero', 'adminresidencial'])) {
            Log::info('[LOGIN] Redireccionando a Filament admin', ['id' => $user->id, 'rol' => $user->rol]);

            // Construir la URL del admin asegurando HTTPS en producción
            $adminUrl = config('app.url') . '/admin';

            // Asegurar que siempre use HTTPS en producción
            if (app()->environment('production')) {
                $adminUrl = str_replace('http://', 'https://', $adminUrl);
            }

            // Para Inertia, usar redirect externo para Filament
            return redirect()->away($adminUrl);
        }

        // Para usuarios regulares (residentes)
        Log::info('[LOGIN] Redireccionando a HOME', ['id' => $user->id, 'rol' => $user->rol]);
        Log::info('[LOGIN] Request details', [
            'is_inertia' => $request->inertia(),
            'accepts_json' => $request->acceptsJson(),
            'header_x_inertia' => $request->header('X-Inertia'),
            'dashboard_route' => route('dashboard')
        ]);

        // Para Inertia, usar redirección directa
        return redirect()->route('dashboard');
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
