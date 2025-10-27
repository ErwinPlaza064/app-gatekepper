<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Exception;

class SendEmailNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $user;
    protected $notification;
    protected $mailableClass;

    public function __construct($user, $notification, $mailableClass = null)
    {
        $this->user = $user;
        $this->notification = $notification;
        $this->mailableClass = $mailableClass;
    }

    public function handle()
    {
        try {
            // Verificar que el usuario tenga email y las notificaciones estén habilitadas
            if (!$this->user->email || !($this->user->email_notifications ?? true)) {
                Log::info('Email notification skipped', [
                    'user_id' => $this->user->id,
                    'reason' => 'Email not configured or disabled'
                ]);
                return;
            }

            // Enviar la notificación por email
            if ($this->mailableClass) {
                Mail::to($this->user)->send(new $this->mailableClass($this->notification));
            } else {
                $this->user->notify($this->notification);
            }

            Log::info('Email notification sent successfully', [
                'user_id' => $this->user->id,
                'notification_type' => get_class($this->notification)
            ]);

        } catch (Exception $e) {
            Log::error('Failed to send email notification', [
                'user_id' => $this->user->id,
                'notification_type' => get_class($this->notification),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // No fallar el job, solo loggear el error
            // El usuario seguirá recibiendo notificaciones por base de datos
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(Exception $exception)
    {
        Log::error('Email notification job failed completely', [
            'user_id' => $this->user->id,
            'notification_type' => get_class($this->notification),
            'error' => $exception->getMessage()
        ]);
    }
}
