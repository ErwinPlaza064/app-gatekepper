<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\User;
use App\Models\Visitor;
use Carbon\Carbon;

class NotificationController extends Controller
{
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
        if (!auth()->check() || auth()->user()->role !== 'administrador') {
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
