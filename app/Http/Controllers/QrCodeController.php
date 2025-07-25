<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\QrCode;
use Carbon\Carbon;

class QrCodeController extends Controller
{
    public function getUserQrCodes(Request $request)
    {
        $userId = auth()->id();

        if (!$userId) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $qrCodes = QrCode::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($qr) {
                return [
                    'id' => $qr->id,
                    'qr_id' => $qr->qr_id,
                    'visitor_name' => $qr->visitor_name,
                    'document_id' => $qr->document_id,
                    'vehicle_plate' => $qr->vehicle_plate,
                    'qr_type' => $qr->qr_type,
                    'valid_until' => $qr->valid_until,
                    'max_uses' => $qr->max_uses,
                    'current_uses' => $qr->current_uses,
                    'is_active' => $qr->is_active,
                    'created_at' => $qr->created_at,
                    'status' => $this->getQrStatus($qr),
                    'time_remaining' => $this->getTimeRemaining($qr),
                ];
            });

        return response()->json($qrCodes);
    }

    public function store(Request $request)
    {
        $userId = auth()->id();

        if (!$userId) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        try {
            $request->validate([
                'visitor_name' => 'required|string|max:255',
                'document_id' => 'required|string|max:50',
                'vehicle_plate' => 'nullable|string|max:10',
                'qr_type' => 'required|in:single_use,time_limited,recurring',
                'valid_until' => 'nullable|date',
                'max_uses' => 'required|integer|min:1',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        }

        // Generar un ID único para el QR
        $qrId = 'QR-' . strtoupper(uniqid());

        try {
            $qrCode = QrCode::create([
                'user_id' => $userId,
                'qr_id' => $qrId,
                'visitor_name' => $request->visitor_name,
                'document_id' => $request->document_id,
                'vehicle_plate' => $request->vehicle_plate,
                'qr_type' => $request->qr_type,
                'valid_until' => $request->valid_until,
                'max_uses' => $request->max_uses,
                'current_uses' => 0,
                'is_active' => true,
            ]);

            return response()->json([
                'message' => 'QR creado correctamente',
                'qr_code' => [
                    'id' => $qrCode->id,
                    'qr_id' => $qrCode->qr_id,
                    'visitor_name' => $qrCode->visitor_name,
                    'document_id' => $qrCode->document_id,
                    'vehicle_plate' => $qrCode->vehicle_plate,
                    'qr_type' => $qrCode->qr_type,
                    'valid_until' => $qrCode->valid_until,
                    'max_uses' => $qrCode->max_uses,
                    'current_uses' => $qrCode->current_uses,
                    'is_active' => $qrCode->is_active,
                    'created_at' => $qrCode->created_at,
                    'user_id' => $qrCode->user_id,
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al crear el QR en la base de datos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deactivateQr(Request $request, $qrId)
    {
        $userId = auth()->id();

        if (!$userId) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $qrCode = QrCode::where('id', $qrId)
            ->where('user_id', $userId)
            ->first();

        if (!$qrCode) {
            return response()->json(['message' => 'QR no encontrado'], 404);
        }

        if (!$qrCode->is_active) {
            return response()->json(['message' => 'El QR ya está desactivado'], 400);
        }

        $qrCode->update(['is_active' => false]);

        return response()->json([
            'message' => 'QR desactivado correctamente',
            'qr_code' => [
                'id' => $qrCode->id,
                'status' => $this->getQrStatus($qrCode->fresh()),
                'is_active' => false
            ]
        ]);
    }

    public function reactivateQr(Request $request, $qrId)
    {
        $userId = auth()->id();

        if (!$userId) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $qrCode = QrCode::where('id', $qrId)
            ->where('user_id', $userId)
            ->first();

        if (!$qrCode) {
            return response()->json(['message' => 'QR no encontrado'], 404);
        }

        if ($qrCode->is_active) {
            return response()->json(['message' => 'El QR ya está activo'], 400);
        }

        if ($qrCode->valid_until && Carbon::now()->isAfter($qrCode->valid_until)) {
            return response()->json(['message' => 'No se puede reactivar un QR expirado'], 400);
        }

        if ($qrCode->current_uses >= $qrCode->max_uses) {
            return response()->json(['message' => 'No se puede reactivar un QR que alcanzó el límite de usos'], 400);
        }

        $qrCode->update(['is_active' => true]);

        return response()->json([
            'message' => 'QR reactivado correctamente',
            'qr_code' => [
                'id' => $qrCode->id,
                'status' => $this->getQrStatus($qrCode->fresh()),
                'is_active' => true
            ]
        ]);
    }

    private function getQrStatus($qr)
    {
        if (!$qr->is_active) {
            return 'inactive';
        }

        if ($qr->valid_until && Carbon::now()->isAfter($qr->valid_until)) {
            return 'expired';
        }

        if ($qr->current_uses >= $qr->max_uses) {
            return 'exhausted';
        }

        return 'active';
    }

    private function getTimeRemaining($qr)
    {
        if (!$qr->valid_until || Carbon::now()->isAfter($qr->valid_until)) {
            return null;
        }

        $now = Carbon::now();
        $expiry = Carbon::parse($qr->valid_until);

        return [
            'total_hours' => $now->diffInHours($expiry),
            'human' => $now->diffForHumans($expiry, true)
        ];
    }
}
