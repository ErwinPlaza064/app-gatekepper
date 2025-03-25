<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable; // Importa el trait Notifiable
use App\Notifications\NewVisitorNotification; // Asegúrate de importar la notificación

class Visitor extends Model
{
    use HasFactory, Notifiable; // Usa el trait Notifiable para poder enviar notificaciones

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

    // Relación con el modelo User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    protected static function booted()
    {
        static::created(function ($visitor) {
            $visitor->user->notify(new NewVisitorNotification($visitor));
        });
    }
}
