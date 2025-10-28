<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendGridService
{
    private $apiKey;
    private $baseUrl = 'https://api.sendgrid.com/v3/mail/send';

    public function __construct()
    {
        $this->apiKey = config('services.sendgrid.api_key');
    }

    /**
     * Enviar email usando SendGrid API
     */
    public function sendEmail($to, $subject, $content, $from = null, $fromName = null)
    {
        try {
            $from = $from ?: config('mail.from.address');
            $fromName = $fromName ?: config('mail.from.name');

            $payload = [
                'personalizations' => [
                    [
                        'to' => [
                            [
                                'email' => $to,
                                'name' => $to
                            ]
                        ],
                        'subject' => $subject
                    ]
                ],
                'from' => [
                    'email' => $from,
                    'name' => $fromName
                ],
                'content' => [
                    [
                        'type' => 'text/html',
                        'value' => $content
                    ]
                ]
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl, $payload);

            if ($response->successful()) {
                Log::info('SendGrid email sent successfully', [
                    'to' => $to,
                    'subject' => $subject,
                    'status_code' => $response->status()
                ]);

                return [
                    'success' => true,
                    'message' => 'Email sent successfully',
                    'response' => $response->json()
                ];
            } else {
                Log::error('SendGrid email failed', [
                    'to' => $to,
                    'subject' => $subject,
                    'status_code' => $response->status(),
                    'response' => $response->body()
                ]);

                return [
                    'success' => false,
                    'error' => 'SendGrid API error: ' . $response->body(),
                    'status_code' => $response->status()
                ];
            }

        } catch (\Exception $e) {
            Log::error('SendGrid service exception', [
                'to' => $to,
                'subject' => $subject,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Exception: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Enviar notificación de visitante usando template HTML
     */
    public function sendVisitorNotification($to, $visitor, $approveUrl, $rejectUrl)
    {
        $subject = '🔔 Nueva Solicitud de Visita - Gatekeeper';

        $content = $this->buildVisitorNotificationHTML($visitor, $approveUrl, $rejectUrl);

        return $this->sendEmail($to, $subject, $content);
    }

    /**
     * Construir HTML para notificación de visitante
     */
    private function buildVisitorNotificationHTML($visitor, $approveUrl, $rejectUrl)
    {
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
                    <p>Nueva Solicitud de Visita</p>
                </div>

                <div class="content">
                    <h2>Hola,</h2>
                    <p>Tienes una nueva solicitud de visita que requiere tu aprobación:</p>

                    <div class="visitor-info">
                        <h3>📋 Información del Visitante</h3>
                        <p><strong>👤 Nombre:</strong> ' . $visitor->name . '</p>
                        <p><strong>🆔 Documento:</strong> ' . $visitor->id_document . '</p>
                        <p><strong>🕐 Hora de solicitud:</strong> ' . ($visitor->approval_requested_at ? $visitor->approval_requested_at->format('H:i d/m/Y') : now()->format('H:i d/m/Y')) . '</p>
                        ' . ($visitor->vehicle_plate ? '<p><strong>🚗 Vehículo:</strong> ' . $visitor->vehicle_plate . '</p>' : '') . '
                        ' . ($visitor->approval_notes ? '<p><strong>📝 Notas:</strong> ' . $visitor->approval_notes . '</p>' : '') . '
                    </div>

                    <div class="warning">
                        <p><strong>⏰ Tiempo para responder: 7 minutos</strong></p>
                        <p>Si no respondes a tiempo, el acceso será automáticamente aprobado por seguridad.</p>
                    </div>

                    <div class="actions">
                        <h3>Opciones de respuesta:</h3>
                        <a href="' . $approveUrl . '" class="btn btn-approve">✅ APROBAR VISITANTE</a>
                        <a href="' . $rejectUrl . '" class="btn btn-reject">❌ RECHAZAR VISITANTE</a>
                    </div>

                    <p>También puedes responder desde tu dashboard en la aplicación web.</p>
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
