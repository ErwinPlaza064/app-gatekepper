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
        $expiredVisitors = Visitor::pendingApproval()
            ->with('user')
            ->get()
            ->filter(function ($visitor) {
                return $visitor->isApprovalExpired();
            });

        $processed = 0;

        foreach ($expiredVisitors as $visitor) {
            try {
                // Verificar configuración de auto-aprobación del usuario
                $autoApprovalEnabled = $visitor->user ? 
                    $visitor->user->isAutoApprovalEnabled() : 
                    \App\Models\Setting::isAutoApprovalEnabled();

                if ($autoApprovalEnabled) {
                    $timeoutMinutes = $visitor->user ? 
                        $visitor->user->getApprovalTimeoutMinutes() : 
                        \App\Models\Setting::getApprovalTimeout();
                        
                    $visitor->autoApprove("Aprobado automáticamente por timeout de {$timeoutMinutes} minutos");
                    $action = 'auto_approved';
                    $this->info("✅ Auto-aprobado: {$visitor->name} (timeout: {$timeoutMinutes}min)");
                } else {
                    $visitor->reject(null, 'Rechazado automáticamente por timeout sin respuesta');
                    $action = 'auto_rejected';
                    $this->info("❌ Auto-rechazado: {$visitor->name}");
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

                $processed++;

            } catch (\Exception $e) {
                $this->error("Error procesando visitante {$visitor->id}: {$e->getMessage()}");
                Log::error('Error en auto-aprobación', [
                    'visitor_id' => $visitor->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        $this->info("✅ Procesados {$processed} visitantes por timeout personalizado");
        Log::info("Auto-procesamiento completado: {$processed}");

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
}
