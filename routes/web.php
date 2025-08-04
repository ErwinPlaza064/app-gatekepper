<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\VisitorController;
use App\Http\Controllers\QrCodeController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ContactController;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Artisan;


Route::get('/check-auth', function () {
    if (Auth::check()) {
        $user = Auth::user();
        return "Autenticado: {$user->email}, Rol: {$user->rol}";
    }
    return 'No autenticado';
});

Route::get('/test-whatsapp', function() {
    $whatsapp = new \App\Services\WhatsAppService();

    // CAMBIA ESTE NÚMERO POR TU NÚMERO DE TELÉFONO
    $resultado = $whatsapp->enviarMensaje('+524641226304', '🎉 ¡Prueba de WhatsApp desde Gatekeeper! 🎉');

    return response()->json($resultado);
});

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/welcome',function(){
    return Inertia::render('Welcome');
})->name('welcome');

Route::middleware(['auth', 'verified'])->get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

Route::post('/notifications/mark-all-read', [DashboardController::class, 'markNotificationsAsRead'])
    ->middleware('auth')
    ->name('notifications.markAllRead');

Route::get('/mis-visitas', [DashboardController::class, 'misVisitas'])->middleware(['auth', 'verified'])->name('mis-visitas');

Route::get("/contacto", function(){
    return Inertia::render('Links/Contact');
})->name('contacto');

Route::get("/reglamento", function(){
    return Inertia::render('Links/Reglamento');
})->name('reglamento');

Route::get('/success', function () {
    return Inertia::render('Email/ResponseEmail');
})->name('success');

Route::post('/send-email', [ContactController::class, 'send'])->name('contact.send');

Route::get('/error', function () {
    return Inertia::render('Auth/Error');
})->name('error');

Route::post('/complaints', [DashboardController::class, 'store'])->name('complaints.store');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/api/user/qr-codes', [QrCodeController::class, 'getUserQrCodes']);
    Route::patch('/api/qr-codes/{qrId}/deactivate', [QrCodeController::class, 'deactivateQr']);
    Route::patch('/api/qr-codes/{qrId}/reactivate', [QrCodeController::class, 'reactivateQr']);
    Route::get('/api/user/visitors', [VisitorController::class, 'getUserVisitors']);
    Route::post('/api/qr-codes', [QrCodeController::class, 'store']);
});

Route::get('/create-admin', function () {
    if (App\Models\User::count() === 0) {
        App\Models\User::create([
            'name' => 'Admin',
            'email' => 'admin@admin.com',
            'password' => Hash::make('admin'),
            'email_verified_at' => now(),
        ]);
        return 'Usuario admin creado! Email: admin@admin.com, Password: password123';
    }
    return 'Ya existe un usuario admin';
});

Route::get('/clear-cache', function () {
    Artisan::call('cache:clear');
    Artisan::call('config:clear');
    Artisan::call('route:clear');
    return 'Cache limpiado';
});


Route::get('/csrf-token', function() {
    return response()->json([
        'csrf_token' => csrf_token(),
        'app_url' => config('app.url'),
        'session_domain' => config('session.domain'),
        'session_secure' => config('session.secure'),
        'cors_origins' => config('cors.allowed_origins'),
    ]);
});


require __DIR__.'/auth.php';

