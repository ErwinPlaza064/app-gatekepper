<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Visitor;
use App\Models\QRCode;
use App\Notifications\NewVisitorNotification;

class VisitorController extends Controller
{
    public function registerFromQR(Request $request)
    {
        $validated = $request->validate([
            'visitor_name' => 'required|string',
            'document_id' => 'required|string',
            'resident_id' => 'required|integer|exists:users,id',
            'vehicle_plate' => 'nullable|string',
        ]);

        // Verificar si el documento ya fue registrado
        if (Visitor::where('id_document', $validated['document_id'])->exists()) {
            return response()->json(['error' => 'Este código QR ya ha sido escaneado'], 400);
        }

        // Registrar el visitante
        $visitor = Visitor::create([
            'name' => $validated['visitor_name'],
            'id_document' => $validated['document_id'],
            'user_id' => $validated['resident_id'],
            'vehicle_plate' => $validated['vehicle_plate'],
            'entry_time' => now(),
        ]);

        // Notificar al residente
        $resident = $visitor->user;
        if ($resident) {
            $resident->notify(new NewVisitorNotification($visitor));
        }

        return response()->json(['message' => 'Visitante registrado con éxito', 'visitor' => $visitor], 201);
    }
}
