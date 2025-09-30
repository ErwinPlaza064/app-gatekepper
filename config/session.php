<?php
// config/session.php - Configuración específica para gatekepper.com en Railway

use Illuminate\Support\Str;

return [
    'driver' => env('SESSION_DRIVER', 'file'), // USAR FILE, NO COOKIE
    'lifetime' => env('SESSION_LIFETIME', 120),
    'expire_on_close' => false,
    'encrypt' => false,
    'files' => storage_path('framework/sessions'),
    'connection' => env('SESSION_CONNECTION'),
    'table' => 'sessions',
    'store' => env('SESSION_STORE'),
    'lottery' => [2, 100],

    // CONFIGURACIÓN ESPECÍFICA PARA GATEKEPPER.COM
    'cookie' => env('SESSION_COOKIE', 'gatekepper_session'),
    'path' => '/',
    'domain' => env('SESSION_DOMAIN', null), // NULL para permitir subdominio automático
    'secure' => env('SESSION_SECURE_COOKIE', true), // SIEMPRE true en HTTPS
    'http_only' => true,
    'same_site' => env('SESSION_SAME_SITE', 'lax'), // LAX es más compatible que NONE
];
