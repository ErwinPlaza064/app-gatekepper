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

        // Detectar si estamos en Railway
        $isRailway = !empty(env('RAILWAY_ENVIRONMENT')) || !empty(env('RAILWAY_PROJECT_ID'));

        // Solo intentar enviar email si no estamos en Railway o si tenemos configuración válida
        if ($notifiable->email && filter_var($notifiable->email, FILTER_VALIDATE_EMAIL)) {
            if ($isRailway) {
                // En Railway, enviar email directamente aquí para evitar problemas de SMTP
                try {
                    $emailService = new \App\Services\EmailService();
                    $result = $emailService->sendQrUsedNotification(
                        $notifiable->email,
                        $this->qrCode,
                        $this->usageDetails
                    );

                    Log::info('Email enviado directamente en via() para Railway', [
                        'user_id' => $notifiable->id,
                        'email' => $notifiable->email,
                        'qr_id' => $this->qrCode->qr_id,
                        'success' => $result['success'],
                        'method' => $result['method'] ?? 'unknown'
                    ]);
                } catch (\Exception $e) {
                    Log::error('Error enviando email en via() para Railway', [
                        'error' => $e->getMessage(),
                        'qr_id' => $this->qrCode->qr_id
                    ]);
                }
                // NO agregar 'mail' al canal para evitar doble envío
            } else {
                // En local, usar el canal mail normal
                $channels[] = 'mail';
            }
        }

        return $channels;
    }    public function toMail($notifiable)
    {
        // Este método solo se ejecuta en entornos locales (no Railway)
        // porque en Railway el email se envía directamente en via()

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
    }    public function toArray($notifiable)
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
