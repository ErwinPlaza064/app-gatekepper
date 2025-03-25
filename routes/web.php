<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;


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


Route::get('/success', function () {
    return Inertia::render('Email/ResponseEmail');
})->name('success');

Route::get('/error', function () {
    return Inertia::render('Auth/Error');
})->name('error');

Route::middleware(['auth', 'verified'])->get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Autenticación
require __DIR__.'/auth.php';
