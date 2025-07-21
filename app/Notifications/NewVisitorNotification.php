<?php
namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
// Eliminado WebPushMessage y ShouldBroadcast

class NewVisitorNotification extends Notification

{
    use Queueable;

    private $visitor;

    public function __construct($visitor)
    {
        $this->visitor = $visitor;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    // Método toWebPush eliminado

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
