<?php
// config/cors.php - Configuración para gatekepper.com

return [
    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'broadcasting/auth',
        'csrf-token',
        'login',
        'logout',
        'register',
        'send-email'
    ],

    'allowed_methods' => ['*'],

    // Para apps móviles, no necesitamos restricciones de origen estrictas
    // Las apps móviles no están sujetas a las mismas restricciones CORS que los navegadores
    'allowed_origins' => [
        'https://gatekepper.com',
        'https://www.gatekepper.com',
        // Para desarrollo (remover si no usas)
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:8000',
    ],

    'allowed_origins_patterns' => [
        'https://*.gatekepper.com',
    ],
    
    'allowed_headers' => [
        'Accept',
        'Authorization',
        'Content-Type',
        'X-Requested-With',
        'X-CSRF-TOKEN',
        'X-XSRF-TOKEN',
        'Origin',
        'Cache-Control',
    ],

    'exposed_headers' => [
        'X-CSRF-TOKEN',
    ],

    'max_age' => 86400, // 24 horas
    
    // supports_credentials: true para la app web (cookies)
    // Las apps móviles usan tokens (Sanctum), no cookies, así que CORS no es un problema
    'supports_credentials' => true,
];
