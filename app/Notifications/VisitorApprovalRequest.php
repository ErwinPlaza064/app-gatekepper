<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\DatabaseMessage;
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
        return ['database'];
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
