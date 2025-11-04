<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Complaint;
use Illuminate\Support\Facades\Log;

class ComplaintController extends Controller
{
    public function index(Request $request)
    {
        try {
            $userId = auth()->id();

            if (!$userId) {
                return response()->json(['message' => 'No autenticado'], 401);
            }

            $complaints = Complaint::where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->get(['id', 'message', 'created_at']);

            return response()->json($complaints);
        } catch (\Exception $e) {
            Log::error('Error obteniendo quejas:', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Error al obtener las quejas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $userId = auth()->id();

            if (!$userId) {
                return response()->json(['message' => 'No autenticado'], 401);
            }

            $request->validate([
                'message' => 'required|string|max:255',
            ]);

            $complaint = Complaint::create([
                'message' => $request->message,
                'user_id' => $userId,
            ]);

            return response()->json([
                'message' => 'Queja enviada correctamente',
                'complaint' => [
                    'id' => $complaint->id,
                    'message' => $complaint->message,
                    'created_at' => $complaint->created_at,
                ]
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creando queja:', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Error al crear la queja',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

