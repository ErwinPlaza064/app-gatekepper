<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use App\Notifications\NewVisitorNotification;
use Illuminate\Support\Facades\Log;
use App\Jobs\EnviarWhatsAppJob;




class Visitor extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'id_document',
        'user_id',
        'qr_code_id',
        'entry_time',
        'exit_time',
        'vehicle_plate',
    ];

    protected $casts = [
        'entry_time' => 'datetime',
        'exit_time' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function qrCode()
    {
        return $this->belongsTo(QrCode::class);
    }


  protected static function booted()
{
    static::created(function ($visitor) {
        // Verificar que exista un usuario relacionado
        if ($visitor->user) {
            // Enviar notificación por email y database (como siempre)
            $visitor->user->notify(new NewVisitorNotification($visitor));

            // Enviar WhatsApp asíncrono si el usuario tiene teléfono y notificaciones habilitadas
            if ($visitor->user->phone && $visitor->user->whatsapp_notifications) {
                EnviarWhatsAppJob::dispatch(
                    $visitor->user->phone,
                    'nuevo_visitante',
                    ['visitante' => $visitor]
                );

                Log::info('WhatsApp programado para envío', [
                    'usuario' => $visitor->user->name,
                    'telefono' => $visitor->user->phone,
                    'visitante' => $visitor->name
                ]);
            }

            Log::info('Notificaciones enviadas a ' . $visitor->user->name . ' sobre el visitante ' . $visitor->name);
        } else {
            Log::warning("No se pudo notificar al residente. No se encontró un usuario para el visitante con ID {$visitor->id}.");
        }
    });
}
}
