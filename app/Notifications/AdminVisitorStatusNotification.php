<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Visitor;
use App\Events\VisitorStatusUpdated;
use Filament\Notifications\Notification as FilamentNotification;
use Filament\Notifications\Actions\Action;

class AdminVisitorStatusNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $visitor;
    protected $status; // 'approved', 'rejected', 'auto_approved', 'auto_rejected'
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
        return ['database'];
    }

    /**
     * Get the database representation of the notification.
     */
    public function toDatabase(object $notifiable): array
    {
        $statusMessages = [
            'approved' => '✅ Aprobada',
            'rejected' => '❌ Rechazada',
            'auto_approved' => '⏰ Auto-aprobada',
            'auto_rejected' => '⏰ Auto-rechazada'
        ];

        $statusMessage = $statusMessages[$this->status] ?? 'Procesada';
        
        return [
            'type' => 'admin_visitor_status',
            'title' => "Visita {$statusMessage}",
            'message' => $this->getDetailedMessage(),
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
                'requested_at' => $this->visitor->approval_requested_at,
            ],
            'icon' => $this->getStatusIcon(),
            'color' => $this->getStatusColor(),
            'created_at' => now(),
        ];
    }

    /**
     * Enviar notificación usando Filament Notifications con Broadcasting
     */
    public function sendFilamentNotification($user)
    {
        // Enviar notificación inmediata a Filament
        FilamentNotification::make()
            ->title($this->getNotificationTitle())
            ->body($this->getSimpleMessage())
            ->icon($this->getStatusIcon())
            ->iconColor($this->getStatusColor())
            ->duration('5000')
            ->actions([
                Action::make('view_visitors')
                    ->label('Ver Visitantes')
                    ->url('/admin/visitors')
                    ->button()
                    ->color('primary'),
                Action::make('dismiss')
                    ->label('Cerrar')
                    ->close()
                    ->color('gray'),
            ])
            ->send(); // Envío inmediato al usuario actual

        // Disparar evento de broadcasting para tiempo real
        broadcast(new VisitorStatusUpdated($this->visitor, $this->status, $this->respondedBy));
    }

    /**
     * Mensaje simplificado para notificaciones
     */
    private function getSimpleMessage(): string
    {
        $visitorName = $this->visitor->name;
        $residentName = $this->visitor->user->name;
        
        return match($this->status) {
            'approved' => "✅ Visitante {$visitorName} aprobado para {$residentName}",
            'rejected' => "❌ Visitante {$visitorName} rechazado para {$residentName}",
            'auto_approved' => "⏰ Visitante {$visitorName} auto-aprobado (timeout)",
            'auto_rejected' => "⏰ Visitante {$visitorName} auto-rechazado (timeout)",
            default => "🔔 Estado de {$visitorName} actualizado",
        };
    }

    /**
     * Get notification title
     */
    private function getNotificationTitle(): string
    {
        $statusMessages = [
            'approved' => '✅ Visita Aprobada',
            'rejected' => '❌ Visita Rechazada',
            'auto_approved' => '⏰ Visita Auto-aprobada',
            'auto_rejected' => '⏰ Visita Auto-rechazada'
        ];

        return $statusMessages[$this->status] ?? 'Visita Procesada';
    }

    /**
     * Get detailed message for notification
     */
    private function getDetailedMessage(): string
    {
        $message = "👤 Visitante: {$this->visitor->name}\n";
        $message .= "🆔 Documento: {$this->visitor->id_document}\n";
        $message .= "🏠 Residente: {$this->visitor->user->name}\n";
        
        if ($this->visitor->user->address) {
            $message .= "📍 Dirección: {$this->visitor->user->address}\n";
        }
        
        if ($this->visitor->vehicle_plate) {
            $message .= "🚗 Vehículo: {$this->visitor->vehicle_plate}\n";
        }

        // Información de quién respondió
        if ($this->respondedBy && !in_array($this->status, ['auto_approved', 'auto_rejected'])) {
            $message .= "👨‍💼 Respondido por: {$this->respondedBy->name}\n";
        }

        // Tiempo de respuesta
        if ($this->visitor->approval_responded_at) {
            $responseTime = $this->visitor->approval_requested_at->diffForHumans($this->visitor->approval_responded_at);
            $message .= "⏱️ Tiempo de respuesta: {$responseTime}\n";
        }

        return $message;
    }

    /**
     * Get status icon
     */
    private function getStatusIcon(): string
    {
        return match ($this->status) {
            'approved' => 'heroicon-o-check-circle',
            'rejected' => 'heroicon-o-x-circle',
            'auto_approved' => 'heroicon-o-clock',
            'auto_rejected' => 'heroicon-o-exclamation-triangle',
            default => 'heroicon-o-information-circle',
        };
    }

    /**
     * Get status color
     */
    private function getStatusColor(): string
    {
        return match ($this->status) {
            'approved' => 'success',
            'rejected' => 'danger',
            'auto_approved' => 'warning',
            'auto_rejected' => 'warning',
            default => 'info',
        };
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return $this->toDatabase($notifiable);
    }
}
