<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Visitor;
use App\Models\QrCode;
use App\Notifications\NewVisitorNotification;

class VisitorController extends Controller
{
    public function registerFromQR(Request $request)
    {
        $validated = $request->validate([
            'qr_id' => 'nullable|string',
            'visitor_name' => 'required|string',
            'document_id' => 'required|string',
            'resident_id' => 'required|integer|exists:users,id',
            'vehicle_plate' => 'required|string',
            'qr_type' => 'nullable|string',
            'qr_data' => 'nullable|array',
        ]);

        // Si tiene qr_id, validar el QR
        if (isset($validated['qr_id'])) {
            $qrCode = QrCode::where('qr_id', $validated['qr_id'])->first();

            if ($qrCode) {
                $validation = $qrCode->canBeUsed();
                if (!$validation['valid']) {
                    return response()->json(['message' => $validation['message']], 400);
                }

                // Incrementar uso
                $qrCode->incrementUsage();
            } else {
                // Si no existe el QR, crear registro
                $qrData = $validated['qr_data'] ?? [];
                QrCode::create([
                    'qr_id' => $validated['qr_id'],
                    'user_id' => $validated['resident_id'],
                    'visitor_name' => $validated['visitor_name'],
                    'document_id' => $validated['document_id'],
                    'vehicle_plate' => $validated['vehicle_plate'],
                    'qr_type' => $qrData['qr_type'] ?? 'single_use',
                    'valid_until' => isset($qrData['valid_until']) ? $qrData['valid_until'] : null,
                    'max_uses' => $qrData['max_uses'] ?? 1,
                    'current_uses' => 1,
                    'is_active' => $qrData['qr_type'] !== 'single_use',
                    'metadata' => $qrData
                ]);
            }
        }

        // Crear visitante (código existente)
        $visitor = Visitor::create([
            'name' => $validated['visitor_name'],
            'id_document' => $validated['document_id'],
            'user_id' => $validated['resident_id'],
            'vehicle_plate' => $validated['vehicle_plate'],
            'entry_time' => now(),
        ]);

        $resident = $visitor->user;

        if ($resident) {
            $resident->notify(new NewVisitorNotification($visitor));
        }

        return response()->json(['message' => 'Visitante registrado con éxito', 'visitor' => $visitor], 201);
    }
}
