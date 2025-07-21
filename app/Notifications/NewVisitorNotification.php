<?php
namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use NotificationChannels\WebPush\WebPushMessage;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class NewVisitorNotification extends Notification
implements ShouldBroadcast
{
    use Queueable;

    private $visitor;

    public function __construct($visitor)
    {
        $this->visitor = $visitor;
    }

    public function via($notifiable)
    {
        return ['mail', 'database', 'broadcast', 'webpush'];
    }

    public function toWebPush($notifiable, $notification)
    {
        return (new WebPushMessage)
            ->title('Nuevo visitante registrado')
            ->body('Se ha registrado un nuevo visitante.')
            ->icon('/icon-192x192.png') // Cambia por el ícono de tu app si tienes uno
            ->action('Ver', 'open_app');
    }

    public function toDatabase($notifiable)
    {
        return [
            'visitor_id' => $this->visitor->id,
            'visitor_name' => $this->visitor->name,
            'visitor_time' => now(),
            'message' => "{$this->visitor->name} va a tu domicilio.",
        ];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Nuevo visitante registrado')
            ->greeting("Hola {$notifiable->name},")
            ->line("{$this->visitor->name} está llendo para tu dirección.")
            ->line('Gracias por usar nuestra aplicación!');
    }

    public function toBroadcast($notifiable)
    {
        return [
            'title' => 'Nuevo visitante registrado',
            'body' => 'Se ha registrado un nuevo visitante.',
            'visitor' => $this->visitor ?? null,
        ];
    }
}
