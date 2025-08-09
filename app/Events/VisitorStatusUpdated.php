<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Visitor;
use App\Models\User;

class VisitorStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $visitor;
    public $status;
    public $respondedBy;

    /**
     * Create a new event instance.
     */
    public function __construct(Visitor $visitor, string $status, $respondedBy = null)
    {
        $this->visitor = $visitor;
        $this->status = $status;
        $this->respondedBy = $respondedBy;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin.notifications'),
        ];
    }

    /**
     * Nombre del evento que se enviará al frontend
     */
    public function broadcastAs(): string
    {
        return 'visitor.status.updated';
    }

    /**
     * Datos que se enviarán al frontend
     */
    public function broadcastWith(): array
    {
        return [
            'visitor' => [
                'id' => $this->visitor->id,
                'name' => $this->visitor->name,
                'id_document' => $this->visitor->id_document,
                'status' => $this->status,
                'resident_name' => $this->visitor->user?->name,
            ],
            'status' => $this->status,
            'responded_by' => $this->respondedBy ? [
                'id' => $this->respondedBy->id,
                'name' => $this->respondedBy->name,
            ] : null,
            'timestamp' => now()->toISOString(),
            'message' => $this->getStatusMessage(),
        ];
    }

    /**
     * Obtener el mensaje según el estado
     */
    private function getStatusMessage(): string
    {
        $visitorName = $this->visitor->name;
        $respondedByName = $this->respondedBy ? $this->respondedBy->name : 'Sistema';

        return match($this->status) {
            'approved' => "✅ {$visitorName} fue aprobado por {$respondedByName}",
            'rejected' => "❌ {$visitorName} fue rechazado por {$respondedByName}",
            'auto_approved' => "⏰ {$visitorName} fue auto-aprobado por timeout",
            'auto_rejected' => "⏰ {$visitorName} fue auto-rechazado por timeout",
            'pending' => "⏳ {$visitorName} solicita aprobación",
            default => "🔔 Estado de {$visitorName} actualizado: {$this->status}",
        };
    }
}
