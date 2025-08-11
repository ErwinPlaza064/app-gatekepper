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

            // Obtener última verificación de la sesión (más tiempo para detectar cambios)
            $lastCheck = session('last_notification_check', now()->subMinutes(10));
            
            // Query usando approval_status - INCLUIR RECHAZADOS con withoutGlobalScope
            $recentVisitors = \App\Models\Visitor::withoutGlobalScope('hideRejected')
                ->where('updated_at', '>=', $lastCheck)
                ->whereIn('approval_status', ['approved', 'rejected', 'pending'])
                ->orderBy('updated_at', 'desc')
                ->limit(5)
                ->get();

            $notifications = [];
            
            foreach ($recentVisitors as $visitor) {
                // Sistema de duplicados más simple - solo por visitor y status
                $sessionKey = "notif_processed_{$visitor->id}_{$visitor->approval_status}";
                if (session()->has($sessionKey)) {
                    continue;
                }
                
                $statusText = 'actualizado';
                $statusColor = 'info';
                
                if ($visitor->approval_status == 'approved') {
                    $statusText = 'APROBADO ✅';
                    $statusColor = 'success';
                } elseif ($visitor->approval_status == 'rejected') {
                    $statusText = 'RECHAZADO ❌';
                    $statusColor = 'danger';
                } elseif ($visitor->approval_status == 'pending') {
                    $statusText = 'marcado como PENDIENTE ⏳';
                    $statusColor = 'warning';
                }
                
                $mensaje = "El visitante {$visitor->name} ha sido {$statusText}";
                
                if ($visitor->approval_status == 'rejected') {
                    $mensaje .= "\n\n🚫 NO PERMITIR EL INGRESO";
                } elseif ($visitor->approval_status == 'approved') {
                    $mensaje .= "\n\n✅ AUTORIZAR INGRESO";
                }
                
                // Crear notificación en la base de datos de Filament
                try {
                    \Filament\Notifications\Notification::make()
                        ->title('Estado de Visitante Actualizado')
                        ->body($mensaje)
                        ->color($statusColor)
                        ->persistent($visitor->approval_status === 'rejected') // Persistente para rechazados
                        ->sendToDatabase($user);
                } catch (\Exception $e) {
                    // Si falla la BD, continuar sin error
                }
                
                $notifications[] = [
                    'title' => 'Estado de Visitante Actualizado',
                    'body' => $mensaje,
                    'visitor_id' => $visitor->id,
                    'status' => $visitor->approval_status,
                    'color' => $statusColor,
                    'timestamp' => $visitor->updated_at->toISOString()
                ];
                
                // Marcar como procesado (expira en 30 minutos)
                session()->put($sessionKey, true);
            }

            // Actualizar timestamp de última verificación
            session(['last_notification_check' => now()]);

            return response()->json([
                'notifications' => $notifications,
                'count' => count($notifications),
                'status' => 'ok',
                'timestamp' => now()->toISOString(),
                'debug' => [
                    'visitors_found' => $recentVisitors->count(),
                    'last_check' => $lastCheck->toISOString()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'notifications' => [],
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => basename($e->getFile()),
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

    /**
     * Limpiar sessions de notificaciones para testing
     */
    public function clearNotificationCache(Request $request)
    {
        try {
            // Limpiar todas las sessions de notificaciones
            $sessionKeys = array_keys(session()->all());
            $clearedKeys = [];
            
            foreach ($sessionKeys as $key) {
                if (str_starts_with($key, 'notif_')) {
                    session()->forget($key);
                    $clearedKeys[] = $key;
                }
            }
            
            // Reset del timestamp
            session()->forget('last_notification_check');
            
            return response()->json([
                'status' => 'ok',
                'message' => 'Cache de notificaciones limpiado',
                'cleared_keys' => $clearedKeys,
                'count' => count($clearedKeys)
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'status' => 'error'
            ], 500);
        }
    }
}
