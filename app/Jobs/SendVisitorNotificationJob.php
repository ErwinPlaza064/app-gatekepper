<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\Visitor;
use App\Notifications\NewVisitorNotification;
use App\Notifications\VisitorApprovalRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendVisitorNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 30;

    public function __construct(
        public User $user,
        public Visitor $visitor,
        public string $notificationType = 'approval' // 'approval' o 'new_visitor'
    ) {
        $this->onQueue('notifications');
    }

    public function handle(): void
    {
        try {
            $notification = match ($this->notificationType) {
                'approval' => new VisitorApprovalRequest($this->visitor),
                'new_visitor' => new NewVisitorNotification($this->visitor),
                default => throw new \InvalidArgumentException("Notification type not supported: {$this->notificationType}")
            };

            $this->user->notify($notification);

            Log::info('Notificación por email enviada exitosamente', [
                'user_id' => $this->user->id,
                'visitor_id' => $this->visitor->id,
                'type' => $this->notificationType
            ]);

        } catch (\Exception $e) {
            Log::error('Error enviando notificación por email', [
                'user_id' => $this->user->id,
                'visitor_id' => $this->visitor->id,
                'type' => $this->notificationType,
                'error' => $e->getMessage(),
                'attempt' => $this->attempts()
            ]);

            // Si es el último intento, no relanzar la excepción
            if ($this->attempts() >= $this->tries) {
                Log::error('Máximo de intentos alcanzado para notificación por email', [
                    'user_id' => $this->user->id,
                    'visitor_id' => $this->visitor->id,
                    'type' => $this->notificationType
                ]);
                return;
            }

            // Relanzar para reintentar
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('Job de notificación por email falló completamente', [
            'user_id' => $this->user->id,
            'visitor_id' => $this->visitor->id,
            'type' => $this->notificationType,
            'error' => $exception->getMessage()
        ]);
    }
}
