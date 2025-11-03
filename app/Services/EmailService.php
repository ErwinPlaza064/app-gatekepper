<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Mail\Message;
use Exception;

class EmailService
{
    private $sendgridApiKey;
    private $maxRetries = 3;
    private $retryDelay = 2; // segundos

    public function __construct()
    {
        $this->sendgridApiKey = env('SENDGRID_API_KEY');
    }

    /**
     * Enviar email con sistema de fallback
     * 1. Intenta con SendGrid API
     * 2. Si falla, intenta con SMTP
     * 3. Si ambos fallan, loguea el error
     */
    public function sendEmail($to, $subject, $content, $fromAddress = null, $fromName = null)
    {
        $fromAddress = $fromAddress ?? config('mail.from.address');
        $fromName = $fromName ?? config('mail.from.name');

        // Primer intento: SendGrid API
        try {
            $result = $this->sendWithSendGridAPI($to, $subject, $content, $fromAddress, $fromName);
            if ($result['success']) {
                Log::info('Email enviado exitosamente via SendGrid API', [
                    'to' => $to,
                    'subject' => $subject,
                    'method' => 'sendgrid_api'
                ]);
                return $result;
            }
        } catch (Exception $e) {
            Log::warning('SendGrid API falló, intentando con SMTP', [
                'to' => $to,
                'subject' => $subject,
                'error' => $e->getMessage()
            ]);
        }

        // Segundo intento: SMTP con retry
        try {
            $result = $this->sendWithSMTP($to, $subject, $content, $fromAddress, $fromName);
            if ($result['success']) {
                Log::info('Email enviado exitosamente via SMTP fallback', [
                    'to' => $to,
                    'subject' => $subject,
                    'method' => 'smtp_fallback'
                ]);
                return $result;
            }
        } catch (Exception $e) {
            Log::error('Todos los métodos de envío de email fallaron', [
                'to' => $to,
                'subject' => $subject,
                'smtp_error' => $e->getMessage()
            ]);
        }

        // Si ambos métodos fallan, intentar con log como último recurso
        return $this->sendWithLog($to, $subject, $content, $fromAddress, $fromName);
    }

    /**
     * Enviar con SendGrid API
     */
    private function sendWithSendGridAPI($to, $subject, $content, $fromAddress, $fromName)
    {
        if (empty($this->sendgridApiKey)) {
            throw new Exception('SendGrid API key not configured');
        }

        $payload = [
            'personalizations' => [
                [
                    'to' => [
                        ['email' => $to]
                    ],
                    'subject' => $subject
                ]
            ],
            'from' => [
                'email' => $fromAddress,
                'name' => $fromName
            ],
            'content' => [
                [
                    'type' => 'text/html',
                    'value' => $content
                ]
            ]
        ];

        $response = Http::timeout(30)
            ->withHeaders([
                'Authorization' => 'Bearer ' . $this->sendgridApiKey,
                'Content-Type' => 'application/json',
            ])
            ->post('https://api.sendgrid.com/v3/mail/send', $payload);

        if ($response->successful()) {
            return [
                'success' => true,
                'method' => 'sendgrid_api',
                'status_code' => $response->status()
            ];
        }

        throw new Exception('SendGrid API error: ' . $response->body());
    }

    /**
     * Enviar con SMTP con retry automático
     */
    private function sendWithSMTP($to, $subject, $content, $fromAddress, $fromName)
    {
        $attempts = 0;
        $lastException = null;

        while ($attempts < $this->maxRetries) {
            try {
                $attempts++;

                Mail::html($content, function (Message $message) use ($to, $subject, $fromAddress, $fromName) {
                    $message->to($to)
                        ->subject($subject)
                        ->from($fromAddress, $fromName);
                });

                return [
                    'success' => true,
                    'method' => 'smtp',
                    'attempts' => $attempts
                ];

            } catch (Exception $e) {
                $lastException = $e;

                if ($attempts < $this->maxRetries) {
                    Log::warning("SMTP intento {$attempts} falló, reintentando en {$this->retryDelay} segundos", [
                        'to' => $to,
                        'error' => $e->getMessage()
                    ]);
                    sleep($this->retryDelay);
                }
            }
        }

        throw $lastException ?: new Exception('SMTP failed after all retries');
    }

    /**
     * Fallback final: guardar en log
     */
    private function sendWithLog($to, $subject, $content, $fromAddress, $fromName)
    {
        Log::info('EMAIL FALLBACK - Guardado en log por falla de envío', [
            'to' => $to,
            'subject' => $subject,
            'from' => $fromAddress,
            'from_name' => $fromName,
            'content_preview' => substr(strip_tags($content), 0, 200) . '...',
            'timestamp' => now()->toDateTimeString()
        ]);

        return [
            'success' => true,
            'method' => 'log_fallback',
            'message' => 'Email guardado en log por falla de servicios de envío'
        ];
    }

    /**
     * Método específico para notificación de visitantes
     */
    public function sendVisitorNotification($to, $visitor, $approveUrl = null, $rejectUrl = null)
    {
        $subject = '🏠 Nuevo visitante registrado - Gatekeeper';
        $content = $this->buildVisitorNotificationHTML($visitor, $approveUrl, $rejectUrl);

        return $this->sendEmail($to, $subject, $content);
    }

    /**
     * Método específico para notificación de uso de QR
     */
    public function sendQrUsedNotification($to, $qrCode, $usageDetails = [])
    {
        $subject = '🔑 Tu código QR ha sido utilizado - Gatekeeper';
        $content = $this->buildQrUsedNotificationHTML($qrCode, $usageDetails);

        return $this->sendEmail($to, $subject, $content);
    }

    /**
     * Construir HTML para notificación de visitante
     */
    private function buildVisitorNotificationHTML($visitor, $approveUrl = null, $rejectUrl = null)
    {
        $hasActions = !empty($approveUrl) && !empty($rejectUrl);

        $actionsHtml = '';
        if ($hasActions) {
            $actionsHtml = '
            <div class="warning">
                <p><strong>⏰ Tiempo para responder: 7 minutos</strong></p>
                <p>Si no respondes a tiempo, el acceso será automáticamente aprobado por seguridad.</p>
            </div>
            <div class="actions">
                <h3>Opciones de respuesta:</h3>
                <a href="' . $approveUrl . '" class="btn btn-approve">✅ APROBAR VISITANTE</a>
                <a href="' . $rejectUrl . '" class="btn btn-reject">❌ RECHAZAR VISITANTE</a>
            </div>';
        }

        return '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
                .visitor-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4F46E5; }
                .actions { text-align: center; margin: 30px 0; }
                .btn { display: inline-block; padding: 12px 24px; margin: 0 10px; text-decoration: none; border-radius: 6px; font-weight: bold; }
                .btn-approve { background: #10B981; color: white; }
                .btn-reject { background: #EF4444; color: white; }
                .footer { background: #374151; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; }
                .warning { background: #FEF3C7; border: 1px solid #F59E0B; color: #92400E; padding: 15px; border-radius: 6px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏘️ Gatekeeper</h1>
                    <p>Notificación de visitante</p>
                </div>
                <div class="content">
                    <h2>Hola,</h2>
                    <p>Te informamos sobre el registro de un visitante:</p>
                    <div class="visitor-info">
                        <h3>📋 Información del Visitante</h3>
                        <p><strong>👤 Nombre:</strong> ' . ($visitor->name ?? $visitor->visitor_name ?? 'Sin nombre') . '</p>
                        <p><strong>🆔 Documento:</strong> ' . ($visitor->id_document ?? 'Sin documento') . '</p>
                        <p><strong>🕐 Hora de registro:</strong> ' . now()->format('H:i d/m/Y') . '</p>
                        ' . (isset($visitor->vehicle_plate) && $visitor->vehicle_plate ? '<p><strong>🚗 Vehículo:</strong> ' . $visitor->vehicle_plate . '</p>' : '') . '
                    </div>
                    ' . $actionsHtml . '
                    <p>Gracias por usar Gatekeeper.</p>
                </div>
                <div class="footer">
                    <p>Este email fue enviado por Gatekeeper</p>
                    <p>Sistema de Control de Acceso</p>
                </div>
            </div>
        </body>
        </html>';
    }

    /**
     * Construir HTML para notificación de uso de QR
     */
    private function buildQrUsedNotificationHTML($qrCode, $usageDetails = [])
    {
        $isLastUse = $qrCode->current_uses >= $qrCode->max_uses;

        return '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
                .qr-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981; }
                .warning { background: #FEF3C7; border: 1px solid #F59E0B; color: #92400E; padding: 15px; border-radius: 6px; margin: 20px 0; }
                .alert { background: #FEE2E2; border: 1px solid #EF4444; color: #B91C1C; padding: 15px; border-radius: 6px; margin: 20px 0; }
                .footer { background: #374151; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; }
                .btn { display: inline-block; padding: 12px 24px; margin: 20px 0; text-decoration: none; border-radius: 6px; font-weight: bold; background: #4F46E5; color: white; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔑 Gatekeeper</h1>
                    <p>Código QR Utilizado</p>
                </div>
                <div class="content">
                    <h2>Hola,</h2>
                    <p>Te informamos que tu código QR ha sido utilizado exitosamente.</p>
                    <div class="qr-info">
                        <h3>📋 Detalles del Acceso</h3>
                        <p><strong>👤 Visitante:</strong> ' . $qrCode->visitor_name . '</p>
                        <p><strong>🕐 Hora de acceso:</strong> ' . now()->format('H:i d/m/Y') . '</p>
                        <p><strong>📊 Uso actual:</strong> ' . $qrCode->current_uses . '/' . $qrCode->max_uses . '</p>
                    </div>
                    ' . ($isLastUse ?
                        '<div class="alert">
                            <p><strong>⚠️ Código QR agotado</strong></p>
                            <p>Este código QR ha alcanzado el límite máximo de usos y ya no estará disponible.</p>
                        </div>' : '') . '
                    <a href="' . url('/resident/dashboard') . '" class="btn">Ver Dashboard</a>
                    <p>Gracias por usar nuestro sistema de gestión de visitantes.</p>
                </div>
                <div class="footer">
                    <p>Este email fue enviado por Gatekeeper</p>
                    <p>Sistema de Control de Acceso</p>
                </div>
            </div>
        </body>
        </html>';
    }
}
