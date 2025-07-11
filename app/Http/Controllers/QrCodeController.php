<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\QrCode;
use Carbon\Carbon;

class QrCodeController extends Controller
{
    public function getUserQrCodes(Request $request)
    {
        // CAMBIAR de $request->user() a auth()->user()
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

    public function deactivateQr(Request $request, $qrId)
    {
        $userId = auth()->id();

        if (!$userId) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $qrCode = QrCode::where('qr_id', $qrId)
            ->where('user_id', $userId)
            ->first();

        if (!$qrCode) {
            return response()->json(['message' => 'QR no encontrado'], 404);
        }

        $qrCode->update(['is_active' => false]);

        return response()->json(['message' => 'QR desactivado correctamente']);
    }

    public function reactivateQr(Request $request, $qrId)
    {
        $userId = auth()->id();

        if (!$userId) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $qrCode = QrCode::where('qr_id', $qrId)
            ->where('user_id', $userId)
            ->first();

        if (!$qrCode) {
            return response()->json(['message' => 'QR no encontrado'], 404);
        }

        if ($qrCode->valid_until && Carbon::now()->isAfter($qrCode->valid_until)) {
            return response()->json(['message' => 'No se puede reactivar un QR expirado'], 400);
        }

        if ($qrCode->current_uses >= $qrCode->max_uses) {
            return response()->json(['message' => 'No se puede reactivar un QR que alcanzó el límite de usos'], 400);
        }

        $qrCode->update(['is_active' => true]);

        return response()->json(['message' => 'QR reactivado correctamente']);
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
