<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Visitor;
use App\Jobs\EnviarWhatsAppJob;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ProcessExpiredApprovals extends Command
{
    protected $signature = 'approvals:process-expired';
    protected $description = 'Auto-aprobar visitantes con solicitudes expiradas (más de 7 minutos)';

    public function handle()
    {
        $expiredVisitors = Visitor::includeRejected()
            ->pendingApproval()
            ->with('user')
            ->get()
            ->filter(function ($visitor) {
                return $visitor->isApprovalExpired();
            });

        $processed = 0;

        foreach ($expiredVisitors as $visitor) {
            try {
                // Usar configuración global del sistema
                $autoApprovalEnabled = \App\Models\Setting::isAutoApprovalEnabled();
                $timeoutMinutes = \App\Models\Setting::getApprovalTimeout();

                if ($autoApprovalEnabled) {
                    $visitor->autoApprove("Aprobado automáticamente por timeout global de {$timeoutMinutes} minutos");
                    $action = 'auto_approved';
                    $this->info("✅ Auto-aprobado: {$visitor->name} (timeout global: {$timeoutMinutes}min)");
                } else {
                    $visitor->reject(null, 'Rechazado automáticamente por timeout sin respuesta');
                    $action = 'auto_rejected';
                    $this->info("❌ Auto-rechazado: {$visitor->name} (timeout global: {$timeoutMinutes}min)");
                }

                // Enviar confirmación por WhatsApp
                if ($visitor->user && $visitor->user->phone && $visitor->user->whatsapp_notifications) {
                    EnviarWhatsAppJob::dispatch(
                        $visitor->user->phone,
                        'respuesta_aprobacion',
                        [
                            'visitante' => $visitor,
                            'action' => $action,
                        ]
                    );
                }

                // Notificar a porteros
                $this->notifyPorteros($visitor, $action);

                // Notificar a administradores
                $this->notifyAdmins($visitor, $action);

                $processed++;

            } catch (\Exception $e) {
                $this->error("Error procesando visitante {$visitor->id}: {$e->getMessage()}");
                Log::error('Error en auto-aprobación', [
                    'visitor_id' => $visitor->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        $this->info("✅ Procesados {$processed} visitantes por timeout global del sistema");
        Log::info("Auto-procesamiento completado con configuración global: {$processed}");

        return 0;
    }

    private function notifyPorteros(Visitor $visitor, string $action)
    {
        $porteros = \App\Models\User::where('rol', 'portero')->get();

        foreach ($porteros as $portero) {
            $portero->notify(new \App\Notifications\VisitorStatusNotification(
                $visitor,
                $action
            ));
        }
    }

    private function notifyAdmins(Visitor $visitor, string $action)
    {
        $admins = \App\Models\User::where('rol', 'administrador')->get();

        foreach ($admins as $admin) {
            // Notificación tradicional
            $admin->notify(new \App\Notifications\VisitorStatusNotification(
                $visitor,
                $action
            ));

            // Notificación de Filament
            $adminNotification = new \App\Notifications\AdminVisitorStatusNotification($visitor, $action);
            $adminNotification->sendFilamentNotification($admin);
        }
    }
}
