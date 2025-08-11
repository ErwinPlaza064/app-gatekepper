<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Visitor;
use App\Models\User;
use Carbon\Carbon;
use Filament\Notifications\Notification;
use Illuminate\Support\Facades\Log;

class FilamentNotificationController extends Controller
{
    /**
     * Verificar nuevas notificaciones para polling
     */
    public function checkNotifications(Request $request)
    {
        try {
            // Verificar autenticación básica
            if (!auth()->check()) {
                return response()->json(['notifications' => [], 'message' => 'No autenticado']);
            }

            // Verificar rol de administrador
            $user = auth()->user();
            if (!$user || $user->rol !== 'administrador') {
                return response()->json(['notifications' => [], 'message' => 'No autorizado']);
            }

            // Respuesta simple para testing
            return response()->json([
                'notifications' => [],
                'count' => 0,
                'status' => 'ok',
                'user' => $user->name,
                'timestamp' => now()->toISOString()
            ]);

        } catch (\Exception $e) {
            Log::error('Error en checkNotifications', [
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);

            return response()->json([
                'notifications' => [],
                'error' => 'Error: ' . $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
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

        // Crear notificaciones de prueba para todos los estados
        $user = auth()->user();
        
        // Notificación aprobado
        Notification::make()
            ->title('Estado de Visitante Actualizado')
            ->body('El visitante Juan Pérez ha sido APROBADO ✅')
            ->icon('heroicon-o-check-circle')
            ->iconColor('success')
            ->sendToDatabase($user);
            
        // Notificación rechazado
        Notification::make()
            ->title('Estado de Visitante Actualizado')
            ->body('El visitante María López ha sido RECHAZADO ❌')
            ->icon('heroicon-o-x-circle')
            ->iconColor('danger')
            ->sendToDatabase($user);

        return response()->json([
            'notifications' => [
                [
                    'title' => 'Estado de Visitante Actualizado',
                    'body' => 'El visitante Juan Pérez ha sido APROBADO ✅',
                    'color' => 'success',
                    'icon' => 'heroicon-o-check-circle',
                    'timestamp' => now()->toISOString()
                ],
                [
                    'title' => 'Estado de Visitante Actualizado', 
                    'body' => 'El visitante María López ha sido RECHAZADO ❌',
                    'color' => 'danger',
                    'icon' => 'heroicon-o-x-circle',
                    'timestamp' => now()->toISOString()
                ]
            ],
            'count' => 2,
            'test' => true
        ]);
    }

    /**
     * Forzar notificación cuando se actualiza un visitante (para debugging)
     */
    public function forceNotification($visitorId)
    {
        if (!auth()->check() || auth()->user()->rol !== 'administrador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $visitor = Visitor::find($visitorId);
        if (!$visitor) {
            return response()->json(['error' => 'Visitante no encontrado'], 404);
        }

        $statusText = match($visitor->status) {
            'approved' => 'APROBADO ✅',
            'rejected' => 'RECHAZADO ❌',
            'pending' => 'marcado como PENDIENTE ⏳',
            default => 'actualizado'
        };

        $statusIcon = match($visitor->status) {
            'approved' => 'heroicon-o-check-circle',
            'rejected' => 'heroicon-o-x-circle', 
            'pending' => 'heroicon-o-clock',
            default => 'heroicon-o-information-circle'
        };

        $statusColor = match($visitor->status) {
            'approved' => 'success',
            'rejected' => 'danger',
            'pending' => 'warning',
            default => 'info'
        };

        $mensaje = "El visitante {$visitor->name} ha sido {$statusText}";
        
        if ($visitor->status === 'rejected') {
            $mensaje .= "\n\n🚫 NO PERMITIR EL INGRESO";
        } elseif ($visitor->status === 'approved') {
            $mensaje .= "\n\n✅ AUTORIZAR INGRESO";
        }

        // Crear notificación en base de datos
        $user = auth()->user();
        Notification::make()
            ->title('Estado de Visitante Actualizado')
            ->body($mensaje)
            ->icon($statusIcon)
            ->iconColor($statusColor)
            ->sendToDatabase($user);

        return response()->json([
            'notifications' => [
                [
                    'title' => 'Estado de Visitante Actualizado',
                    'body' => $mensaje,
                    'visitor_id' => $visitor->id,
                    'status' => $visitor->status,
                    'icon' => $statusIcon,
                    'color' => $statusColor,
                    'timestamp' => now()->toISOString()
                ]
            ],
            'count' => 1,
            'forced' => true
        ]);
    }
}
