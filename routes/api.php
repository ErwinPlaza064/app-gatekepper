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

// Rutas de aprobación de visitantes
Route::middleware('auth:sanctum')->prefix('approval')->name('approval.')->group(function () {
    Route::post('/request', [ApprovalController::class, 'requestApproval'])->name('request');
    Route::get('/pending', [ApprovalController::class, 'pendingVisitors'])->name('pending');
    Route::post('/process-expired', [ApprovalController::class, 'processExpiredApprovals'])->name('process-expired');
    
    // Nuevas rutas para aprobación desde frontend
    Route::post('/approve', [ApprovalController::class, 'approveApi'])->name('approve');
    Route::post('/reject', [ApprovalController::class, 'rejectApi'])->name('reject');
});

