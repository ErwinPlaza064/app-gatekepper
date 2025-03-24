<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminOnly
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        dd($user);

        if (!$user || $user->email !== 'admin@admin.com') {
            return redirect('/')->with('error', 'No tienes acceso a esta página.');
        }

        return $next($request);
    }
}

