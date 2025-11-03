<?php

namespace App\Services;

use App\Models\QrCode;
use App\Models\User;
use App\Notifications\QrUsedNotification;
use App\Notifications\QrUsedNotificationRailway;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Enviar notificación de QR usado de forma inteligente
     * - En Railway: usa QrUsedNotificationRailway (sin SMTP)
     * - En local: usa QrUsedNotification (con fallback SMTP)
     */
    public static function sendQrUsedNotification(User $user, QrCode $qrCode, array $usageDetails = [])
    {
        // Detectar ambiente
        $isRailway = !empty(env('RAILWAY_ENVIRONMENT')) ||
                     !empty(env('RAILWAY_PROJECT_ID')) ||
                     !empty(env('RAILWAY_SERVICE_NAME'));

        if ($isRailway) {
            // Railway: usar notificación sin SMTP
            $notification = new QrUsedNotificationRailway($qrCode, $usageDetails);

            Log::info('Enviando QR notification para Railway', [
                'user_id' => $user->id,
                'email' => $user->email,
                'qr_id' => $qrCode->qr_id,
                'notification_class' => 'QrUsedNotificationRailway'
            ]);
        } else {
            // Local: usar notificación con fallback
            $notification = new QrUsedNotification($qrCode, $usageDetails);

            Log::info('Enviando QR notification para Local', [
                'user_id' => $user->id,
                'email' => $user->email,
                'qr_id' => $qrCode->qr_id,
                'notification_class' => 'QrUsedNotification'
            ]);
        }

        try {
            $user->notify($notification);

            Log::info('QR notification enviada exitosamente', [
                'user_id' => $user->id,
                'qr_id' => $qrCode->qr_id,
                'environment' => $isRailway ? 'railway' : 'local'
            ]);

            return [
                'success' => true,
                'environment' => $isRailway ? 'railway' : 'local',
                'notification_class' => $isRailway ? 'QrUsedNotificationRailway' : 'QrUsedNotification'
            ];

        } catch (\Exception $e) {
            Log::error('Error enviando QR notification', [
                'user_id' => $user->id,
                'qr_id' => $qrCode->qr_id,
                'error' => $e->getMessage(),
                'environment' => $isRailway ? 'railway' : 'local'
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'environment' => $isRailway ? 'railway' : 'local'
            ];
        }
    }

    /**
     * Detectar si estamos en Railway
     */
    public static function isRailwayEnvironment(): bool
    {
        return !empty(env('RAILWAY_ENVIRONMENT')) ||
               !empty(env('RAILWAY_PROJECT_ID')) ||
               !empty(env('RAILWAY_SERVICE_NAME'));
    }

    /**
     * Obtener información del ambiente actual
     */
    public static function getEnvironmentInfo(): array
    {
        $isRailway = self::isRailwayEnvironment();

        return [
            'is_railway' => $isRailway,
            'environment' => $isRailway ? 'railway' : 'local',
            'railway_env' => env('RAILWAY_ENVIRONMENT'),
            'railway_project' => env('RAILWAY_PROJECT_ID'),
            'railway_service' => env('RAILWAY_SERVICE_NAME'),
            'app_env' => env('APP_ENV'),
            'mail_mailer' => config('mail.default')
        ];
    }
}
