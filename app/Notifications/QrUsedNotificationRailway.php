<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use App\Models\QrCode;
use App\Services\EmailService;
use Illuminate\Support\Facades\Log;

class QrUsedNotificationRailway extends Notification implements ShouldQueue
{
    use Queueable;

    protected $qrCode;
    protected $usageDetails;
    protected $emailSent = false;
    protected $emailMethod = null;
    protected $emailError = null;

    public $tries = 3;
    public $timeout = 60;
    public $retryAfter = 10;

    public function __construct(QrCode $qrCode, $usageDetails = [])
    {
        $this->qrCode = $qrCode;
        $this->usageDetails = $usageDetails;

        // Configurar queue específica
        $this->onQueue('notifications');
    }

    /**
     * Solo usar database - el email se envía aquí directamente
     */
    public function via($notifiable)
    {
        // Solo database - enviaremos el email manualmente aquí
        $channels = ['database'];

        // Enviar email directamente aquí usando nuestro servicio
        if ($notifiable->email && filter_var($notifiable->email, FILTER_VALIDATE_EMAIL)) {
            try {
                $emailService = new EmailService();

                $result = $emailService->sendQrUsedNotification(
                    $notifiable->email,
                    $this->qrCode,
                    $this->usageDetails
                );

                Log::info('QR Used email enviado exitosamente en Railway', [
                    'user_id' => $notifiable->id,
                    'email' => $notifiable->email,
                    'qr_id' => $this->qrCode->qr_id,
                    'success' => $result['success'],
                    'method' => $result['method'] ?? 'unknown'
                ]);

                // Guardar estado del email en la base de datos
                $this->emailSent = true;
                $this->emailMethod = $result['method'] ?? 'unknown';

            } catch (\Exception $e) {
                Log::error('Error enviando email QR en Railway', [
                    'user_id' => $notifiable->id,
                    'email' => $notifiable->email,
                    'qr_id' => $this->qrCode->qr_id,
                    'error' => $e->getMessage()
                ]);

                $this->emailSent = false;
                $this->emailError = $e->getMessage();
            }
        }

        return $channels;
    }

    /**
     * Get the array representation - incluye info del email
     */
    public function toArray($notifiable)
    {
        return [
            'type' => 'qr_used',
            'qr_id' => $this->qrCode->qr_id,
            'visitor_name' => $this->qrCode->visitor_name,
            'current_uses' => $this->qrCode->current_uses,
            'max_uses' => $this->qrCode->max_uses,
            'used_at' => now(),
            'message' => 'Tu código QR para ' . $this->qrCode->visitor_name . ' ha sido utilizado (' . $this->qrCode->current_uses . '/' . $this->qrCode->max_uses . ')',
            'is_last_use' => $this->qrCode->current_uses >= $this->qrCode->max_uses,
            'email_sent' => $this->emailSent ?? false,
            'email_method' => $this->emailMethod ?? null,
            'email_error' => $this->emailError ?? null,
            'environment' => 'railway'
        ];
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception)
    {
        Log::error('QrUsedNotificationRailway failed', [
            'qr_id' => $this->qrCode->qr_id,
            'visitor_name' => $this->qrCode->visitor_name,
            'exception' => $exception->getMessage(),
            'max_tries' => $this->tries,
            'usage_details' => $this->usageDetails
        ]);
    }

    /**
     * Determine the time at which the job should timeout.
     */
    public function retryUntil()
    {
        return now()->addMinutes(5);
    }
}
