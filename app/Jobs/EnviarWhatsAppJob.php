<?php

namespace App\Jobs;

use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class EnviarWhatsAppJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $numero;
    public $tipo;
    public $datos;
    public $tries = 3; // Reintentos
    public $timeout = 30; // Timeout en segundos

    public function __construct($numero, $tipo, $datos = [])
    {
        $this->numero = $numero;
        $this->tipo = $tipo;
        $this->datos = $datos;
    }

    public function handle(WhatsAppService $whatsapp)
    {
        try {
            $resultado = null;

            switch ($this->tipo) {
                case 'nuevo_visitante':
                    $resultado = $whatsapp->nuevoVisitante($this->numero, $this->datos['visitante']);
                    break;

                case 'qr_usado':
                    $resultado = $whatsapp->qrUsado($this->numero, $this->datos['qr_code']);
                    break;

                case 'qr_por_expirar':
                    $resultado = $whatsapp->qrPorExpirar(
                        $this->numero,
                        $this->datos['qr_code'],
                        $this->datos['horas_restantes']
                    );
                    break;

                case 'registro_exitoso':
                    $resultado = $whatsapp->registroExitoso($this->numero, $this->datos['usuario']);
                    break;

                case 'alerta_seguridad':
                    $resultado = $whatsapp->alertaSeguridad(
                        $this->numero,
                        $this->datos['evento'],
                        $this->datos['detalles'] ?? []
                    );
                    break;

                case 'mensaje_personalizado':
                    $resultado = $whatsapp->enviarMensaje($this->numero, $this->datos['mensaje']);
                    break;

                default:
                    Log::warning("Tipo de WhatsApp no reconocido: {$this->tipo}");
                    return;
            }

            if ($resultado && !$resultado['success']) {
                Log::error("Error en WhatsApp Job", [
                    'tipo' => $this->tipo,
                    'numero' => $this->numero,
                    'error' => $resultado['error']
                ]);

                // Si falla, reintentamos
                $this->fail(new \Exception($resultado['error']));
            }

        } catch (\Exception $e) {
            Log::error("Excepción en WhatsApp Job", [
                'tipo' => $this->tipo,
                'numero' => $this->numero,
                'error' => $e->getMessage()
            ]);

            throw $e; // Re-lanzar para que el job se marque como fallido
        }
    }

    /**
     * Manejar fallos del job
     */
    public function failed(\Throwable $exception)
    {
        Log::error("WhatsApp Job falló definitivamente", [
            'tipo' => $this->tipo,
            'numero' => $this->numero,
            'intentos' => $this->attempts(),
            'error' => $exception->getMessage()
        ]);
    }
}
