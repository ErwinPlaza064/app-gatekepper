<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\VisitorController;
use App\Http\Controllers\QrController;
use App\Http\Controllers\QrCodeController;
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\Auth\MobileAuthController;

// ============================================
// RUTAS PÚBLICAS (sin autenticación)
// ============================================

Route::post('/scan-qr', [VisitorController::class, 'registerFromQR']);

Route::get('/recent-visitor-scans', [VisitorController::class, 'getRecentScans']);

// ============================================
// RUTAS DE AUTENTICACIÓN MÓVIL
// ============================================

Route::prefix('mobile')->group(function () {
    Route::post('/login', [MobileAuthController::class, 'login']);
    Route::post('/register', [MobileAuthController::class, 'register']);
});

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================

Route::middleware('auth:sanctum')->group(function () {
    // Usuario actual
    Route::get('/user', [MobileAuthController::class, 'user']);
    
    // Logout móvil
    Route::post('/mobile/logout', [MobileAuthController::class, 'logout']);
    
    // Notificaciones
    Route::get('/notifications', [NotificationController::class, 'index']);
    
    // Visitantes
    Route::get('/user/visitors', [VisitorController::class, 'getUserVisitors']);
    
    // QR Codes
    Route::get('/user/qr-codes', [QrCodeController::class, 'getUserQrCodes']);
    Route::post('/qr-codes', [QrCodeController::class, 'store']);
    Route::patch('/qr-codes/{qrId}/deactivate', [QrCodeController::class, 'deactivateQr']);
    Route::patch('/qr-codes/{qrId}/reactivate', [QrCodeController::class, 'reactivateQr']);
    Route::post('/qr/upload', [QrController::class, 'upload']);
    
    // Aprobaciones
    Route::get('/approval/pending', [ApprovalController::class, 'pendingVisitors']);
    Route::post('/approval/approve', [ApprovalController::class, 'approveApi']);
    Route::post('/approval/reject', [ApprovalController::class, 'rejectApi']);
    
    // Quejas
    Route::get('/complaints', [ComplaintController::class, 'index']);
    Route::post('/complaints', [ComplaintController::class, 'store']);
    
    // Push Notifications (Expo)
    Route::post('/push/subscribe', function (Request $request) {
        $request->validate([
            'endpoint' => 'required|string', // Expo Push Token
        ]);

        $user = $request->user();
        $user->expo_push_token = $request->endpoint;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Token de notificaciones push registrado exitosamente',
        ]);
    });
});

