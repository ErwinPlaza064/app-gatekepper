<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Notification;
use App\Models\Visitor;

class VisitorStatusNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $visitor;
    protected $status; // 'approved', 'rejected', 'auto_approved'
    protected $respondedBy;

    /**
     * Create a new notification instance.
     */
    public function __construct(Visitor $visitor, string $status, $respondedBy = null)
    {
        $this->visitor = $visitor;
        $this->status = $status;
        $this->respondedBy = $respondedBy;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        $channels = ['database'];
        
        // Solo agregar email si el portero tiene email configurado y quiere recibirlos
        if ($notifiable->email && ($notifiable->email_notifications ?? false)) {
            $channels[] = 'mail';
        }
        
        return $channels;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $statusMessages = [
            'approved' => '✅ APROBADA',
            'rejected' => '❌ RECHAZADA', 
            'auto_approved' => '⏰ AUTO-APROBADA (Timeout)'
        ];

        $statusMessage = $statusMessages[$this->status] ?? 'PROCESADA';
        
        $respondedByText = '';
        if ($this->respondedBy && $this->status !== 'auto_approved') {
            $respondedByText = " por {$this->respondedBy->name}";
        }

        return (new MailMessage)
            ->subject("🚪 Visita {$statusMessage} - Gatekeeper")
            ->from(config('mail.from.address'), config('mail.from.name'))
            ->greeting("Hola {$notifiable->name}!")
            ->line("Una solicitud de visita ha sido **{$statusMessage}**{$respondedByText}:")
            ->line("👤 **Visitante:** {$this->visitor->name}")
            ->line("🆔 **Documento:** {$this->visitor->id_document}")
            ->line("🏠 **Residente:** {$this->visitor->user->name}")
            ->line("📍 **Dirección:** " . ($this->visitor->user->address ?? 'No especificada'))
            ->when($this->visitor->vehicle_plate, function ($mail) {
                return $mail->line("🚗 **Vehículo:** {$this->visitor->vehicle_plate}");
            })
            ->when($this->visitor->approval_notes, function ($mail) {
                return $mail->line("📝 **Notas:** {$this->visitor->approval_notes}");
            })
            ->line($this->getActionMessage())
            ->when($this->status === 'approved', function ($mail) {
                return $mail->action('Ver Dashboard', route('dashboard'));
            })
            ->salutation('Sistema de Seguridad Gatekeeper 🏘️');
    }

    /**
     * Get the database representation of the notification.
     */
    public function toDatabase(object $notifiable): array
    {
        $statusMessages = [
            'approved' => '✅ Aprobada',
            'rejected' => '❌ Rechazada',
            'auto_approved' => '⏰ Auto-aprobada'
        ];

        $statusMessage = $statusMessages[$this->status] ?? 'Procesada';
        
        return [
            'type' => 'visitor_status_update',
            'title' => "Visita {$statusMessage}",
            'message' => "🚪 {$this->visitor->name} - Visita {$statusMessage}",
            'visitor' => [
                'id' => $this->visitor->id,
                'name' => $this->visitor->name,
                'id_document' => $this->visitor->id_document,
                'vehicle_plate' => $this->visitor->vehicle_plate,
                'status' => $this->status,
                'resident_name' => $this->visitor->user->name,
                'resident_address' => $this->visitor->user->address,
                'responded_by' => $this->respondedBy ? $this->respondedBy->name : null,
                'response_time' => $this->visitor->approval_responded_at,
            ],
            'action_required' => $this->status === 'approved',
            'created_at' => now(),
        ];
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return $this->toDatabase($notifiable);
    }

    /**
     * Get the appropriate action message based on status
     */
    private function getActionMessage(): string
    {
        switch ($this->status) {
            case 'approved':
                return "🟢 **ACCIÓN REQUERIDA:** Permitir el acceso del visitante al recinto.";
            case 'rejected':
                return "🔴 **ACCIÓN REQUERIDA:** NO permitir el acceso. Informar al visitante que la visita fue rechazada.";
            case 'auto_approved':
                return "🟡 **ACCIÓN REQUERIDA:** Permitir el acceso (aprobado automáticamente por timeout).";
            default:
                return "ℹ️ Revisar el estado de la visita en el sistema.";
        }
    }
}
