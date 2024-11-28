<?php
namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Visitor;
use Carbon\Carbon;

class NewVisitorNotification extends Notification
{
    use Queueable;

    protected $visitor;

    /**
     * Create a new notification instance.
     *
     * @param \App\Models\Visitor $visitor
     * @return void
     */
    public function __construct(Visitor $visitor)
    {
        $this->visitor = $visitor;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param mixed $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail','database'];  // Enviar por correo electrónico
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param mixed $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Nuevo visitante registrado')
            ->greeting('Hola, ' . $notifiable->name)
            ->line('Se ha registrado un nuevo visitante a tu nombre:')
            ->line('Nombre: ' . $this->visitor->name)
            ->line('Documento de Identidad: ' . $this->visitor->id_document)
            ->line('Hora de Entrada: ' . Carbon::parse($this->visitor->entry_time)->format('d/m/Y H:i'))
            ->line('Placa del vehículo: ' . $this->visitor->vehicle_plate)
            ->action('Ver detalles en el sistema', url('/'))  // Cambia la URL si es necesario
            ->line('Gracias por usar nuestro sistema!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @param mixed $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            'message' => "Un nuevo visitante, {$this->visitor->name}, ha sido registrado.",
            'visitor_id' => $this->visitor->id,
        ];
    }
}
