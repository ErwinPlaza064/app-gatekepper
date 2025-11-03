<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\QrCode;
use App\Services\EmailService;
use Illuminate\Support\Facades\Log;

class QrUsedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $qrCode;
    protected $usageDetails;
    public $tries = 3;
    public $timeout = 120;
    public $retryAfter = 30;

    public function __construct(QrCode $qrCode, $usageDetails = [])
    {
        $this->qrCode = $qrCode;
        $this->usageDetails = $usageDetails;

        // Configurar queue con prioridad para notificaciones importantes
        $this->onQueue('notifications');
    }

    public function via($notifiable)
    {
        // Siempre guardar en base de datos
        $channels = ['database'];

        // Intentar enviar por email solo si tenemos una dirección válida
        if ($notifiable->email && filter_var($notifiable->email, FILTER_VALIDATE_EMAIL)) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toMail($notifiable)
    {
        try {
            $emailService = new EmailService();

            $result = $emailService->sendQrUsedNotification(
                $notifiable->email,
                $this->qrCode,
                $this->usageDetails
            );

            if ($result['success']) {
                Log::info('QR Used notification enviada exitosamente', [
                    'user_id' => $notifiable->id,
                    'email' => $notifiable->email,
                    'qr_id' => $this->qrCode->qr_id,
                    'method' => $result['method'] ?? 'unknown'
                ]);
            }

            // Fallback a mensaje estándar de Laravel si el servicio personalizado falla
            $isLastUse = $this->qrCode->current_uses >= $this->qrCode->max_uses;

            return (new MailMessage)
                        ->subject('🔑 Tu código QR ha sido utilizado - Gatekeeper')
                        ->greeting('Hola ' . $notifiable->name)
                        ->line('Tu código QR para el visitante **' . $this->qrCode->visitor_name . '** ha sido utilizado exitosamente.')
                        ->line('**Uso actual:** ' . $this->qrCode->current_uses . '/' . $this->qrCode->max_uses)
                        ->when($isLastUse, function ($mail) {
                            return $mail->line('⚠️ **Importante:** Este código QR ha alcanzado el límite máximo de usos y ya no estará disponible.');
                        })
                        ->line('**Hora de acceso:** ' . now()->format('d/m/Y H:i'))
                        ->action('Ver Dashboard', url('/resident/dashboard'))
                        ->line('Gracias por usar Gatekeeper.');

        } catch (\Exception $e) {
            Log::error('Error en QrUsedNotification', [
                'user_id' => $notifiable->id,
                'email' => $notifiable->email,
                'qr_id' => $this->qrCode->qr_id,
                'error' => $e->getMessage()
            ]);

            // Fallback simple en caso de error
            return (new MailMessage)
                        ->subject('🔑 Código QR utilizado')
                        ->line('Tu código QR ha sido utilizado.')
                        ->line('Revisa tu dashboard para más detalles.')
                        ->action('Ver Dashboard', url('/resident/dashboard'));
        }
    }

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
            'is_last_use' => $this->qrCode->current_uses >= $this->qrCode->max_uses
        ];
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception)
    {
        Log::error('QrUsedNotification failed definitivamente', [
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
        return now()->addMinutes(10);
    }
}
