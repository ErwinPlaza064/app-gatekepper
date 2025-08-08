<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Visitor;
use App\Models\User;
use App\Jobs\EnviarWhatsAppJob;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class ApprovalController extends Controller
{
    /**
     * Solicitar aprobación para un visitante espontáneo
     * Se llama desde el panel de Filament cuando el portero registra un visitante sin QR
     */
    public function requestApproval(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'id_document' => 'required|string|max:50',
            'user_id' => 'required|exists:users,id',
            'vehicle_plate' => 'nullable|string|max:20',
            'notes' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            // Crear el visitante con estado pendiente
            $visitor = Visitor::create([
                'name' => $request->name,
                'id_document' => $request->id_document,
                'user_id' => $request->user_id,
                'vehicle_plate' => $request->vehicle_plate,
                'approval_notes' => $request->notes,
            ]);

            // Solicitar aprobación (genera token y cambia estado)
            $visitor->requestApproval();

            // Obtener el residente
            $resident = User::find($request->user_id);

            if (!$resident) {
                throw new \Exception('Residente no encontrado');
            }

            // Enviar notificación de WhatsApp si está habilitado
            if ($resident->phone && $resident->whatsapp_notifications) {
                $this->sendApprovalRequest($visitor, $resident);
            }

            DB::commit();

            Log::info('Solicitud de aprobación creada', [
                'visitor_id' => $visitor->id,
                'visitor_name' => $visitor->name,
                'resident' => $resident->name,
                'token' => $visitor->approval_token,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Solicitud de aprobación enviada al residente',
                'visitor' => $visitor->load('user'),
                'timeout_minutes' => 7,
                'expires_at' => $visitor->approval_requested_at->addMinutes(7),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al solicitar aprobación', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al procesar la solicitud: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Aprobar visitante desde enlace público de WhatsApp
     * No requiere autenticación, usa token de seguridad
     */
    public function approvePublic($token)
    {
        try {
            $visitor = Visitor::findByApprovalToken($token);

            if (!$visitor) {
                return Inertia::render('Approval/Error', [
                    'message' => 'Enlace de aprobación inválido o expirado',
                ]);
            }

            // Verificar si ya fue procesado
            if (!$visitor->isPending()) {
                return Inertia::render('Approval/AlreadyProcessed', [
                    'visitor' => $visitor->load('user'),
                    'status' => $visitor->approval_status,
                ]);
            }

            // Verificar si expiró (más de 7 minutos)
            if ($visitor->isApprovalExpired()) {
                $visitor->autoApprove('Aprobado automáticamente por expiración de tiempo');
                
                return Inertia::render('Approval/Success', [
                    'message' => "✅ Visitante {$visitor->name} fue aprobado automáticamente por timeout",
                    'visitor' => $visitor->load('user'),
                    'auto_approved' => true,
                ]);
            }

            // Aprobar el visitante
            $visitor->approve(
                $visitor->user_id, // El residente que aprueba
                'Aprobado desde WhatsApp por el residente'
            );

            // Enviar confirmación por WhatsApp
            $this->sendApprovalConfirmation($visitor, 'approved');

            Log::info('Visitante aprobado desde WhatsApp', [
                'visitor_id' => $visitor->id,
                'visitor_name' => $visitor->name,
                'token' => $token,
            ]);

            return Inertia::render('Approval/Success', [
                'message' => "✅ Visitante {$visitor->name} aprobado correctamente",
                'visitor' => $visitor->load('user'),
                'auto_approved' => false,
            ]);

        } catch (\Exception $e) {
            Log::error('Error al aprobar visitante desde WhatsApp', [
                'token' => $token,
                'error' => $e->getMessage(),
            ]);

            return Inertia::render('Approval/Error', [
                'message' => 'Error al procesar la aprobación',
            ]);
        }
    }

    /**
     * Rechazar visitante desde enlace público de WhatsApp
     * No requiere autenticación, usa token de seguridad
     */
    public function rejectPublic($token)
    {
        try {
            $visitor = Visitor::findByApprovalToken($token);

            if (!$visitor) {
                return Inertia::render('Approval/Error', [
                    'message' => 'Enlace de rechazo inválido o expirado',
                ]);
            }

            // Verificar si ya fue procesado
            if (!$visitor->isPending()) {
                return Inertia::render('Approval/AlreadyProcessed', [
                    'visitor' => $visitor->load('user'),
                    'status' => $visitor->approval_status,
                ]);
            }

            // Rechazar el visitante
            $visitor->reject(
                $visitor->user_id, // El residente que rechaza
                'Rechazado desde WhatsApp por el residente'
            );

            // Enviar confirmación por WhatsApp
            $this->sendApprovalConfirmation($visitor, 'rejected');

            Log::info('Visitante rechazado desde WhatsApp', [
                'visitor_id' => $visitor->id,
                'visitor_name' => $visitor->name,
                'token' => $token,
            ]);

            return Inertia::render('Approval/Rejected', [
                'message' => "Visitante {$visitor->name} rechazado correctamente",
                'visitor' => $visitor->load('user'),
            ]);

        } catch (\Exception $e) {
            Log::error('Error al rechazar visitante desde WhatsApp', [
                'token' => $token,
                'error' => $e->getMessage(),
            ]);

            return Inertia::render('Approval/Error', [
                'message' => 'Error al procesar el rechazo',
            ]);
        }
    }

    /**
     * Obtener visitantes pendientes de aprobación
     * Para el panel de administración (monitoreo)
     */
    public function pendingVisitors()
    {
        try {
            $pendingVisitors = Visitor::pendingApproval()
                ->with(['user', 'approvedBy'])
                ->orderBy('approval_requested_at', 'desc')
                ->get()
                ->map(function ($visitor) {
                    return [
                        'id' => $visitor->id,
                        'name' => $visitor->name,
                        'id_document' => $visitor->id_document,
                        'vehicle_plate' => $visitor->vehicle_plate,
                        'resident' => $visitor->user->name ?? 'N/A',
                        'apartment' => $visitor->user->address ?? 'N/A',
                        'requested_at' => $visitor->approval_requested_at,
                        'expires_at' => $visitor->approval_requested_at?->addMinutes(7),
                        'minutes_remaining' => $visitor->approval_requested_at ? 
                            max(0, Carbon::now()->diffInMinutes($visitor->approval_requested_at->addMinutes(7), false)) : 0,
                        'is_expired' => $visitor->isApprovalExpired(),
                    ];
                });

            return response()->json([
                'success' => true,
                'visitors' => $pendingVisitors,
            ]);

        } catch (\Exception $e) {
            Log::error('Error al obtener visitantes pendientes', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al obtener visitantes pendientes',
            ], 500);
        }
    }

    /**
     * Auto-aprobar visitantes que han expirado
     * Se puede llamar desde un job o desde el frontend
     */
    public function processExpiredApprovals()
    {
        try {
            $expiredVisitors = Visitor::pendingApproval()
                ->where('approval_requested_at', '<=', Carbon::now()->subMinutes(7))
                ->get();

            $processed = 0;
            foreach ($expiredVisitors as $visitor) {
                $visitor->autoApprove();
                $this->sendApprovalConfirmation($visitor, 'auto_approved');
                $processed++;
            }

            Log::info("Auto-aprobados {$processed} visitantes por timeout");

            return response()->json([
                'success' => true,
                'processed' => $processed,
                'message' => "Procesados {$processed} visitantes por timeout",
            ]);

        } catch (\Exception $e) {
            Log::error('Error al procesar aprobaciones expiradas', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al procesar aprobaciones expiradas',
            ], 500);
        }
    }

    /**
     * Enviar solicitud de aprobación por WhatsApp
     */
    private function sendApprovalRequest(Visitor $visitor, User $resident)
    {
        $approveUrl = route('approval.approve.public', $visitor->approval_token);
        $rejectUrl = route('approval.reject.public', $visitor->approval_token);

        EnviarWhatsAppJob::dispatch(
            $resident->phone,
            'solicitud_aprobacion',
            [
                'visitante' => $visitor,
                'residente' => $resident,
                'approve_url' => $approveUrl,
                'reject_url' => $rejectUrl,
            ]
        );

        Log::info('Solicitud de aprobación enviada por WhatsApp', [
            'visitor_id' => $visitor->id,
            'resident_phone' => $resident->phone,
            'approve_url' => $approveUrl,
        ]);
    }

    /**
     * Enviar confirmación de aprobación/rechazo
     */
    private function sendApprovalConfirmation(Visitor $visitor, string $action)
    {
        if ($visitor->user && $visitor->user->phone && $visitor->user->whatsapp_notifications) {
            EnviarWhatsAppJob::dispatch(
                $visitor->user->phone,
                'respuesta_aprobacion',
                [
                    'visitante' => $visitor,
                    'action' => $action, // 'approved', 'rejected', 'auto_approved'
                ]
            );
        }
    }
}
