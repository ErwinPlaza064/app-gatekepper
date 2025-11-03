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
        $channels = ['mail', 'database'];
        
        // Agregar Expo Push si el usuario tiene token registrado
        if (!empty($notifiable->expo_push_token)) {
            $channels[] = 'expo';
        }
        
        return $channels;
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
            ->subject('🏠 Nuevo visitante registrado - Gatekeeper')
            ->from(config('mail.from.address'), config('mail.from.name'))
            ->greeting("¡Hola {$notifiable->name}!")
            ->line("Se ha registrado un nuevo visitante para tu domicilio:")
            ->line("👤 **Visitante:** {$this->visitor->name}")
            ->line("🆔 **Documento:** {$this->visitor->id_document}")
            ->line("🕐 **Hora de entrada:** " . $this->visitor->entry_time->format('H:i d/m/Y'))
            ->when($this->visitor->vehicle_plate, function ($mail) {
                return $mail->line("🚗 **Vehículo:** {$this->visitor->vehicle_plate}");
            })
            ->when($this->visitor->approval_notes, function ($mail) {
                return $mail->line("📝 **Notas:** {$this->visitor->approval_notes}");
            })
            ->line('El visitante ya ha sido aprobado y puede ingresar.')
            ->action('Ver Dashboard', route('dashboard'))
            ->salutation('Sistema de Seguridad Gatekeeper 🏘️');
    }

    public function toBroadcast($notifiable)
    {
        return [
            'title' => 'Nuevo visitante registrado',
            'body' => 'Se ha registrado un nuevo visitante.',
            'visitor' => $this->visitor ?? null,
        ];
    }

    /**
     * Get the Expo Push notification representation.
     */
    public function toExpo($notifiable): array
    {
        $expoPushService = new \App\Services\ExpoPushService();
        return $expoPushService->sendNewVisitorNotification(
            $notifiable->expo_push_token,
            $this->visitor
        );
    }

    /**
     * Route notifications for the Expo channel.
     */
    public function routeNotificationForExpo($notifiable)
    {
        return $notifiable->expo_push_token;
    }
}
