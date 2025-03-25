<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;

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

Route::post('/notifications/mark-as-read', [DashboardController::class, 'markNotificationsAsRead'])
    ->middleware('auth')
    ->name('notifications.markAsRead');


Route::get('/mis-visitas', [DashboardController::class, 'misVisitas'])->middleware(['auth', 'verified'])->name('mis-visitas');


//Ruta para el envio de correos
Route::get('/success', function () {
    return Inertia::render('Email/ResponseEmail');
})->name('success');


//Ruta para Permisos de Usuario
Route::get('/error', function () {
    return Inertia::render('Auth/Error');
})->name('error');



Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
