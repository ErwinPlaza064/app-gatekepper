<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Visitor;

class VisitorApprovalRequest extends Notification
{
    use Queueable;

    protected $visitor;

    public function __construct(Visitor $visitor)
    {
        $this->visitor = $visitor;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via($notifiable): array
    {
        $channels = ['database'];
        
        // Agregar email si el usuario tiene email y las notificaciones por email están habilitadas
        if ($notifiable->email && $notifiable->email_notifications ?? true) {
            $channels[] = 'mail';
        }
        
        return $channels;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable): MailMessage
    {
        $approveUrl = route('approval.approve.public', $this->visitor->approval_token);
        $rejectUrl = route('approval.reject.public', $this->visitor->approval_token);
        
        return (new MailMessage)
            ->subject('🔔 Nueva Solicitud de Visita - Gatekeeper')
            ->from(config('mail.from.address'), config('mail.from.name'))
            ->greeting("Hola {$notifiable->name}!")
            ->line("Tienes una nueva solicitud de visita que requiere tu aprobación:")
            ->line("👤 **Visitante:** {$this->visitor->name}")
            ->line("🆔 **Documento:** {$this->visitor->id_document}")
            ->line("🕐 **Hora de solicitud:** " . $this->visitor->entry_time->format('H:i d/m/Y'))
            ->when($this->visitor->vehicle_plate, function ($mail) {
                return $mail->line("🚗 **Vehículo:** {$this->visitor->vehicle_plate}");
            })
            ->when($this->visitor->approval_notes, function ($mail) {
                return $mail->line("📝 **Notas:** {$this->visitor->approval_notes}");
            })
            ->line("⏰ **Tiempo para responder:** 7 minutos")
            ->line("Si no respondes a tiempo, el acceso será automáticamente aprobado por seguridad.")
            ->line("**Opciones de respuesta:**")
            ->action('✅ APROBAR VISITANTE', $approveUrl)
            ->action('❌ RECHAZAR VISITANTE', $rejectUrl)
            ->line('También puedes responder desde tu dashboard en la aplicación web.')
            ->salutation('Saludos del equipo de Gatekeeper 🏘️');
    }

    /**
     * Get the database representation of the notification.
     */
    public function toDatabase($notifiable): array
    {
        return [
            'type' => 'visitor_approval_request',
            'title' => 'Solicitud de Visita',
            'message' => "🔔 {$this->visitor->name} solicita acceso a tu domicilio",
            'visitor' => [
                'id' => $this->visitor->id,
                'name' => $this->visitor->name,
                'id_document' => $this->visitor->id_document,
                'vehicle_plate' => $this->visitor->vehicle_plate,
                'entry_time' => $this->visitor->entry_time,
                'approval_token' => $this->visitor->approval_token,
                'additional_info' => $this->visitor->approval_notes,
            ],
            'actions' => [
                [
                    'type' => 'approve',
                    'label' => 'Aprobar',
                    'url' => route('approval.approve.public', $this->visitor->approval_token),
                    'style' => 'success'
                ],
                [
                    'type' => 'reject', 
                    'label' => 'Rechazar',
                    'url' => route('approval.reject.public', $this->visitor->approval_token),
                    'style' => 'danger'
                ]
            ],
            'expires_at' => $this->visitor->approval_requested_at->addMinutes(7),
            'created_at' => now(),
        ];
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray($notifiable): array
    {
        return $this->toDatabase($notifiable);
    }
}
