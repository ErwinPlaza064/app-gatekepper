<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

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
    ];
}
