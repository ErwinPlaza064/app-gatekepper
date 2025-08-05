<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="description" content="Sistema de gestión de visitantes GateKepper">
        <meta name="theme-color" content="#4F46E5">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Preconnect to external domains -->
        <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
        <link rel="dns-prefetch" href="https://fonts.bunny.net">

        <!-- Optimized font loading -->
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" media="print" onload="this.media='all';">
        <noscript><link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet"></noscript>

        <!-- Preload critical resources -->
        @vite(['resources/js/app.jsx'], ['preload' => true])

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead

        <!-- Inline critical CSS if needed -->
        <style>
            /* Critical CSS para evitar FOUC */
            body {
                font-family: system-ui, -apple-system, sans-serif;
                margin: 0;
                background-color: #f8fafc;
            }
            .loading-spinner {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #3498db;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    </head>
    <body class="font-sans antialiased">
        @inertia

        <!-- Fallback para JavaScript deshabilitado -->
        <noscript>
            <div style="text-align: center; padding: 50px;">
                <h1>JavaScript requerido</h1>
                <p>Esta aplicación requiere JavaScript para funcionar correctamente.</p>
            </div>
        </noscript>
    </body>
</html>
