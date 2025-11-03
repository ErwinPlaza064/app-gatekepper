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
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Solicitud de Aprobación - Gatekeeper</title>
            <style>
                @media only screen and (max-width: 600px) {
                    .email-container {
                        margin: 0 !important;
                        border-radius: 0 !important;
                        width: 100% !important;
                    }
                    .email-body {
                        padding: 20px 15px !important;
                    }
                    .header-content {
                        padding: 25px 15px !important;
                    }
                    .visitor-info-table td {
                        display: block !important;
                        width: 100% !important;
                        text-align: left !important;
                        padding: 5px 0 !important;
                    }
                    .visitor-info-table td:first-child {
                        font-weight: bold !important;
                        border-bottom: 1px solid #e5e7eb !important;
                        padding-bottom: 3px !important;
                        margin-bottom: 3px !important;
                    }
                    .button-table {
                        width: 100% !important;
                    }
                    .button-cell {
                        display: block !important;
                        width: 100% !important;
                        padding: 8px 0 !important;
                    }
                    .action-button {
                        width: 100% !important;
                        max-width: none !important;
                        margin: 0 !important;
                        padding: 18px 20px !important;
                        font-size: 16px !important;
                    }
                    .mobile-stack {
                        display: block !important;
                    }
                }

                @media only screen and (max-width: 480px) {
                    .email-body { padding: 15px 10px !important; }
                    .header-content { padding: 20px 10px !important; }
                    .visitor-card { padding: 15px !important; }
                    .action-button {
                        padding: 20px 15px !important;
                        font-size: 17px !important;
                    }
                }
            </style>
        </head>
        <body style='margin: 0; padding: 10px; background-color: #f9fafb; font-family: Arial, sans-serif;'>
            <div class='email-container' style='max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);'>

                <!-- Header -->
                <div class='header-content' style='background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px 20px; text-align: center;'>
                    <h1 style='margin: 0; font-size: 24px; font-weight: bold;'>🏠 Gatekeeper</h1>
                    <p style='margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;'>Sistema de Control de Acceso</p>
                </div>

                <!-- Content -->
                <div class='email-body' style='padding: 30px 20px;'>
                    <h2 style='color: #374151; margin: 0 0 20px 0; font-size: 22px;'>¡Hola {$user->name}! 👋</h2>

                    <p style='color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;'>
                        Tienes una <strong>nueva solicitud de visita</strong> que requiere tu aprobación inmediata:
                    </p>

                    <!-- Visitor Info Card -->
                    <div class='visitor-card' style='background: linear-gradient(135deg, #fef2f2, #fdf2f8); border: 2px solid #f3e8ff; border-radius: 12px; padding: 25px; margin: 25px 0;'>
                        <h3 style='color: #7c2d12; margin: 0 0 20px 0; font-size: 18px; border-bottom: 2px solid #fed7d7; padding-bottom: 10px;'>
                            📋 Información del Visitante
                        </h3>
                        <table class='visitor-info-table' style='width: 100%;' cellpadding='8' cellspacing='0'>
                            <tr>
                                <td style='color: #374151; font-weight: bold; font-size: 15px; width: 140px; vertical-align: top;'>👤 Visitante:</td>
                                <td style='color: #1f2937; font-size: 15px;'>{$visitor->name}</td>
                            </tr>
                            <tr>
                                <td style='color: #374151; font-weight: bold; font-size: 15px; vertical-align: top;'>🆔 Documento:</td>
                                <td style='color: #1f2937; font-size: 15px;'>{$visitor->id_document}</td>
                            </tr>
                            <tr>
                                <td style='color: #374151; font-weight: bold; font-size: 15px; vertical-align: top;'>🕐 Hora solicitud:</td>
                                <td style='color: #1f2937; font-size: 15px;'>" . ($visitor->approval_requested_at ? $visitor->approval_requested_at->format('H:i d/m/Y') : now()->format('H:i d/m/Y')) . "</td>
                            </tr>
                            " . ($visitor->vehicle_plate ? "
                            <tr>
                                <td style='color: #374151; font-weight: bold; font-size: 15px; vertical-align: top;'>🚗 Vehículo:</td>
                                <td style='color: #1f2937; font-size: 15px;'>{$visitor->vehicle_plate}</td>
                            </tr>" : "") . "
                            " . ($visitor->approval_notes ? "
                            <tr>
                                <td style='color: #374151; font-weight: bold; font-size: 15px; vertical-align: top;'>📝 Notas:</td>
                                <td style='color: #1f2937; font-size: 15px;'>{$visitor->approval_notes}</td>
                            </tr>" : "") . "
                        </table>
                    </div>

            <div style='background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 25px 0; text-align: center;'>
                <h3 style='color: #856404; margin: 0 0 15px 0; font-size: 18px;'>¿Permites el acceso a este visitante?</h3>
                <p style='color: #856404; margin: 0 0 20px 0; font-size: 14px;'>
                    <strong>⏰ Tiempo límite:</strong> 7 minutos para responder
                </p>
            </div>

            <!-- Botones optimizados para móvil y desktop -->
            <div style='margin: 30px 0; text-align: center;'>
                <table class='button-table' style='width: 100%; max-width: 480px; margin: 0 auto;' cellpadding='0' cellspacing='0'>
                    <tr class='mobile-stack'>
                        <!-- Botón Aprobar -->
                        <td class='button-cell' style='padding: 10px; text-align: center; width: 50%;'>
                            <a href='{$approveUrl}' class='action-button' style='
                                display: inline-block;
                                background: linear-gradient(135deg, #10b981, #059669);
                                color: white;
                                padding: 16px 25px;
                                text-decoration: none;
                                border-radius: 12px;
                                font-size: 15px;
                                font-weight: bold;
                                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                                width: 100%;
                                max-width: 200px;
                                box-sizing: border-box;
                                text-align: center;
                                border: none;
                                min-height: 50px;
                                line-height: 1.2;
                            '>
                                ✅ APROBAR
                            </a>
                        </td>
                        <!-- Botón Rechazar -->
                        <td class='button-cell' style='padding: 10px; text-align: center; width: 50%;'>
                            <a href='{$rejectUrl}' class='action-button' style='
                                display: inline-block;
                                background: linear-gradient(135deg, #ef4444, #dc2626);
                                color: white;
                                padding: 16px 25px;
                                text-decoration: none;
                                border-radius: 12px;
                                font-size: 15px;
                                font-weight: bold;
                                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                                width: 100%;
                                max-width: 200px;
                                box-sizing: border-box;
                                text-align: center;
                                border: none;
                                min-height: 50px;
                                line-height: 1.2;
                            '>
                                ❌ RECHAZAR
                            </a>
                        </td>
                    </tr>
                </table>
            </div>

            <div style='background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0; border-radius: 0 8px 8px 0;'>
                <p style='color: #92400e; margin: 0; font-size: 14px;'>
                    <strong>⚠️ Importante:</strong> Si no respondes en 7 minutos, el visitante será <strong>auto-aprobado</strong> por motivos de seguridad y podrá ingresar automáticamente.
                </p>
            </div>

                </div>

                <!-- Footer -->
                <div style='background: #f9fafb; padding: 25px 20px; text-align: center; border-top: 1px solid #e5e7eb;'>
                    <p style='color: #6b7280; font-size: 14px; margin: 0 0 10px 0;'>
                        <strong>Sistema de Seguridad Gatekeeper</strong> 🏘️
                    </p>
                    <p style='color: #9ca3af; font-size: 12px; margin: 0;'>
                        Este email fue generado automáticamente. No responder a este correo.
                    </p>
                </div>
            </div>
        </body>
        </html";
    }
}
