<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Visitor;
use App\Models\User;
use Carbon\Carbon;
use Filament\Notifications\Notification as FilamentNotification;
use Filament\Notifications\DatabaseNotification;

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
        
        // Buscar visitantes con cambios de status recientes (más específico)
        $recentVisitors = Visitor::where('updated_at', '>=', $lastCheck)
            ->whereIn('status', ['approved', 'rejected', 'pending']) // Solo estados específicos
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get();

        $notifications = [];
        
        foreach ($recentVisitors as $visitor) {
            // Verificar si ya se envió notificación para evitar duplicados
            $cacheKey = "notification_sent_{$visitor->id}_{$visitor->status}_{$visitor->updated_at->timestamp}";
            if (cache()->has($cacheKey)) {
                continue; // Skip si ya se procesó
            }
            
            // Verificar que es un cambio de estado real (no una creación)
            if ($visitor->created_at->diffInSeconds($visitor->updated_at) < 5) {
                continue; // Skip si fue creado recientemente (no es cambio de estado)
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
            
            // Mensaje más claro y específico
            $mensaje = "El visitante {$visitor->name} ha sido {$statusText}";
            
            if ($visitor->status === 'rejected') {
                $mensaje .= "\n\n🚫 NO PERMITIR EL INGRESO";
            } elseif ($visitor->status === 'approved') {
                $mensaje .= "\n\n✅ AUTORIZAR INGRESO";
            }
            
            // Crear notificación en base de datos para el ícono
            $user = auth()->user();
            FilamentNotification::make()
                ->title('Estado de Visitante Actualizado')
                ->body($mensaje)
                ->icon($statusIcon)
                ->iconColor($statusColor)
                ->sendToDatabase($user);
            
            $notifications[] = [
                'title' => 'Estado de Visitante Actualizado',
                'body' => $mensaje,
                'visitor_id' => $visitor->id,
                'status' => $visitor->status,
                'icon' => $statusIcon,
                'color' => $statusColor,
                'timestamp' => $visitor->updated_at->toISOString()
            ];
            
            // Marcar como procesado
            cache()->put($cacheKey, true, 600); // 10 minutos
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

        // Crear notificaciones de prueba para todos los estados
        $user = auth()->user();
        
        // Notificación aprobado
        FilamentNotification::make()
            ->title('Estado de Visitante Actualizado')
            ->body('El visitante Juan Pérez ha sido APROBADO ✅')
            ->icon('heroicon-o-check-circle')
            ->iconColor('success')
            ->sendToDatabase($user);
            
        // Notificación rechazado
        FilamentNotification::make()
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
        FilamentNotification::make()
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
