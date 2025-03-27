<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminRoleMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check() && in_array(Auth::user()->rol, ['administrador', 'adminresidencial', 'portero'])) {
            return $next($request);
        }

        return redirect('/error');
    }
}
