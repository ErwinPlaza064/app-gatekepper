<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use App\Notifications\NewVisitorNotification;
use Illuminate\Support\Facades\Log;


class Visitor extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'id_document',
        'user_id',
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
            // Verifica que exista un usuario relacionado con este visitante antes de notificar
            if ($visitor->user) {
                $visitor->user->notify(new NewVisitorNotification($visitor));
            } else {
                Log::warning("No se pudo notificar al residente. No se encontró un usuario para el visitante con ID {$visitor->id}.");
            }
        });
    }
}
