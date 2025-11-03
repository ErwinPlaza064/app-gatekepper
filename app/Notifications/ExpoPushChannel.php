<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use App\Services\ExpoPushService;
use Illuminate\Support\Facades\Log;

class ExpoPushChannel
{
    protected $expoPushService;

    public function __construct(ExpoPushService $expoPushService)
    {
        $this->expoPushService = $expoPushService;
    }

    /**
     * Send the given notification.
     *
     * @param  mixed  $notifiable
     * @param  \Illuminate\Notifications\Notification  $notification
     * @return void
     */
    public function send($notifiable, Notification $notification)
    {
        // Obtener el token de Expo del usuario
        $expoPushToken = method_exists($notification, 'routeNotificationForExpo')
            ? $notification->routeNotificationForExpo($notifiable)
            : $notifiable->expo_push_token;

        if (empty($expoPushToken)) {
            Log::warning('No Expo Push token found for user', [
                'user_id' => $notifiable->id,
            ]);
            return;
        }

        // Determinar el tipo de notificación y enviarla
        if (method_exists($notification, 'toExpo')) {
            $result = $notification->toExpo($notifiable);
        } else {
            // Fallback: crear notificación genérica
            $title = 'Gatekeeper';
            $body = 'Tienes una nueva notificación';
            $data = [];

            if (method_exists($notification, 'toDatabase')) {
                $dbData = $notification->toDatabase($notifiable);
                $title = $dbData['title'] ?? $title;
                $body = $dbData['message'] ?? $body;
                $data = $dbData;
            }

            $result = $this->expoPushService->sendPushNotification(
                $expoPushToken,
                $title,
                $body,
                $data
            );
        }

        if (!$result['success']) {
            Log::error('Error sending Expo Push notification', [
                'user_id' => $notifiable->id,
                'error' => $result['error'] ?? 'Unknown error',
            ]);
        }
    }
}

