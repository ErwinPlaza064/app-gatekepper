<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Visitor;
use App\Models\QrCode;
use App\Notifications\NewVisitorNotification;
use App\Notifications\QrUsedNotification;

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
                $qrCode->user->notify(new QrUsedNotification($qrCode));
            } else {
                // Si no existe el QR, crear registro
                $qrData = $validated['qr_data'] ?? [];
                $qrCode = QrCode::create([
                    'qr_id' => $validated['qr_id'],
                    'user_id' => $validated['resident_id'],
                    'visitor_name' => $validated['visitor_name'],
                    'document_id' => $validated['document_id'],
                    'vehicle_plate' => $validated['vehicle_plate'],
                    'qr_type' => $qrData['qr_type'] ?? 'single_use',
                    'valid_until' => isset($qrData['valid_until']) ? $qrData['valid_until'] : null,
                    'max_uses' => $qrData['max_uses'] ?? 1,
                    'current_uses' => 1,
                    'is_active' => ($qrData['qr_type'] ?? 'single_use') !== 'single_use',
                    'metadata' => $qrData
                ]);
                $qrCode->user->notify(new QrUsedNotification($qrCode));
            }
        }

        // Crear visitante (código existente)
        $visitor = Visitor::create([
            'name' => $validated['visitor_name'],
            'id_document' => $validated['document_id'],
            'user_id' => $validated['resident_id'],
            'vehicle_plate' => $validated['vehicle_plate'],
            'entry_time' => now(),
            'qr_code_id' => $qrCode ? $qrCode->id : null,
        ]);

        $resident = $visitor->user;

        if ($resident) {
            $resident->notify(new NewVisitorNotification($visitor));
        }

        return response()->json(['message' => 'Visitante registrado con éxito', 'visitor' => $visitor], 201);
    }

    public function getUserVisitors(Request $request)
    {
        $userId = auth()->id();

        if (!$userId) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $query = Visitor::where('user_id', $userId)
            ->with(['qrCode' => function($q) {
                $q->select('id', 'qr_id', 'qr_type');
            }])
            ->orderBy('entry_time', 'desc');

        // Aplicar filtros si existen
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('id_document', 'like', "%{$search}%");
            });
        }

        if ($request->has('dateFrom') && !empty($request->dateFrom)) {
            $query->whereDate('entry_time', '>=', $request->dateFrom);
        }

        if ($request->has('dateTo') && !empty($request->dateTo)) {
            $query->whereDate('entry_time', '<=', $request->dateTo);
        }

        $visitors = $query->limit(50)->get();

        return response()->json($visitors);
    }

    public function getRecentScans()
    {
        // Obtener los últimos 20 escaneos para administradores
        $recentScans = Visitor::with(['user:id,name'])
            ->orderBy('entry_time', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($visitor) {
                return [
                    'id' => $visitor->id,
                    'name' => $visitor->name,
                    'id_document' => $visitor->id_document,
                    'vehicle_plate' => $visitor->vehicle_plate,
                    'entry_time' => $visitor->entry_time,
                    'user' => $visitor->user ? [
                        'id' => $visitor->user->id,
                        'name' => $visitor->user->name
                    ] : null
                ];
            });

        return response()->json($recentScans);
    }
}
