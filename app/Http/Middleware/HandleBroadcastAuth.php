<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class HandleBroadcastAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Log para debugging
        Log::info('Broadcasting Auth Request', [
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'user_id' => Auth::id(),
            'is_authenticated' => Auth::check(),
            'session_id' => session()->getId(),
            'headers' => [
                'authorization' => $request->header('authorization'),
                'x-csrf-token' => $request->header('x-csrf-token'),
                'cookie' => $request->header('cookie') ? 'present' : 'missing',
            ]
        ]);

        // Si no está autenticado, devolver error 403 con información útil
        if (!Auth::check()) {
            Log::warning('Broadcasting Auth Failed - User not authenticated', [
                'session_id' => session()->getId(),
                'url' => $request->fullUrl()
            ]);

            return response()->json([
                'message' => 'Unauthenticated.',
                'error' => 'authentication_required'
            ], 403);
        }

        return $next($request);
    }
}
