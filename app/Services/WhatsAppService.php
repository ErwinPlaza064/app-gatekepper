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
