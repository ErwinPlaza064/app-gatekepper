<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// Canal para notificaciones de administradores
Broadcast::channel('admin.notifications', function ($user) {
    try {
        // Debug para verificar autorización
        \Illuminate\Support\Facades\Log::info('Canal admin.notifications - Verificando autorización', [
            'user_id' => $user ? $user->id : 'No autenticado',
            'user_email' => $user ? $user->email : 'No disponible',
            'user_rol' => $user ? $user->rol : 'No disponible',
            'is_admin' => $user ? in_array($user->rol, ['administrador', 'admin']) : false,
            'auth_check' => \Illuminate\Support\Facades\Auth::check(),
            'session_id' => session()->getId(),
        ]);

        // Verificar que el usuario existe y está autenticado
        if (!$user || !$user->exists) {
            \Illuminate\Support\Facades\Log::warning('Canal admin.notifications - Usuario no existe o no autenticado');
            return false;
        }

        // Verificar que el usuario tiene el rol correcto
        if (!isset($user->rol)) {
            \Illuminate\Support\Facades\Log::warning('Canal admin.notifications - Usuario sin rol definido', [
                'user_id' => $user->id
            ]);
            return false;
        }

        // Aceptar tanto 'administrador' como 'admin'
        $isAuthorized = in_array($user->rol, ['administrador', 'admin']);

        \Illuminate\Support\Facades\Log::info('Canal admin.notifications - Resultado autorización', [
            'authorized' => $isAuthorized,
            'user_rol' => $user->rol
        ]);

        return $isAuthorized;
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Error en autorización del canal admin.notifications', [
            'error' => $e->getMessage(),
            'user_id' => $user ? $user->id : null
        ]);
        return false;
    }
});

// Canal específico para cada usuario
Broadcast::channel('private-user.{userId}', function ($user, $userId) {
    return $user && $user->id == $userId;
});

// Canal de Filament para notificaciones de base de datos
Broadcast::channel('filament.notifications.{userId}', function ($user, $userId) {
    return $user && $user->id == $userId;
});
