<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\VisitorController;
use App\Http\Controllers\QrController;
use App\Http\Controllers\QrCodeController;
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\ApprovalController;



Route::middleware('auth:sanctum')->get('/notifications', [NotificationController::class, 'index']);

Route::post('/scan-qr', [VisitorController::class, 'registerFromQR']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/qr/upload', [QrController::class, 'upload']);

Route::get('/recent-visitor-scans', [VisitorController::class, 'getRecentScans']);

Route::post('/push/subscribe', function (Request $request) {
    $request->user()->updatePushSubscription(
        $request->endpoint,
        $request->keys['p256dh'],
        $request->keys['auth']
    );
    return response()->json(['success' => true]);
})->middleware('auth:sanctum');

// Rutas para el sistema de aprobación de visitantes
Route::prefix('approval')->name('approval.')->group(function () {
    // Solicitar aprobación para visitante espontáneo (requiere auth)
    Route::post('/request', [ApprovalController::class, 'requestApproval'])
         ->middleware('auth:sanctum')
         ->name('request');
    
    // Obtener visitantes pendientes de aprobación (para monitoreo en admin)
    Route::get('/pending', [ApprovalController::class, 'pendingVisitors'])
         ->middleware('auth:sanctum')
         ->name('pending');
    
    // Procesar aprobaciones expiradas (auto-aprobar por timeout)
    Route::post('/process-expired', [ApprovalController::class, 'processExpiredApprovals'])
         ->middleware('auth:sanctum')
         ->name('process.expired');
});

