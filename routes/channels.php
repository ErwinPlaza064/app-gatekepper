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

// Canal para notificaciones de administradores - TEMPORALMENTE MÁS PERMISIVO
Broadcast::channel('admin.notifications', function ($user) {
    // Log simplificado
    \Illuminate\Support\Facades\Log::info('Canal admin.notifications - Usuario:', [
        'authenticated' => $user ? 'SI' : 'NO',
        'user_rol' => $user ? $user->rol : 'sin usuario'
    ]);
    
    // Temporalmente: permitir cualquier usuario autenticado para probar
    return $user !== null;
});

// Canal específico para cada usuario
Broadcast::channel('private-user.{userId}', function ($user, $userId) {
    return $user && $user->id == $userId;
});

// Canal de Filament para notificaciones de base de datos
Broadcast::channel('filament.notifications.{userId}', function ($user, $userId) {
    return $user && $user->id == $userId;
});
