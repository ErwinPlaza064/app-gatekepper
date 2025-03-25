<?php

use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SendEmailController;


// Notificaciones
Route::middleware(['auth'])->get('/notifications', [NotificationController::class, 'index']);
Route::post('/notifications/mark-as-read', [DashboardController::class, 'markNotificationsAsRead'])
    ->middleware('auth')
    ->name('notifications.markAsRead');

// Páginas estáticas y otras rutas
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

Route::get('/mis-visitas', [DashboardController::class, 'misVisitas'])
    ->middleware(['auth'])
    ->name('mis-visitas');

Route::get('/reglamento', [DashboardController::class, 'reglamento'])
    ->middleware(['auth'])
    ->name('reglamento');

    Route::get('/contacto', [DashboardController::class, 'contacto'])
    ->middleware(['auth'])
    ->name('contacto');

Route::get('/success', function () {
    return Inertia::render('Email/ResponseEmail');
})->name('success');

Route::get('/error', function () {
    return Inertia::render('Auth/Error');
})->name('error');


// Dashboard y perfil
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Autenticación
require __DIR__.'/auth.php';
