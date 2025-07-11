<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\VisitorController;
use App\Http\Controllers\QrController;
use App\Http\Controllers\QrCodeController;



Route::middleware('auth:sanctum')->get('/notifications', [NotificationController::class, 'index']);

Route::post('/scan-qr', [VisitorController::class, 'registerFromQR']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/qr/upload', [QrController::class, 'upload']);
