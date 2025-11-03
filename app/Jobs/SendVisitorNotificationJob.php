<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use App\Models\Visitor;
use App\Models\User;

class SendVisitorNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $visitorId;
    protected $userId;
    protected $notificationType; // 'new_visitor', 'approval_request'

    /**
     * Create a new job instance.
     */
    public function __construct($visitorId, $userId, $notificationType = 'new_visitor')
    {
        $this->visitorId = $visitorId;
        $this->userId = $userId;
        $this->notificationType = $notificationType;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $visitor = Visitor::find($this->visitorId);
            $user = User::find($this->userId);

            if (!$visitor || !$user) {
                Log::error('Visitor or User not found in notification job', [
                    'visitor_id' => $this->visitorId,
                    'user_id' => $this->userId
                ]);
                return;
            }

            // Verificar que el usuario tenga email
            if (!$user->email) {
                Log::warning('User has no email for notification', [
                    'user_id' => $user->id,
                    'user_name' => $user->name
                ]);
                return;
            }

            $subject = '';
            $content = '';

            if ($this->notificationType === 'new_visitor') {
                $subject = '🏠 Nuevo visitante registrado - Gatekeeper';
                $content = $this->buildNewVisitorEmailContent($visitor, $user);
            } elseif ($this->notificationType === 'approval_request') {
                $subject = '🔔 Nueva Solicitud de Visita - Gatekeeper';
                $content = $this->buildApprovalRequestEmailContent($visitor, $user);
            }

            // Enviar email usando SendEmailJob
            SendEmailJob::dispatch(
                $user->email,
                $subject,
                $content
            );

            Log::info('Visitor notification job completed', [
                'visitor_id' => $this->visitorId,
                'user_id' => $this->userId,
                'type' => $this->notificationType,
                'email' => $user->email
            ]);

        } catch (\Exception $e) {
            Log::error('Error in SendVisitorNotificationJob', [
                'visitor_id' => $this->visitorId,
                'user_id' => $this->userId,
                'type' => $this->notificationType,
                'error' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    /**
     * Build email content for new visitor notification
     */
    private function buildNewVisitorEmailContent($visitor, $user)
    {
        return "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
            <h2 style='color: #2563eb;'>¡Hola {$user->name}!</h2>

            <p>Se ha registrado un nuevo visitante para tu domicilio:</p>

            <div style='background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                <p><strong>👤 Visitante:</strong> {$visitor->name}</p>
                <p><strong>🆔 Documento:</strong> {$visitor->id_document}</p>
                <p><strong>🕐 Hora de entrada:</strong> " . $visitor->entry_time->format('H:i d/m/Y') . "</p>
                " . ($visitor->vehicle_plate ? "<p><strong>🚗 Vehículo:</strong> {$visitor->vehicle_plate}</p>" : "") . "
                " . ($visitor->approval_notes ? "<p><strong>📝 Notas:</strong> {$visitor->approval_notes}</p>" : "") . "
            </div>

            <p>El visitante ya ha sido aprobado y puede ingresar.</p>

            <div style='text-align: center; margin: 30px 0;'>
                <a href='" . route('dashboard') . "' style='background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;'>Ver Dashboard</a>
            </div>

            <hr style='margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;'>
            <p style='color: #6b7280; font-size: 14px; text-align: center;'>
                Sistema de Seguridad Gatekeeper 🏘️
            </p>
        </div>";
    }

    /**
     * Build email content for approval request
     */
    private function buildApprovalRequestEmailContent($visitor, $user)
    {
        $approveUrl = route('approval.approve.public', $visitor->approval_token);
        $rejectUrl = route('approval.reject.public', $visitor->approval_token);

        return "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
            <h2 style='color: #dc2626;'>¡Hola {$user->name}!</h2>

            <p>Tienes una nueva solicitud de visita que requiere tu aprobación:</p>

            <div style='background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;'>
                <p><strong>👤 Visitante:</strong> {$visitor->name}</p>
                <p><strong>🆔 Documento:</strong> {$visitor->id_document}</p>
                <p><strong>🕐 Hora de solicitud:</strong> " . ($visitor->approval_requested_at ? $visitor->approval_requested_at->format('H:i d/m/Y') : now()->format('H:i d/m/Y')) . "</p>
                " . ($visitor->vehicle_plate ? "<p><strong>🚗 Vehículo:</strong> {$visitor->vehicle_plate}</p>" : "") . "
                " . ($visitor->approval_notes ? "<p><strong>📝 Información adicional:</strong> {$visitor->approval_notes}</p>" : "") . "
            </div>

            <p><strong>¿Permites el acceso a este visitante?</strong></p>

            <div style='text-align: center; margin: 30px 0;'>
                <a href='{$approveUrl}' style='background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-right: 10px;'>✅ APROBAR</a>
                <a href='{$rejectUrl}' style='background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;'>❌ RECHAZAR</a>
            </div>

            <p style='color: #6b7280; font-size: 14px;'>
                <strong>Nota:</strong> Si no respondes en 10 minutos, la solicitud será rechazada automáticamente por seguridad.
            </p>

            <hr style='margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;'>
            <p style='color: #6b7280; font-size: 14px; text-align: center;'>
                Sistema de Seguridad Gatekeeper 🏘️
            </p>
        </div>";
    }
}
