<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\QrCode;
use App\Jobs\EnviarWhatsAppJob;

class QrUsedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $qrCode;
    protected $usageDetails;

    public function __construct(QrCode $qrCode, $usageDetails = [])
    {
        $this->qrCode = $qrCode;
        $this->usageDetails = $usageDetails;
    }

    public function via($notifiable)
    {
    return ['mail', 'database'];
    }


    public function toMail($notifiable)
    {
        $isLastUse = $this->qrCode->current_uses >= $this->qrCode->max_uses;

        return (new MailMessage)
                    ->subject('Tu código QR ha sido utilizado')
                    ->greeting('Hola ' . $notifiable->name)
                    ->line('Tu código QR para el visitante ' . $this->qrCode->visitor_name . ' ha sido utilizado.')
                    ->line('Uso actual: ' . $this->qrCode->current_uses . '/' . $this->qrCode->max_uses)
                    ->when($isLastUse, function ($mail) {
                        return $mail->line('⚠️ Este código QR ha alcanzado el límite máximo de usos y ya no estará disponible.');
                    })
                    ->line('Hora de acceso: ' . now()->format('d/m/Y H:i'))
                    ->action('Ver detalles', url('/resident/dashboard'))
                    ->line('Gracias por usar nuestro sistema de gestión de visitantes.');
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
            'message' => 'Tu código QR para ' . $this->qrCode->visitor_name . ' ha sido utilizado (' . $this->qrCode->current_uses . '/' . $this->qrCode->max_uses . ')'
        ];
    }
}
