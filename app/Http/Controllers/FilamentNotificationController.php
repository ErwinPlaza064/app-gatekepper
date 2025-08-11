<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Visitor;
use Carbon\Carbon;

class FilamentNotificationController extends Controller
{
    /**
     * Verificar nuevas notificaciones para polling
     */
    public function checkNotifications(Request $request)
    {
        // Verificar autenticación de administrador
        if (!auth()->check() || auth()->user()->rol !== 'administrador') {
            return response()->json(['notifications' => []]);
        }

        // Obtener el último timestamp verificado desde la sesión
        $lastCheck = session('last_notification_check', Carbon::now()->subMinutes(1));
        
        // Buscar visitantes actualizados recientemente
        $recentVisitors = Visitor::where('updated_at', '>=', $lastCheck)
            ->whereColumn('updated_at', '!=', 'created_at') // Solo actualizaciones, no creaciones
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get();

        $notifications = [];
        
        foreach ($recentVisitors as $visitor) {
            $statusText = match($visitor->status) {
                'approved' => 'aprobado',
                'rejected' => 'rechazado',
                'pending' => 'marcado como pendiente',
                default => 'actualizado'
            };
            
            $notifications[] = [
                'title' => 'Estado de Visitante Actualizado',
                'body' => "El visitante {$visitor->name} ha sido {$statusText}",
                'visitor_id' => $visitor->id,
                'timestamp' => $visitor->updated_at->toISOString()
            ];
        }

        // Actualizar timestamp de última verificación
        session(['last_notification_check' => Carbon::now()]);

        return response()->json([
            'notifications' => $notifications,
            'count' => count($notifications),
            'last_check' => Carbon::now()->toISOString()
        ]);
    }

    /**
     * Marcar notificación como enviada para evitar duplicados
     */
    public function markSent(Request $request)
    {
        $visitorId = $request->input('visitor_id');
        
        if ($visitorId) {
            // Guardar en cache que esta notificación ya fue enviada
            cache()->put("notification_sent_{$visitorId}", true, 300); // 5 minutos
        }

        return response()->json(['success' => true]);
    }

    /**
     * Test manual de notificación
     */
    public function testNotification()
    {
        if (!auth()->check() || auth()->user()->rol !== 'administrador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        return response()->json([
            'notifications' => [
                [
                    'title' => 'Notificación de Prueba',
                    'body' => 'Esta es una notificación de prueba del sistema',
                    'timestamp' => now()->toISOString()
                ]
            ],
            'count' => 1,
            'test' => true
        ]);
    }
}
