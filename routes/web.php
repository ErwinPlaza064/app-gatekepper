<?php

use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SendEmailController;


Route::get('/auth/google', [GoogleController::class, 'redirectToGoogle'])->name('google.login');
Route::get('/auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);

Route::middleware(['auth'])->get('/notifications', [NotificationController::class, 'index']);


Route::post('/notifications/mark-as-read', [DashboardController::class, 'markNotificationsAsRead'])
    ->middleware('auth')
    ->name('notifications.markAsRead');

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/ask_login', function () {
    return Inertia::render('Ask/Ask_Login');
})->name('ask_login');

Route::get('/welcome',function(){
    return Inertia::render('Welcome');
})->name('welcome');

Route::get('/registrovisit',function(){
    return Inertia::render('Links/RegistroVisit');
})->name('registrovisit');

Route::get('/mis-visitas', [DashboardController::class, 'misVisitas'])
    ->middleware(['auth'])
    ->name('mis-visitas');

Route::get('/soporte',function(){
    return Inertia::render('Links/Soporte');
})->name('soporte');

Route::get('/reglamento',function(){
    return Inertia::render('Links/Reglamento');
})->name('reglamento');

Route::get('/contacto', function(){
    return Inertia::render('Links/Contact');
})->name('contact');

Route::get('/success', function () {
    return Inertia::render('Email/ResponseEmail');
})->name('success');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified'])->get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');


require __DIR__.'/auth.php';
