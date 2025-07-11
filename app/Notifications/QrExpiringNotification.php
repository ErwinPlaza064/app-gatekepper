<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\QrCode;

class QrExpiringNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $qrCode;

    /**
     * Create a new notification instance.
     */
    public function __construct(QrCode $qrCode)
    {
        $this->qrCode = $qrCode;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('Tu código QR está por expirar')
                    ->greeting('Hola ' . $notifiable->name)
                    ->line('Tu código QR para el visitante ' . $this->qrCode->visitor_name . ' está por expirar.')
                    ->line('El código expirará el: ' . $this->qrCode->valid_until->format('d/m/Y H:i'))
                    ->line('Si necesitas extender el acceso, genera un nuevo código QR.')
                    ->action('Ver mis códigos QR', url('/resident/dashboard'))
                    ->line('Gracias por usar nuestro sistema de gestión de visitantes.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'qr_expiring',
            'qr_id' => $this->qrCode->qr_id,
            'visitor_name' => $this->qrCode->visitor_name,
            'expires_at' => $this->qrCode->valid_until,
            'message' => 'Tu código QR para ' . $this->qrCode->visitor_name . ' está por expirar'
        ];
    }
}
