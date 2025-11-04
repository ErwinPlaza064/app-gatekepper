<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\User;
use App\Models\Visitor;
use Carbon\Carbon;

class NotificationController extends Controller
{
    /**
     * Obtener todas las notificaciones del usuario autenticado
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json(['message' => 'No autenticado'], 401);
            }

            // Obtener todas las notificaciones del usuario, ordenadas por fecha más reciente
            $notifications = $user->notifications()
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($notification) {
                    $data = $notification->data;
                    
                    // Determinar el tipo de notificación
                    $type = $notification->type;
                    $isRead = $notification->read_at !== null;
                    
                    // Extraer información según el tipo de notificación
                    $formatted = [
                        'id' => $notification->id,
                        'type' => $type,
                        'read' => $isRead,
                        'created_at' => $notification->created_at->format('Y-m-d H:i:s'),
                        'created_at_formatted' => $notification->created_at->format('d/m, H:i'),
                        'created_at_short' => $notification->created_at->format('d/m/y, H:i'),
                    ];

                    // Si es una notificación de visitante
                    if (str_contains($type, 'Visitor')) {
                        $visitor = $data['visitor'] ?? null;
                        
                        if ($visitor) {
                            $formatted['title'] = 'Nueva solicitud de visita';
                            $formatted['visitor_name'] = $visitor['name'] ?? 'Visitante';
                            $formatted['document_type'] = $visitor['document_type'] ?? 'N/A';
                            $formatted['vehicle'] = $visitor['vehicle'] ?? null;
                            $formatted['status'] = $visitor['status'] ?? 'pending';
                            $formatted['expired'] = $visitor['expired'] ?? false;
                            $formatted['expires_at'] = $visitor['expires_at'] ?? null;
                        }
                    } 
                    // Si es una notificación de aprobación
                    else if (str_contains($type, 'Approval')) {
                        $visitor = $data['visitor'] ?? null;
                        
                        if ($visitor) {
                            $formatted['title'] = 'Solicitud de aprobación';
                            $formatted['visitor_name'] = $visitor['name'] ?? 'Visitante';
                            $formatted['document_type'] = $visitor['document_type'] ?? 'N/A';
                            $formatted['vehicle'] = $visitor['vehicle'] ?? null;
                            $formatted['status'] = $visitor['status'] ?? 'pending';
                        }
                    }
                    // Si es una notificación de visita
                    else if (str_contains($type, 'NewVisitor') || str_contains($type, 'Visitor')) {
                        $visitor = $data['visitor'] ?? $data;
                        $formatted['title'] = 'Nueva visita';
                        $formatted['message'] = ($visitor['name'] ?? 'Un visitante') . ' va a tu domicilio.';
                        $formatted['visitor_name'] = $visitor['name'] ?? null;
                    }
                    // Notificación genérica
                    else {
                        $formatted['title'] = $data['title'] ?? 'Notificación';
                        $formatted['message'] = $data['message'] ?? $data['body'] ?? '';
                    }

                    return $formatted;
                });

            return response()->json($notifications);
        } catch (\Exception $e) {
            \Log::error('Error fetching notifications for user ' . $request->user()->id . ': ' . $e->getMessage());
            return response()->json(['message' => 'Error al cargar las notificaciones', 'error' => $e->getMessage()], 500);
        }
    }

    public function markAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Server-Sent Events endpoint para notificaciones en tiempo real
     * Alternativa a Pusher cuando hay problemas de conectividad
     */
    public function sseNotifications(Request $request)
    {
        // Verificar autenticación
        if (!auth()->check() || auth()->user()->rol !== 'administrador') {
            abort(403, 'No autorizado');
        }

        return response()->stream(function() {
            $lastCheck = Carbon::now()->subMinutes(1); // Empezar 1 minuto atrás
            
            // Headers SSE
            echo "data: " . json_encode([
                'type' => 'connected',
                'message' => 'Conectado al sistema de notificaciones SSE',
                'timestamp' => now()->toISOString()
            ]) . "\n\n";
            
            if (ob_get_level()) ob_flush();
            flush();
            
            // Loop principal
            while (true) {
                // Verificar visitantes actualizados recientemente
                $recentVisitors = Visitor::where('updated_at', '>=', $lastCheck)
                    ->whereColumn('updated_at', '!=', 'created_at') // Solo actualizaciones
                    ->orderBy('updated_at', 'desc')
                    ->limit(5)
                    ->get();
                
                foreach ($recentVisitors as $visitor) {
                    $notification = [
                        'type' => 'visitor_status_updated',
                        'visitor' => [
                            'id' => $visitor->id,
                            'name' => $visitor->name,
                            'status' => $visitor->status,
                            'updated_at' => $visitor->updated_at->toISOString()
                        ],
                        'message' => "Visitante {$visitor->name} ha sido " . 
                                   ($visitor->status === 'approved' ? 'aprobado' : 
                                   ($visitor->status === 'rejected' ? 'rechazado' : 'actualizado')),
                        'timestamp' => now()->toISOString()
                    ];
                    
                    echo "data: " . json_encode($notification) . "\n\n";
                    if (ob_get_level()) ob_flush();
                    flush();
                }
                
                $lastCheck = Carbon::now();
                
                // Verificar conexión cada 30 segundos
                if (connection_aborted()) break;
                sleep(30);
                
                // Ping para mantener conexión
                echo "data: " . json_encode([
                    'type' => 'ping',
                    'timestamp' => now()->toISOString()
                ]) . "\n\n";
                if (ob_get_level()) ob_flush();
                flush();
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no'
        ]);
    }
    
    /**
     * Test SSE notifications
     */
    public function testSseNotification()
    {
        $visitor = Visitor::first();
        if ($visitor) {
            $visitor->touch(); // Forzar actualización
            
            return response()->json([
                'success' => true,
                'message' => 'Notificación SSE simulada',
                'visitor' => $visitor->name,
                'note' => 'Revisa el panel admin con SSE activo'
            ]);
        }
        
        return response()->json(['error' => 'No hay visitantes para probar'], 404);
    }
}
