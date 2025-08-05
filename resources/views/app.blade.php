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

        <!-- Manual CSS loading to prevent preload warnings -->
        <link rel="stylesheet" href="{{ asset('build/assets/style-20429ede.css') }}" media="all">
        
        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx'])
        @inertiaHead

        <!-- Script to ensure CSS is used immediately -->
        <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Force CSS usage by computing styles
            const body = document.body;
            const computedStyle = window.getComputedStyle(body);
            const backgroundColor = computedStyle.backgroundColor;
            console.log('CSS ready:', backgroundColor);
        });
        </script>
    </head>
    <body class="font-sans antialiased bg-gray-50 dark:bg-gray-900">
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
