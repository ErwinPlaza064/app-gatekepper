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

            // Obtener timestamp de última verificación (sin cache, solo session)
            $lastCheck = session('last_notification_check', Carbon::now()->subMinutes(2));
            
            // Buscar visitantes actualizados recientemente
            $recentVisitors = Visitor::where('updated_at', '>=', $lastCheck)
                ->whereIn('status', ['approved', 'rejected', 'pending'])
                ->orderBy('updated_at', 'desc')
                ->limit(5)
                ->get();

            $notifications = [];
            
            foreach ($recentVisitors as $visitor) {
                // Usar session para evitar duplicados (sin cache externo)
                $sessionKey = "notification_sent_{$visitor->id}_{$visitor->status}";
                if (session()->has($sessionKey)) {
                    continue;
                }
                
                // Verificar que no es una creación muy reciente (cambio real de estado)
                if ($visitor->created_at->diffInMinutes($visitor->updated_at) < 1) {
                    continue;
                }
                
                $statusText = match($visitor->status) {
                    'approved' => 'APROBADO ✅',
                    'rejected' => 'RECHAZADO ❌',
                    'pending' => 'marcado como PENDIENTE ⏳',
                    default => 'actualizado'
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
                
                $notifications[] = [
                    'title' => 'Estado de Visitante Actualizado',
                    'body' => $mensaje,
                    'visitor_id' => $visitor->id,
                    'status' => $visitor->status,
                    'color' => $statusColor,
                    'timestamp' => $visitor->updated_at->toISOString()
                ];
                
                // Marcar como procesado en session (expira con la sesión)
                session()->put($sessionKey, true);
            }

            // Actualizar timestamp
            session(['last_notification_check' => Carbon::now()]);

            return response()->json([
                'notifications' => $notifications,
                'count' => count($notifications),
                'last_check' => Carbon::now()->toISOString(),
                'status' => 'ok'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'notifications' => [],
                'error' => 'Error: ' . $e->getMessage(),
                'status' => 'error'
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
        try {
            if (!auth()->check() || auth()->user()->rol !== 'administrador') {
                return response()->json(['error' => 'No autorizado'], 403);
            }

            return response()->json([
                'notifications' => [
                    [
                        'title' => 'Estado de Visitante Actualizado',
                        'body' => 'El visitante Juan Pérez ha sido APROBADO ✅\n\n✅ AUTORIZAR INGRESO',
                        'color' => 'success',
                        'status' => 'approved',
                        'timestamp' => now()->toISOString()
                    ],
                    [
                        'title' => 'Estado de Visitante Actualizado', 
                        'body' => 'El visitante María López ha sido RECHAZADO ❌\n\n🚫 NO PERMITIR EL INGRESO',
                        'color' => 'danger',
                        'status' => 'rejected',
                        'timestamp' => now()->toISOString()
                    ]
                ],
                'count' => 2,
                'test' => true
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
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
