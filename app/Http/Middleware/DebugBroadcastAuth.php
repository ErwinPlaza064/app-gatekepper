<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class DebugBroadcastAuth
{
    public function handle(Request $request, Closure $next)
    {
        // Solo logear para rutas de broadcasting
        if ($request->is('broadcasting/auth')) {
            $user = Auth::user();
            
            Log::info('Broadcasting Auth Request Debug', [
                'method' => $request->method(),
                'url' => $request->fullUrl(),
                'headers' => $request->headers->all(),
                'body' => $request->all(),
                'session_id' => session()->getId(),
                'auth_check' => Auth::check(),
                'user_id' => $user ? $user->id : null,
                'user_email' => $user ? $user->email : null,
                'user_rol' => $user ? $user->rol : null,
                'is_admin' => $user ? in_array($user->rol, ['administrador', 'admin']) : false,
                'channel_name' => $request->input('channel_name'),
                'socket_id' => $request->input('socket_id'),
            ]);
        }

        return $next($request);
    }
}
