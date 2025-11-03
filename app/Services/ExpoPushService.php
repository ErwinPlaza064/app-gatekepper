<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExpoPushService
{
    /**
     * URL de la API de Expo Push Notifications
     */
    private const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

    /**
     * Enviar notificación push a un token de Expo
     *
     * @param string $expoPushToken Token de Expo Push
     * @param string $title Título de la notificación
     * @param string $body Cuerpo de la notificación
     * @param array $data Datos adicionales
     * @param array $options Opciones adicionales (sound, badge, etc.)
     * @return array
     */
    public function sendPushNotification(
        string $expoPushToken,
        string $title,
        string $body,
        array $data = [],
        array $options = []
    ): array {
        try {
            $payload = [
                'to' => $expoPushToken,
                'title' => $title,
                'body' => $body,
                'data' => $data,
                'sound' => $options['sound'] ?? 'default',
                'badge' => $options['badge'] ?? null,
                'priority' => $options['priority'] ?? 'default',
                'channelId' => $options['channelId'] ?? 'default',
            ];

            // Remover campos null
            $payload = array_filter($payload, function ($value) {
                return $value !== null;
            });

            $response = Http::timeout(10)
                ->post(self::EXPO_PUSH_URL, $payload);

            if ($response->successful()) {
                $result = $response->json();
                
                Log::info('Notificación push enviada exitosamente', [
                    'expo_token' => substr($expoPushToken, 0, 20) . '...',
                    'title' => $title,
                    'status' => $result['data'][0]['status'] ?? 'unknown',
                ]);

                return [
                    'success' => true,
                    'data' => $result,
                ];
            }

            Log::error('Error enviando notificación push', [
                'status' => $response->status(),
                'response' => $response->body(),
            ]);

            return [
                'success' => false,
                'error' => 'Error en la API de Expo: ' . $response->body(),
            ];

        } catch (\Exception $e) {
            Log::error('Excepción enviando notificación push', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Enviar notificación push a múltiples tokens
     *
     * @param array $expoPushTokens Array de tokens de Expo
     * @param string $title Título de la notificación
     * @param string $body Cuerpo de la notificación
     * @param array $data Datos adicionales
     * @param array $options Opciones adicionales
     * @return array
     */
    public function sendPushNotifications(
        array $expoPushTokens,
        string $title,
        string $body,
        array $data = [],
        array $options = []
    ): array {
        $results = [];
        
        foreach ($expoPushTokens as $token) {
            if (!empty($token)) {
                $results[] = $this->sendPushNotification($token, $title, $body, $data, $options);
            }
        }

        return $results;
    }

    /**
     * Enviar notificación de nuevo visitante
     *
     * @param string $expoPushToken
     * @param \App\Models\Visitor $visitor
     * @return array
     */
    public function sendNewVisitorNotification(string $expoPushToken, $visitor): array
    {
        $title = '🏠 Nuevo Visitante';
        $body = "Visitante: {$visitor->name}";
        
        $data = [
            'type' => 'new_visitor',
            'visitor_id' => $visitor->id,
            'visitor_name' => $visitor->name,
            'id_document' => $visitor->id_document,
            'entry_time' => $visitor->entry_time?->toISOString(),
        ];

        return $this->sendPushNotification($expoPushToken, $title, $body, $data);
    }

    /**
     * Enviar notificación de solicitud de aprobación
     *
     * @param string $expoPushToken
     * @param \App\Models\Visitor $visitor
     * @return array
     */
    public function sendApprovalRequestNotification(string $expoPushToken, $visitor): array
    {
        $title = '🔔 Solicitud de Aprobación';
        $body = "Visitante: {$visitor->name} solicita acceso";
        
        $data = [
            'type' => 'approval_request',
            'visitor_id' => $visitor->id,
            'visitor_name' => $visitor->name,
            'id_document' => $visitor->id_document,
            'approval_token' => $visitor->approval_token,
            'approve_url' => route('approval.approve.public', $visitor->approval_token),
            'reject_url' => route('approval.reject.public', $visitor->approval_token),
        ];

        return $this->sendPushNotification($expoPushToken, $title, $body, $data, [
            'priority' => 'high',
        ]);
    }

    /**
     * Enviar notificación de QR usado
     *
     * @param string $expoPushToken
     * @param \App\Models\QrCode $qrCode
     * @return array
     */
    public function sendQrUsedNotification(string $expoPushToken, $qrCode): array
    {
        $title = '✅ QR Utilizado';
        $body = "QR usado por: {$qrCode->visitor_name}";
        
        $data = [
            'type' => 'qr_used',
            'qr_code_id' => $qrCode->id,
            'qr_id' => $qrCode->qr_id,
            'visitor_name' => $qrCode->visitor_name,
            'current_uses' => $qrCode->current_uses,
            'max_uses' => $qrCode->max_uses,
        ];

        return $this->sendPushNotification($expoPushToken, $title, $body, $data);
    }

    /**
     * Enviar notificación de estado de aprobación
     *
     * @param string $expoPushToken
     * @param \App\Models\Visitor $visitor
     * @param string $status 'approved' | 'rejected' | 'auto_approved'
     * @return array
     */
    public function sendApprovalStatusNotification(string $expoPushToken, $visitor, string $status): array
    {
        $titles = [
            'approved' => '✅ Visita Aprobada',
            'rejected' => '❌ Visita Rechazada',
            'auto_approved' => '⏰ Visita Auto-Aprobada',
        ];

        $title = $titles[$status] ?? '📋 Estado de Visita';
        $body = "Visitante: {$visitor->name} - " . ucfirst($status);
        
        $data = [
            'type' => 'approval_status',
            'visitor_id' => $visitor->id,
            'visitor_name' => $visitor->name,
            'status' => $status,
        ];

        return $this->sendPushNotification($expoPushToken, $title, $body, $data);
    }
}

