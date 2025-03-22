<?php
namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

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
        return ['database'];  // Solo guardará la notificación en la base de datos
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
}
