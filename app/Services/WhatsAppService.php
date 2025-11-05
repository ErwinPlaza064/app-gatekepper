<?php
// app/Services/WhatsAppService.php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    private $apiKey;
    private $productId;
    private $phoneId;
    private $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.maytapi.api_key');
        $this->productId = config('services.maytapi.product_id');
        $this->phoneId = config('services.maytapi.phone_id');
        $this->baseUrl = 'https://api.maytapi.com/api';
    }

    /**
     * Enviar mensaje de WhatsApp usando Maytapi
     */
    public function enviarMensaje($numero, $mensaje)
    {
        try {
            // Formatear número para WhatsApp
            $numeroFormateado = $this->formatearNumero($numero);

            $response = Http::withHeaders([
                'x-maytapi-key' => $this->apiKey
            ])->post("{$this->baseUrl}/{$this->productId}/{$this->phoneId}/sendMessage", [
                'to_number' => $numeroFormateado,
                'type' => 'text',
                'message' => $mensaje
            ]);

            if ($response->successful()) {
                $data = $response->json();

                Log::info("WhatsApp enviado exitosamente", [
                    'numero' => $numeroFormateado,
                    'mensaje' => substr($mensaje, 0, 50) . '...',
                    'response' => $data
                ]);

                return [
                    'success' => true,
                    'data' => $data,
                    'mensaje' => 'Mensaje enviado correctamente'
                ];
            } else {
                Log::error("Error en respuesta de Maytapi", [
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);

                return [
                    'success' => false,
                    'error' => 'Error en la API: ' . $response->body()
                ];
            }

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
     * Notificación de nuevo visitante (igual que tu versión actual)
     */
    public function nuevoVisitante($numero, $visitante)
    {
        $entryTime = $visitante->entry_time 
            ? $visitante->entry_time->format('H:i d/m/Y') 
            : now()->format('H:i d/m/Y');
        
        $mensaje = "🏠 *Nuevo Visitante para tu domicilio* 🏠\n\n" .
                  "👤 Visitante: {$visitante->name}\n" .
                  "🆔 Documento: {$visitante->id_document}\n" .
                  "🕐 Hora de entrada: " . $entryTime . "\n";

        if ($visitante->vehicle_plate) {
            $mensaje .= "🚗 Vehículo: {$visitante->vehicle_plate}\n";
        }

        if ($visitante->qrCode) {
            $mensaje .= "📱 Acceso: Código QR\n";
        } else {
            $mensaje .= "📱 Acceso: Manual\n";
        }

        return $this->enviarMensaje($numero, $mensaje);
    }

    /**
     * Notificación de QR usado (igual que tu versión)
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
     * Solicitud de aprobación para visitante espontáneo
     */
    public function solicitudAprobacion($numero, $visitante, $approveUrl, $rejectUrl)
    {
        $entryTime = $visitante->entry_time 
            ? $visitante->entry_time->format('H:i d/m/Y') 
            : now()->format('H:i d/m/Y');
        
        $mensaje = "🔔 *Solicitud de Visita* 🔔\n\n" .
                  "👤 Visitante: {$visitante->name}\n" .
                  "🆔 Documento: {$visitante->id_document}\n" .
                  "🕐 Solicita acceso a las: " . $entryTime . "\n";

        if ($visitante->vehicle_plate) {
            $mensaje .= "🚗 Vehículo: {$visitante->vehicle_plate}\n";
        }

        if ($visitante->additional_info) {
            $mensaje .= "📝 Información adicional: {$visitante->additional_info}\n";
        }

        $mensaje .= "\n⏰ *Tienes 7 minutos para responder*\n" .
                   "Si no respondes, el acceso será automáticamente aprobado.\n\n" .
                   "👆 *Opciones de respuesta:*\n" .
                   "✅ APROBAR: {$approveUrl}\n" .
                   "❌ RECHAZAR: {$rejectUrl}\n\n" .
                   "🏘️ Sistema: Gatekeeper";

        return $this->enviarMensaje($numero, $mensaje);
    }

    /**
     * Confirmación de respuesta de aprobación
     */
    public function respuestaAprobacion($numero, $visitante, $accion)
    {
        $emoji = $accion === 'approved' ? '✅' : '❌';
        $status = $accion === 'approved' ? 'APROBADO' : 'RECHAZADO';

        $mensaje = "{$emoji} *Visita {$status}* {$emoji}\n\n" .
                  "👤 Visitante: {$visitante->name}\n" .
                  "🆔 Documento: {$visitante->id_document}\n" .
                  "🕐 Respuesta: " . now()->format('H:i d/m/Y') . "\n";

        if ($accion === 'approved' || $accion === 'auto_approved') {
            $mensaje .= "\n✅ El visitante puede ingresar ahora\n" .
                       "🔄 Se ha notificado al personal de seguridad\n";

            if ($accion === 'auto_approved') {
                $mensaje .= "⏰ *Aprobación automática por tiempo de espera*\n";
            }
        } else {
            $mensaje .= "\n❌ Acceso denegado\n" .
                       "🔄 Se ha notificado al personal de seguridad\n";
        }

        $mensaje .= "\n🏘️ Sistema: Gatekeeper";

        return $this->enviarMensaje($numero, $mensaje);
    }

    /**
     * Notificación para el portero/vigilante sobre decisión de visita
     */
    public function notificacionPortero($numero, $visitante, $status, $respondedBy = null)
    {
        $emoji = in_array($status, ['approved', 'auto_approved']) ? '✅' : '❌';
        $statusText = match($status) {
            'approved' => 'APROBADA',
            'auto_approved' => 'AUTO-APROBADA',
            'rejected' => 'RECHAZADA',
            default => 'ACTUALIZADA'
        };

        $mensaje = "{$emoji} *Visita {$statusText}* {$emoji}\n\n" .
                  "👤 Visitante: {$visitante->name}\n" .
                  "🆔 Documento: {$visitante->id_document}\n";
        
        if ($visitante->vehicle_plate) {
            $mensaje .= "🚗 Vehículo: {$visitante->vehicle_plate}\n";
        }

        $mensaje .= "🏠 Residente: {$visitante->user->name}\n" .
                   "📍 Dirección: {$visitante->user->address}\n";

        if ($respondedBy) {
            $mensaje .= "👤 Respondido por: {$respondedBy}\n";
        }

        $mensaje .= "🕐 Hora: " . now()->format('H:i d/m/Y') . "\n";

        if (in_array($status, ['approved', 'auto_approved'])) {
            $mensaje .= "\n✅ *PERMITIR ACCESO*\n";
            if ($status === 'auto_approved') {
                $mensaje .= "⏰ Aprobación automática (sin respuesta en 7 min)\n";
            }
        } else {
            $mensaje .= "\n❌ *DENEGAR ACCESO*\n" .
                       "No permitir el ingreso de esta persona\n";
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
