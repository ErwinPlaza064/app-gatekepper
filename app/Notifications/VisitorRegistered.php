<?php

namespace App\Notifications;

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VisitorRegistered extends Notification
{
    use Queueable;

    protected $visitor;
    protected $resident;

    public function __construct($visitor, $resident)
    {
        $this->visitor = $visitor;
        $this->resident = $resident;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
                    ->subject('Nuevo visitante registrado')
                    ->greeting('Hola, ' . $this->resident->name)
                    ->line('Un nuevo visitante ha sido registrado para tu residencia.')
                    ->line('Visitante: ' . $this->visitor->name)
                    ->line('Placa del vehículo: ' . $this->visitor->vehicle_plate)
                    ->line('Hora de llegada: ' . $this->visitor->arrival_time)
                    ->action('Ver detalles', url('/'))
                    ->line('Gracias por usar GateKeeper!');
    }
}


