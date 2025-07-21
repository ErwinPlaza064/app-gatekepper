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
    public function store(LoginRequest $request): RedirectResponse
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

        // Redireccionar según el rol del usuario
        if (in_array($user->rol, ['administrador', 'portero', 'adminresidencial'])) {
            Log::info('[LOGIN] Redireccionando a /admin', ['id' => $user->id, 'rol' => $user->rol]);
            return redirect()->intended('/admin');
        }

        // Para usuarios regulares (residentes)
        Log::info('[LOGIN] Redireccionando a HOME', ['id' => $user->id, 'rol' => $user->rol]);
        return redirect()->intended(RouteServiceProvider::HOME);
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
