<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

// Ruta de prueba para debugging de broadcasting
Route::post('/test-broadcasting-auth', function (Request $request) {
    $user = Auth::user();

    $data = [
        'authenticated' => Auth::check(),
        'user_exists' => $user !== null,
        'user_id' => $user ? $user->id : null,
        'user_email' => $user ? $user->email : null,
        'user_rol' => $user ? $user->rol : null,
        'is_admin' => $user ? in_array($user->rol, ['administrador', 'admin']) : false,
        'session_id' => session()->getId(),
        'csrf_token' => csrf_token(),
        'channel_name' => $request->input('channel_name'),
        'socket_id' => $request->input('socket_id'),
        'request_headers' => $request->headers->all(),
    ];

    \Illuminate\Support\Facades\Log::info('Test Broadcasting Auth', $data);

    return response()->json($data);
})->middleware(['web', 'auth']);
