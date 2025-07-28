<?php
// app/Services/WhatsAppService.php

namespace App\Services;

use Twilio\Rest\Client;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    private $twilio;
    private $from;

    public function __construct()
    {
        $this->twilio = new Client(
            config('services.twilio.sid'),
            config('services.twilio.token')
        );
        $this->from = config('services.twilio.whatsapp_from');
    }

    /**
     * Enviar mensaje de WhatsApp
     */
    public function enviarMensaje($numero, $mensaje)
    {
        try {
            // Formatear número para WhatsApp
            $numeroFormateado = $this->formatearNumero($numero);

            $message = $this->twilio->messages->create(
                "whatsapp:{$numeroFormateado}",
                [
                    'from' => $this->from,
                    'body' => $mensaje
                ]
            );

            Log::info("WhatsApp enviado exitosamente", [
                'sid' => $message->sid,
                'numero' => $numeroFormateado,
                'mensaje' => substr($mensaje, 0, 50) . '...'
            ]);

            return [
                'success' => true,
                'sid' => $message->sid,
                'mensaje' => 'Mensaje enviado correctamente'
            ];

        } catch (\Exception $e) {
            Log::error("Error enviando WhatsApp", [
                'numero' => $numero,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Notificación de nuevo visitante
     */
    public function nuevoVisitante($numero, $visitante)
    {
        $mensaje = "🏠 *Nuevo Visitante* 🏠\n\n" .
                  "👤 Visitante: {$visitante->name}\n" .
                  "🆔 Documento: {$visitante->id_document}\n" .
                  "🕐 Hora de entrada: " . $visitante->entry_time->format('H:i d/m/Y') . "\n";

        if ($visitante->vehicle_plate) {
            $mensaje .= "🚗 Vehículo: {$visitante->vehicle_plate}\n";
        }

        if ($visitante->qrCode) {
            $mensaje .= "📱 Acceso: Código QR\n";
        } else {
            $mensaje .= "📱 Acceso: Manual\n";
        }

        $mensaje .= "\n🏘️ Sistema: Gatekeeper";

        return $this->enviarMensaje($numero, $mensaje);
    }

    /**
     * Notificación de QR usado
     */
    public function qrUsado($numero, $qrCode)
    {
        $mensaje = "✅ *QR Utilizado* ✅\n\n" .
                  "👤 Visitante: {$qrCode->visitor_name}\n" .
                  "🆔 Documento: {$qrCode->document_id}\n" .
                  "📊 Uso: {$qrCode->current_uses}/{$qrCode->max_uses}\n" .
                  "🕐 Hora: " . now()->format('H:i d/m/Y') . "\n";

        if ($qrCode->current_uses >= $qrCode->max_uses) {
            $mensaje .= "\n⚠️ *QR agotado* - No más usos disponibles";
        }

        $mensaje .= "\n\n🏘️ Sistema: Gatekeeper";

        return $this->enviarMensaje($numero, $mensaje);
    }

    /**
     * Notificación de QR próximo a expirar
     */
    public function qrPorExpirar($numero, $qrCode, $horasRestantes)
    {
        $mensaje = "⏰ *QR Próximo a Expirar* ⏰\n\n" .
                  "👤 Visitante: {$qrCode->visitor_name}\n" .
                  "⏱️ Expira en: {$horasRestantes} horas\n" .
                  "📅 Fecha límite: " . $qrCode->valid_until->format('H:i d/m/Y') . "\n\n" .
                  "💡 Genera un nuevo QR si es necesario\n\n" .
                  "🏘️ Sistema: Gatekeeper";

        return $this->enviarMensaje($numero, $mensaje);
    }

    /**
     * Registro exitoso de usuario
     */
    public function registroExitoso($numero, $usuario)
    {
        $mensaje = "🎉 *¡Bienvenido a Gatekeeper!* 🎉\n\n" .
                  "👤 Usuario: {$usuario->name}\n" .
                  "📧 Email: {$usuario->email}\n" .
                  "🏠 Dirección: {$usuario->address}\n" .
                  "📅 Fecha: " . now()->format('H:i d/m/Y') . "\n\n" .
                  "✅ Tu cuenta ha sido creada exitosamente\n" .
                  "📱 Ya puedes generar códigos QR para tus visitantes\n\n" .
                  "🏘️ Sistema: Gatekeeper";

        return $this->enviarMensaje($numero, $mensaje);
    }

    /**
     * Alerta de seguridad para administradores
     */
    public function alertaSeguridad($numero, $evento, $detalles = [])
    {
        $mensaje = "🚨 *Alerta de Seguridad* 🚨\n\n" .
                  "📍 Evento: {$evento}\n" .
                  "🕐 Hora: " . now()->format('H:i d/m/Y') . "\n";

        foreach ($detalles as $key => $value) {
            $mensaje .= "• {$key}: {$value}\n";
        }

        $mensaje .= "\n🏘️ Sistema: Gatekeeper";

        return $this->enviarMensaje($numero, $mensaje);
    }

    /**
     * Formatear número de teléfono para WhatsApp
     */
    private function formatearNumero($numero)
    {
        // Limpiar el número
        $numero = preg_replace('/[^0-9]/', '', $numero);

        // Si empieza con 52 (México), mantenerlo
        if (substr($numero, 0, 2) === '52') {
            return '+' . $numero;
        }

        // Si empieza con 1, asumir que es celular mexicano
        if (substr($numero, 0, 1) === '1') {
            return '+52' . $numero;
        }

        // Si son 10 dígitos, agregar código de país México
        if (strlen($numero) === 10) {
            return '+521' . $numero;
        }

        // Si no tiene código de país, agregarlo
        if (!str_starts_with($numero, '+')) {
            return '+52' . $numero;
        }

        return $numero;
    }
}
